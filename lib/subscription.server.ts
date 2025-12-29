// lib/subscription.server.ts
import 'server-only';
import { createSupabaseAdmin } from '@/lib/supabase.server';

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'inactive';
  plan: string;
  starts_at: string | null;
  expires_at: string | null;
  hotmart_subscription_id: string | null;
  hotmart_purchase_id: string | null;
}

/**
 * Verifica se o usuário tem assinatura ativa
 */
export async function checkSubscriptionStatus(userId: string): Promise<{
  isActive: boolean;
  subscription: Subscription | null;
  reason?: string;
}> {
  const supabase = createSupabaseAdmin();

  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return { isActive: false, subscription: null, reason: 'Assinatura não encontrada' };
    }

    if (subscription.status !== 'active') {
      return { isActive: false, subscription, reason: 'Assinatura inativa' };
    }

    if (subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();
      if (expiresAt < now) {
        return { isActive: false, subscription, reason: 'Assinatura expirada' };
      }
    }

    return { isActive: true, subscription };
  } catch (err) {
    console.error('Error checking subscription:', err);
    return { isActive: false, subscription: null, reason: 'Erro ao verificar assinatura' };
  }
}

/**
 * Cria ou atualiza assinatura
 */
export async function upsertSubscription(
  userId: string,
  data: {
    status: 'active' | 'inactive';
    starts_at?: string;
    expires_at?: string;
    hotmart_subscription_id?: string;
    hotmart_purchase_id?: string;
  }
) {
  const supabase = createSupabaseAdmin();

  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: 'annual',
        ...data,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, subscription };
  } catch (err) {
    console.error('Error upserting subscription:', err);
    return { success: false, error: err };
  }
}

export async function activateSubscription(
  userId: string,
  hotmartData: {
    subscription_id?: string;
    purchase_id?: string;
    starts_at?: string;
    expires_at?: string;
  }
) {
  const startsAt = hotmartData.starts_at || new Date().toISOString();
  const expiresAt =
    hotmartData.expires_at ||
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  return upsertSubscription(userId, {
    status: 'active',
    starts_at: startsAt,
    expires_at: expiresAt,
    hotmart_subscription_id: hotmartData.subscription_id,
    hotmart_purchase_id: hotmartData.purchase_id,
  });
}

export async function deactivateSubscription(userId: string) {
  return upsertSubscription(userId, { status: 'inactive' });
}

export async function renewSubscription(userId: string, expiresAt?: string) {
  const newExpiresAt =
    expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  return upsertSubscription(userId, {
    status: 'active',
    expires_at: newExpiresAt,
  });
}
