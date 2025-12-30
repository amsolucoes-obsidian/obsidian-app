import { createSupabaseAdmin } from './supabase.server';

export async function checkSubscriptionStatusServer(userId: string) {
  const supabase = createSupabaseAdmin();

  try {
    // 1. Forçamos a tabela como 'any'
    const { data, error } = await (supabase
      .from('subscriptions') as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    // 2. Criamos uma constante 'subscription' explicitamente como 'any'
    const subscription: any = data;

    if (error || !subscription) {
      return { isActive: false, subscription: null, reason: 'Assinatura não encontrada' };
    }

    // 3. Agora o TypeScript permitirá ler .status sem erro de 'never'
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

export async function activateSubscription(userId: string, details: any) {
  const supabase = createSupabaseAdmin();
  const table = supabase.from('subscriptions') as any;

  const { error } = await table.upsert({
    user_id: userId,
    status: 'active',
    hotmart_subscription_id: details.subscription_id,
    hotmart_purchase_id: details.purchase_id,
    starts_at: details.starts_at || new Date().toISOString(),
    expires_at: details.expires_at,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  return { success: true };
}

export async function deactivateSubscription(userId: string) {
  const supabase = createSupabaseAdmin();
  const { error } = await (supabase.from('subscriptions') as any)
    .update({ status: 'inactive', updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
}

export async function renewSubscription(userId: string, newExpiration: string) {
  const supabase = createSupabaseAdmin();
  const { error } = await (supabase.from('subscriptions') as any)
    .update({ 
      status: 'active', 
      expires_at: newExpiration, 
      updated_at: new Date().toISOString() 
    })
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
}