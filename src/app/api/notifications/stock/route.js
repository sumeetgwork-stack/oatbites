import { auth } from '@/auth';
import { subscribeToRestock, unsubscribeFromRestock, isSubscribedToRestock } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET — check if user is subscribed
export async function GET(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ subscribed: false });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

  const subscribed = await isSubscribedToRestock(productId, session.user.email);
  return NextResponse.json({ subscribed });
}

// POST — subscribe to restock notification
export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Please login to get notified' }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

  await subscribeToRestock(productId, session.user.email);
  return NextResponse.json({ subscribed: true, message: 'You will be notified when this product is back in stock!' });
}

// DELETE — unsubscribe
export async function DELETE(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

  await unsubscribeFromRestock(productId, session.user.email);
  return NextResponse.json({ subscribed: false });
}
