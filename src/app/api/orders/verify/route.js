import { auth } from '@/auth';
import { updateOrderPayment } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json();

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const order = await updateOrderPayment(orderId, {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
