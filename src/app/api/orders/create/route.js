import { auth } from '@/auth';
import { createOrder } from '@/lib/db';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items, total, shippingAddress } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const order = await createOrder({
      userEmail: session.user.email,
      userName: session.user.name,
      items,
      total,
      shippingAddress,
      razorpayOrderId: razorpayOrder.id,
    });

    return NextResponse.json({
      orderId: order.id || order._id.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
