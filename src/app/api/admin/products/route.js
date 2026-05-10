import { getAllProducts, addProduct, updateProduct, deleteProduct, getRestockSubscribers, clearRestockSubscribers } from '@/lib/db';
import { sendBackInStockEmail } from '@/lib/email';
import { sendPushToUser, backInStockPush } from '@/lib/push';
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

  // Check if product was out of stock before update
  const allProducts = await getAllProducts();
  const oldProduct = allProducts.find(p => p.id === id);
  const wasOutOfStock = oldProduct && oldProduct.stock !== undefined && oldProduct.stock <= 0;
  const isNowInStock = updates.stock !== undefined && Number(updates.stock) > 0;

  const product = await updateProduct(id, updates);

  // If restocked, notify all subscribers
  if (wasOutOfStock && isNowInStock && product) {
    const subscribers = await getRestockSubscribers(id);
    if (subscribers.length > 0) {
      console.log(`[Restock] Notifying ${subscribers.length} subscriber(s) for ${product.name}`);
      const productData = { ...product, id };
      for (const sub of subscribers) {
        sendBackInStockEmail(sub.userEmail, productData).catch(err =>
          console.error(`[Restock] Failed to email ${sub.userEmail}:`, err)
        );
        sendPushToUser(sub.userEmail, backInStockPush(productData)).catch(err =>
          console.error(`[Push] Failed to notify ${sub.userEmail}:`, err)
        );
      }
      // Clear subscriptions after notifying
      await clearRestockSubscribers(id);
    }
  }

  return NextResponse.json({ product });
}

export async function DELETE(req) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await deleteProduct(body.id);
  return NextResponse.json({ success: true });
}
