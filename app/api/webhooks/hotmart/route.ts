// app/api/webhooks/hotmart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase.server';
import {
  activateSubscription,
  deactivateSubscription,
  renewSubscription,
} from '@/lib/subscription.server';

const supabase = createSupabaseAdmin();

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

async function findUserIdByEmail(email: string) {
  const target = email.toLowerCase();
  const perPage = 200;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find(
      (u) => (u.email || '').toLowerCase() === target
    );

    if (user?.id) return user.id;
    if (data.users.length < perPage) break;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const expectedToken = process.env.HOTMART_WEBHOOK_SECRET;
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const hotmartToken = req.headers.get('x-hotmart-hottok');
    if (hotmartToken !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const eventType = getEventType(body);
    const data = getData(body);

    const buyerEmail = getBuyerEmail(data);
    if (!buyerEmail) {
      return NextResponse.json(
        { error: 'Buyer email not found' },
        { status: 400 }
      );
    }

    const userId = await findUserIdByEmail(buyerEmail);
    if (!userId) {
      return NextResponse.json({ success: true, message: 'User not found yet' });
    }

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
        console.log('Unhandled event:', eventType);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
