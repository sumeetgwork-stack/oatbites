import { auth } from '@/auth';
import { savePushSubscription, removePushSubscription } from '@/lib/push';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST — save push subscription
export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Please login first' }, { status: 401 });
  }

  const { subscription } = await req.json();
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  await savePushSubscription(session.user.email, subscription);
  return NextResponse.json({ success: true, message: 'Push notifications enabled!' });
}

// DELETE — remove push subscription
export async function DELETE(req) {
  const { endpoint } = await req.json();
  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
  }

  await removePushSubscription(endpoint);
  return NextResponse.json({ success: true });
}
