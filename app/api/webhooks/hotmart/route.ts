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

const supabase = createSupabaseAdmin();

async function findUserIdByEmail(email: string) {
  const target = email.toLowerCase();
  const perPage = 200;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find((u) => (u.email || '').toLowerCase() === target);
    if (user?.id) return user.id;

    if (data.users.length < perPage) break;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const expectedToken = process.env.HOTMART_WEBHOOK_SECRET;
    if (!expectedToken) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const hotmartToken = request.headers.get('x-hotmart-hottok');
    if (hotmartToken !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const eventType = getEventType(body);
    const data = getData(body);

    const hotmartPurchaseId = getHotmartPurchaseId(data);
    const hotmartSubscriptionId = getHotmartSubscriptionId(data);

    const { data: insertedEvent } = await supabase
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

    const result = await processHotmartEvent(eventType, data);

    const updatePayload = result.success
      ? { processed: true, processed_at: new Date().toISOString(), error_message: null }
      : { processed: false, error_message: result.error };

    if (insertedEvent?.id) {
      await supabase.from('hotmart_events').update(updatePayload).eq('id', insertedEvent.id);
    } else if (hotmartPurchaseId) {
      await supabase.from('hotmart_events').update(updatePayload).eq('hotmart_purchase_id', hotmartPurchaseId);
    }

    if (result.success) return NextResponse.json({ success: true, message: result.message || 'ok' });
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}

async function processHotmartEvent(eventType: string, data: any): Promise<ProcessResult> {
  const buyerEmail = getBuyerEmail(data);
  if (!buyerEmail) return { success: false, error: 'Buyer email not found in webhook data' };

  const userId = await findUserIdByEmail(buyerEmail);
  if (!userId) return { success: true, message: 'User not found yet' };

  switch (eventType) {
    case 'PURCHASE_APPROVED':
    case 'PURCHASE_COMPLETE':
      await activateSubscription(userId, {
        subscription_id: getHotmartSubscriptionId(data),
        purchase_id: getHotmartPurchaseId(data),
        starts_at: data?.purchase?.approved_date,
        expires_at: data?.subscription?.date_next_charge,
      });
      break;

    case 'PURCHASE_CANCELED':
    case 'PURCHASE_CHARGEBACK':
    case 'PURCHASE_REFUNDED':
    case 'SUBSCRIPTION_CANCELLATION':
    case 'PURCHASE_DELAYED':
      await deactivateSubscription(userId);
      break;

    case 'SUBSCRIPTION_RENEWAL':
      await renewSubscription(userId, data?.subscription?.date_next_charge);
      break;

    default:
      // ignore
      break;
  }

  return { success: true };
}

