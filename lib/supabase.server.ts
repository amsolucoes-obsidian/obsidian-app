// lib/supabase.server.ts
import { createSupabaseAdmin } from './supabase.server';

export async function checkSubscriptionStatusServer(userId: string) {
  const supabase = createSupabaseAdmin();

  try {
    // ✅ Casting para any para evitar o erro de 'never' no build
    const { data: subscription, error } = await (supabase
      .from('subscriptions') as any)
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return { isActive: false, subscription: null, reason: 'Assinatura não encontrada' };
    }

    // ✅ Casting do objeto subscription para any para acessar as propriedades sem erro
    const sub = subscription as any;

    if (sub.status !== 'active') {
      return { isActive: false, subscription: sub, reason: 'Assinatura inativa' };
    }

    const now = new Date();
    const expiresAt = sub.expires_at ? new Date(sub.expires_at) : null;

    if (expiresAt && expiresAt < now) {
      return { isActive: false, subscription: sub, reason: 'Assinatura expirada' };
    }

    return { isActive: true, subscription: sub };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { isActive: false, subscription: null, reason: 'Erro interno' };
  }
}

export async function activateSubscription(userId: string, details: any) {
  const supabase = createSupabaseAdmin();
  
  // ✅ Casting para any
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
