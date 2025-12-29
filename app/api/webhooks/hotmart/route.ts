import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase.server';

const supabase = createSupabaseAdmin();
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
 * - PURCHASE_COMPLETE: Renovação aprovada → renovar assinatura
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar assinatura/token da Hotmart (implementar conforme documentação)
    const hotmartToken = request.headers.get('x-hotmart-hottok');
    const expectedToken = process.env.HOTMART_WEBHOOK_SECRET;
    
    if (hotmartToken !== expectedToken) {
      console.error('Invalid Hotmart token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extrair dados do evento
    const event = body.event;
    const eventType = event || body.event_type;
    const data = body.data || body;

    // Logar evento no banco
    await supabase.from('hotmart_events').insert({
      event_type: eventType,
      event_data: body,
      hotmart_subscription_id: data.subscription?.subscriber?.code,
      hotmart_purchase_id: data.purchase?.transaction,
      processed: false,
    });

    // Processar evento
    const result = await processHotmartEvent(eventType, data);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function processHotmartEvent(eventType: string, data: any) {
  try {
    // Extrair email do comprador
    const buyerEmail = data.buyer?.email || data.purchase?.buyer?.email;
    
    if (!buyerEmail) {
      throw new Error('Buyer email not found in webhook data');
    }

    // Buscar usuário pelo email
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', buyerEmail)
      .single();

    if (userError || !userData) {
      console.error('User not found:', buyerEmail);
      // Usuário ainda não criou conta - evento será processado quando criar
      return { success: true, message: 'User not found yet' };
    }

    const userId = userData.id;

    // Processar conforme tipo de evento
    switch (eventType) {
      case 'PURCHASE_APPROVED':
      case 'PURCHASE_COMPLETE':
        // Pagamento aprovado ou renovação → ativar assinatura
        await activateSubscription(userId, {
          subscription_id: data.subscription?.subscriber?.code,
          purchase_id: data.purchase?.transaction,
          starts_at: data.purchase?.approved_date,
          expires_at: data.subscription?.date_next_charge,
        });
        break;

      case 'PURCHASE_CANCELED':
      case 'PURCHASE_CHARGEBACK':
      case 'PURCHASE_REFUNDED':
      case 'SUBSCRIPTION_CANCELLATION':
      case 'PURCHASE_DELAYED':
        // Cancelamento, chargeback, reembolso ou inadimplência → desativar
        await deactivateSubscription(userId);
        break;

      case 'SUBSCRIPTION_RENEWAL':
        // Renovação anual → renovar assinatura
        await renewSubscription(
          userId,
          data.subscription?.date_next_charge
        );
        break;

      default:
        console.log('Unhandled event type:', eventType);
    }

    // Marcar evento como processado
    await supabase
      .from('hotmart_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('hotmart_purchase_id', data.purchase?.transaction);

    return { success: true };
  } catch (error: any) {
    console.error('Error processing event:', error);
    
    // Salvar erro no log
    await supabase
      .from('hotmart_events')
      .update({ error_message: error.message })
      .eq('hotmart_purchase_id', data.purchase?.transaction);

    return { success: false, error: error.message };
  }
}

// Permitir GET para teste
export async function GET() {
  return NextResponse.json({
    status: 'Hotmart webhook endpoint is running',
    timestamp: new Date().toISOString(),
  });
}
