// lib/subscription.ts
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
 * Sempre usa admin (service role) porque:
 * - subscriptions e hotmart_events são tabelas do seu banco
 * - essa lib é usada em /api/webhooks (server)
 */
function getAdmin() {
  return createSupabaseAdmin();
}

/**
 * Verifica se o usuário tem assinatura ativa
 * Regras:
 * - status deve ser 'active'
 * - expires_at (se existir) deve ser >= agora
 */
export async function checkSubscriptionStatus(
  userId: string
): Promise<{
  isActive: boolean;
  subscription: Subscription | null;
  reason?: string;
}> {
  const supabase = getAdmin();

  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return {
        isActive: false,
        subscription: null,
        reason: 'Assinatura não encontrada',
      };
    }

    if (subscription.status !== 'active') {
      return {
        isActive: false,
        subscription,
        reason: 'Assinatura inativa',
      };
    }

    if (subscription.expires_at) {
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();

      if (expiresAt < now) {
        return {
          isActive: false,
          subscription,
          reason: 'Assinatura expirada',
        };
      }
    }

    return {
      isActive: true,
      subscription,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      isActive: false,
      subscription: null,
      reason: 'Erro ao verificar assinatura',
    };
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
  const supabase = getAdmin();

  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: 'annual',
        ...data,
      })
      .select('*')
      .single();

    if (error) throw error;

    return { success: true as const, subscription };
  } catch (error) {
    console.error('Error upserting subscription:', error);
    return { success: false as const, error };
  }
}

/**
 * Ativa assinatura (pagamento aprovado)
 */
export async function activateSubscription(
  userId: string,
  hotmartData: {
    subscription_id?: string | null;
    purchase_id?: string | null;
    starts_at?: string | null;
    expires_at?: string | null;
  }
) {
  const startsAt = hotmartData.starts_at || new Date().toISOString();

  const expiresAt =
    hotmartData.expires_at ||
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // +1 ano

  return upsertSubscription(userId, {
    status: 'active',
    starts_at: startsAt,
    expires_at: expiresAt,
    hotmart_subscription_id: hotmartData.subscription_id || undefined,
    hotmart_purchase_id: hotmartData.purchase_id || undefined,
  });
}

/**
 * Desativa assinatura (cancelamento, inadimplência, chargeback)
 */
export async function deactivateSubscription(userId: string) {
  return upsertSubscription(userId, {
    status: 'inactive',
  });
}

/**
 * Renova assinatura (renovação anual aprovada)
 */
export async function renewSubscription(userId: string, expiresAt?: string | null) {
  const newExpiresAt =
    expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // +1 ano

  return upsertSubscription(userId, {
    status: 'active',
    expires_at: newExpiresAt,
  });
}

