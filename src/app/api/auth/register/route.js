import { createUser, findUserByEmail } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password, gender } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Block Google-owned email domains — these users must use "Continue with Google"
    // to prove they own the email address
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const googleDomains = ['gmail.com', 'googlemail.com'];
    if (googleDomains.includes(emailDomain)) {
      return NextResponse.json({ 
        error: 'Gmail users must sign in with "Continue with Google" to verify email ownership.' 
      }, { status: 400 });
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
      gender: gender || 'Men'
    });

    return NextResponse.json({ success: true, user: { name: newUser.name, email: newUser.email } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
