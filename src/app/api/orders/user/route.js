import { auth } from '@/auth';
import { getOrdersByUserId } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await getOrdersByUserId(session.user.email);
  return NextResponse.json({ orders });
}
