'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <main className="main-wrapper">
      <div className="fixed-bg"><Scene /></div>
      <div className="content-layer">
        <div className="confirmation-page">
          <div className="confirmation-card glass-panel">
            <div className="confirmation-icon">✓</div>
            <h1>Order Confirmed!</h1>
            <p className="confirmation-subtitle">
              Thank you for shopping with Oatbites by SEJ
            </p>
            {orderId && (
              <div className="order-id-box">
                <span>Order ID</span>
                <strong>{orderId}</strong>
              </div>
            )}
            <p className="confirmation-text">
              We&apos;ve received your order and are preparing it with care. 
              You can track your order status from your dashboard.
            </p>
            <div className="confirmation-actions">
              <Link href="/dashboard" className="btn-primary">View My Orders</Link>
              <Link href="/products" className="btn-outline">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="page-container"><p style={{ textAlign: 'center', padding: '4rem' }}>Loading...</p></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
