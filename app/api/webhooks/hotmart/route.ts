// app/api/webhooks/hotmart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase.server';
import {
  activateSubscription,
  deactivateSubscription,
  renewSubscription,
} from '@/lib/subscription.server';

type ProcessResult =
  | { success: true; message?: string }
  | { success: false; error: string };

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

export async function POST(request: NextRequest) {
  // ✅ Usamos createSupabaseAdmin normalmente
  const supabase = createSupabaseAdmin();

  try {
    const expectedToken = process.env.HOTMART_WEBHOOK_SECRET;

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

    // 1) Registra evento (log) - Corrigido com "as any" para evitar erro de build
    const { data: insertedEvent, error: insertError } = await (supabase
      .from('hotmart_events') as any)
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
    }

    // 2) Processa evento
    const result = await processHotmartEvent(supabase, eventType, data);

    // 3) Atualiza log
    const updatePayload = result.success
      ? { processed: true, processed_at: new Date().toISOString(), error_message: null }
      : { processed: false, error_message: result.error };

    if (insertedEvent?.id) {
      await (supabase.from('hotmart_events') as any).update(updatePayload).eq('id', insertedEvent.id);
    } else if (hotmartPurchaseId) {
      await (supabase
        .from('hotmart_events') as any)
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

async function processHotmartEvent(
  supabase: any,
  eventType: string,
  data: any
): Promise<ProcessResult> {
  try {
    const buyerEmail = getBuyerEmail(data);
    if (!buyerEmail) return { success: false, error: 'Buyer email not found in webhook data' };

    const target = buyerEmail.toLowerCase();
    const perPage = 200;

    let userId: string | null = null;

    for (let page = 1; page <= 20; page++) {
      const { data: usersData, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) throw error;

      const user = usersData.users.find((u: any) => (u.email || '').toLowerCase() === target);
      if (user?.id) {
        userId = user.id;
        break;
      }

      if (usersData.users.length < perPage) break;
    }

    if (!userId) {
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

export async function GET() {
  return NextResponse.json({
    status: 'Hotmart webhook endpoint is running',
    timestamp: new Date().toISOString(),
  });
}
