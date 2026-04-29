import { getAllProducts, addProduct, updateProduct, deleteProduct } from '@/lib/db';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return session;
}

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json({ products });
}

export async function POST(req) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const product = await addProduct(body);
  return NextResponse.json({ product });
}

export async function PUT(req) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  const product = await updateProduct(id, updates);
  return NextResponse.json({ product });
}

export async function DELETE(req) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await deleteProduct(body.id);
  return NextResponse.json({ success: true });
}
