import { createOTP, findUserByEmail } from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, mode } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // For registration: check if user already exists
    if (mode === 'register') {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    await createOTP(email, otp);

    // Send OTP via email
    const result = await sendOTPEmail(email, otp);
    if (!result) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
