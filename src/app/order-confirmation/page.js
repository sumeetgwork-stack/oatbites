'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '../../context/LanguageContext';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const { t } = useLanguage();

  return (
    <main className="main-wrapper">
      <div className="fixed-bg"><Scene /></div>
      <div className="content-layer">
        <div className="confirmation-page">
          <div className="confirmation-card glass-panel">
            <div className="confirmation-icon">✓</div>
            <h1>{t('orderConfirmed')}</h1>
            <p className="confirmation-subtitle">
              {t('thankYou')}
            </p>
            {orderId && (
              <div className="order-id-box">
                <span>{t('orderId')}</span>
                <strong>{orderId}</strong>
              </div>
            )}
            <p className="confirmation-text">
              {t('orderReceivedMsg')}
            </p>
            <div className="confirmation-actions">
              <Link href="/dashboard" className="btn-primary">{t('viewMyOrders')}</Link>
              <Link href="/products" className="btn-outline">{t('continueShopping')}</Link>
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
