import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getCollection } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/cart — Fetch the logged-in user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const carts = await getCollection('carts');
    const cart = await carts.findOne({ email: session.user.email });

    return NextResponse.json({ items: cart?.items || [] });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// POST /api/cart — Save/update the logged-in user's cart
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await request.json();

    const carts = await getCollection('carts');
    await carts.updateOne(
      { email: session.user.email },
      {
        $set: {
          items: items || [],
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          email: session.user.email,
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Failed to save cart' }, { status: 500 });
  }
}
