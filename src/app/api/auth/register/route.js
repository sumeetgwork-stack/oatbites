import { createUser, findUserByEmail, verifyOTP, deleteOTP } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password, gender, otp } = await req.json();

    if (!name || !email || !password || !otp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify OTP first
    const isValidOTP = await verifyOTP(email, otp);
    if (!isValidOTP) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      gender: gender || 'Men',
      emailVerified: true,
    });

    // Clean up used OTP
    await deleteOTP(email);

    return NextResponse.json({ success: true, user: { name: newUser.name, email: newUser.email } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
