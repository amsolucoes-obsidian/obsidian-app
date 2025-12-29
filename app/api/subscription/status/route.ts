// app/api/subscription/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkSubscriptionStatusServer } from '@/lib/subscription.server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const result = await checkSubscriptionStatusServer(userId);
  return NextResponse.json(result, { status: 200 });
}
