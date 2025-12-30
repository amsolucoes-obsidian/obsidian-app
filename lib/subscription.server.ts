import { createSupabaseAdmin } from './supabase.server';

export async function checkSubscriptionStatusServer(userId: string) {
  const supabase = createSupabaseAdmin();

  try {
    const { data, error }: any = await (supabase
      .from('subscriptions') as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return { isActive: false, subscription: null, reason: 'Assinatura não encontrada' };
    }

    // Blindagem contra erro de 'never'
    const subscription = JSON.parse(JSON.stringify(data));

    if (subscription.status !== 'active') {
      return { isActive: false, subscription, reason: 'Assinatura inativa' };
    }

    const now = new Date();
    const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;

    if (expiresAt && expiresAt < now) {
      return { isActive: false, subscription, reason: 'Assinatura expirada' };
    }

    return { isActive: true, subscription };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { isActive: false, subscription: null, reason: 'Erro interno' };
  }
}

// ... (mantenha as outras funções activateSubscription, deactivateSubscription, etc.)