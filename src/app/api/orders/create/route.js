import { auth } from '@/auth';
import { createOrder, processCodOrder } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendPushToUser, orderConfirmationPush } from '@/lib/push';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { items, total, shippingAddress, paymentMethod } = await req.json();

    if (paymentMethod === 'COD') {
      let order = await createOrder({
        userEmail: session.user.email,
        userName: session.user.name,
        items,
        total,
        shippingAddress,
        paymentMethod: 'COD',
      });

      order = await processCodOrder(order.id || order._id.toString());

      try {
        await sendOrderConfirmationEmail(order);
      } catch (err) {}
      try {
        await sendPushToUser(session.user.email, orderConfirmationPush(order));
      } catch (err) {}

      return NextResponse.json({
        orderId: order.id || order._id.toString(),
        cod: true
      });
    }

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
