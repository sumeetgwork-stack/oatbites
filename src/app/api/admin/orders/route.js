import { auth } from '@/auth';
import { getAllOrders, updateOrderStatus } from '@/lib/db';
import { sendShippingUpdateEmail } from '@/lib/email';
import { sendPushToUser, shippingUpdatePush } from '@/lib/push';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}

export async function PATCH(req) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { orderId, status } = await req.json();
  const order = await updateOrderStatus(orderId, status);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Send shipping update email and push notification (async, non-blocking)
  if (['Shipped', 'Delivered', 'Processing'].includes(status)) {
    sendShippingUpdateEmail(order, status).catch(err => console.error('[Email] Background send failed:', err));
    sendPushToUser(order.userEmail, shippingUpdatePush(order, status)).catch(err => console.error('[Push] Background send failed:', err));
  }

  return NextResponse.json({ order });
}
