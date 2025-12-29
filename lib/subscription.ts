// lib/subscription.ts (client-safe)

export async function getSubscriptionStatusClient(userId: string) {
  const res = await fetch(
    `/api/subscription/status?userId=${encodeURIComponent(userId)}`,
    { method: 'GET', cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch subscription status');
  }

  return res.json();
}



