// app/api/webhooks/hotmart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase.server';
import {
  activateSubscription,
  deactivateSubscription,
  renewSubscription,
} from '@/lib/subscription';

/**
 * Webhook Hotmart
 *
 * Eventos importantes:
 * - PURCHASE_APPROVED: Pagamento aprovado → ativar assinatura
 * - PURCHASE_CANCELED: Cancelamento → desativar assinatura
 * - PURCHASE_CHARGEBACK: Chargeback → desativar assinatura
 * - PURCHASE_REFUNDED: Reembolso → desativar assinatura
 * - SUBSCRIPTION_CANCELLATION: Cancelamento de assinatura → desativar
 * - PURCHASE_DELAYED: Inadimplência → desativar assinatura
 * - PURCHASE_COMPLETE: Pagamento/renovação aprovada → ativar/renovar
 * - SUBSCRIPTION_RENEWAL: Renovação anual → renovar
 */

type ProcessResult =
  | { success: true; message?: string }
  | { success: false; error: string };

// cria 1x (server-only)
const supabase = createSupabaseAdmin();

function getEventType(body: any) {
  return body?.event || body?.event_type || body?.type || 'UNKNOWN';
}

function getData(body: any) {
  return body?.data || body;
}

function getBuyerEmail(data: any) {
  return data?.buyer?.email || data?.purchase?.buyer?.email || null;
}

function getHotmartPurchaseId(data: any) {
  return data?.purchase?.transaction || data?.purchase?.id || null;
}

function getHotmartSubscriptionId(data: any) {
  return data?.subscription?.subscriber?.code || data?.subscription?.id || null;
}

/**
 * Busca userId por e-mail usando paginação na Admin API.
 * Evita carregar listas gigantescas de users sempre.
 */
async function findUserIdByEmail(email: string) {
  const target = email.toLowerCase();
  const perPage = 200; // bom equilíbrio

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find((u) => (u.email || '').toLowerCase() === target);
    if (user?.id) return user.id;

    // se veio menos que perPage, acabou a lista
    if (data.users.length < perPage) break;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const expectedToken = process.env.HOTMART_WEBHOOK_SECRET;

    // Segurança: não aceitar webhook sem segredo configurado
    if (!expectedToken) {
      console.error('HOTMART_WEBHOOK_SECRET is missing');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const hotmartToken = request.headers.get('x-hotmart-hottok');
    if (hotmartToken !== expectedToken) {
      console.error('Invalid Hotmart token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const eventType = getEventType(body);
    const data = getData(body);

    const hotmartPurchaseId = getHotmartPurchaseId(data);
    const hotmartSubscriptionId = getHotmartSubscriptionId(data);

    // 1) registra evento
    const { data: insertedEvent, error: insertError } = await supabase
      .from('hotmart_events')
      .insert({
        event_type: eventType,
        event_data: body,
        hotmart_subscription_id: hotmartSubscriptionId,
        hotmart_purchase_id: hotmartPurchaseId,
        processed: false,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting hotmart_events:', insertError);
      // não bloqueia o processamento, mas fica registrado no log do servidor
    }

    // 2) processa evento
    const result = await processHotmartEvent(eventType, data);

    // 3) atualiza log do evento
    const updatePayload = result.success
      ? { processed: true, processed_at: new Date().toISOString(), error_message: null }
      : { processed: false, error_message: result.error };

    if (insertedEvent?.id) {
      await supabase.from('hotmart_events').update(updatePayload).eq('id', insertedEvent.id);
    } else if (hotmartPurchaseId) {
      // fallback (menos confiável, mas melhor que nada)
      await supabase
        .from('hotmart_events')
        .update(updatePayload)
        .eq('hotmart_purchase_id', hotmartPurchaseId);
    }

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message || 'ok' });
    }

    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal error' },
      { status: 500 }
    );
  }
}

async function processHotmartEvent(eventType: string, data: any): Promise<ProcessResult> {
  try {
    const buyerEmail = getBuyerEmail(data);
    if (!buyerEmail) {
      return { success: false, error: 'Buyer email not found in webhook data' };
    }

    const userId = await findUserIdByEmail(buyerEmail);

    if (!userId) {
      // usuário ainda não criou conta
      return { success: true, message: 'User not found yet' };
    }

    switch (eventType) {
      case 'PURCHASE_APPROVED':
      case 'PURCHASE_COMPLETE': {
        await activateSubscription(userId, {
          subscription_id: getHotmartSubscriptionId(data),
          purchase_id: getHotmartPurchaseId(data),
          starts_at: data?.purchase?.approved_date,
          expires_at: data?.subscription?.date_next_charge,
        });
        break;
      }

      case 'PURCHASE_CANCELED':
      case 'PURCHASE_CHARGEBACK':
      case 'PURCHASE_REFUNDED':
      case 'SUBSCRIPTION_CANCELLATION':
      case 'PURCHASE_DELAYED': {
        await deactivateSubscription(userId);
        break;
      }

      case 'SUBSCRIPTION_RENEWAL': {
        await renewSubscription(userId, data?.subscription?.date_next_charge);
        break;
      }

      default:
        console.log('Unhandled event type:', eventType);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error processing event:', error);
    return { success: false, error: error?.message || 'Error processing event' };
  }
}

// Permitir GET para teste
export async function GET() {
  return NextResponse.json({
    status: 'Hotmart webhook endpoint is running',
    timestamp: new Date().toISOString(),
  });
}
