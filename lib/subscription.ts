// lib/subscription.ts (client-safe)
// Este arquivo pode ser importado por componentes client sem quebrar o build.

export type SubscriptionStatusResponse = {
  isActive: boolean;
  subscription: {
    id: string;
    user_id: string;
    status: 'active' | 'inactive';
    plan: string;
    starts_at: string | null;
    expires_at: string | null;
    hotmart_subscription_id: string | null;
    hotmart_purchase_id: string | null;
  } | null;
  reason?: string;
  error?: string;
};

export async function getSubscriptionStatusClient(
  userId: string
): Promise<SubscriptionStatusResponse> {
  if (!userId) {
    return {
      isActive: false,
      subscription: null,
      reason: 'Missing userId',
    };
  }

  const res = await fetch(
    `/api/subscription/status?userId=${encodeURIComponent(userId)}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  // tenta ler o json mesmo quando falha (pra pegar mensagem do server)
  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg =
      payload?.error ||
      payload?.reason ||
      `Failed to fetch subscription status (HTTP ${res.status})`;
    throw new Error(msg);
  }

  return payload as SubscriptionStatusResponse;
}



