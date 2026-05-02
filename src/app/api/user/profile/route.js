import { auth } from '@/auth';
import { findUserByEmail } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await findUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    gender: user.gender || '',
  });
}

export async function PATCH(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { phone, address, name, gender } = await req.json();
    const { updateUserProfile } = await import('@/lib/db');
    
    // If gender is being set, check if it's already set (one-time only)
    if (gender) {
      const existingUser = await findUserByEmail(session.user.email);
      if (existingUser?.gender) {
        return NextResponse.json({ error: 'Gender already set and cannot be changed' }, { status: 400 });
      }
    }
    
    const result = await updateUserProfile(session.user.email, { phone, address, name, gender });
    if (!result) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
