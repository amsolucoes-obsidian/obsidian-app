// lib/subscription.ts (client-safe)
// Este arquivo pode ser importado por componentes "use client" sem quebrar o build.

export type SubscriptionStatusResponse = {
  isActive: boolean;
  subscription: any | null;
  reason?: string;
};

export async function getSubscriptionStatusClient(userId: string): Promise<SubscriptionStatusResponse> {
  const res = await fetch(
    `/api/subscription/status?userId=${encodeURIComponent(userId)}`,
    { method: 'GET', cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch subscription status');
  }

  return res.json();
}





