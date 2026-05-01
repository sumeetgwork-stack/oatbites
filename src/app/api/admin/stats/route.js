import { auth } from '@/auth';
import { getAllOrders, getAllProducts, getAllUsers, getAnalyticsStats } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [orders, users, products, analytics] = await Promise.all([
    getAllOrders(),
    getAllUsers(),
    getAllProducts(),
    getAnalyticsStats()
  ]);

  const paidOrders = orders.filter(o => o.status !== 'Pending');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return NextResponse.json({
    totalOrders: orders.length,
    totalRevenue,
    totalUsers: users.length,
    totalProducts: products.length,
    analytics
  });
}
