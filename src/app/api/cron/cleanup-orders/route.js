import { getCollection } from '@/lib/db';
import { NextResponse } from 'next/server';

// This endpoint deletes "Pending" orders older than 24 hours.
// Intended to be called by Vercel Cron or any external scheduler.

export async function GET(req) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = await getCollection('orders');
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    const result = await orders.deleteMany({
      status: 'Pending',
      createdAt: { $lt: cutoff },
    });

    console.log(`[Cron] Cleaned up ${result.deletedCount} stale pending orders`);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      cutoff: cutoff.toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Cleanup failed:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
