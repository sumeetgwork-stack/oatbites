'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '../../context/LanguageContext';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

// Confetti particle component
function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#e67e22', '#f39c12', '#27ae60', '#2ecc71', '#d4a574', '#ff6b6b', '#ffd93d', '#6c5ce7'];
    const particles = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * canvas.height,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 2 + Math.random() * 4,
        spin: Math.random() * 0.2 - 0.1,
        angle: Math.random() * Math.PI * 2,
        drift: Math.random() * 2 - 1,
        opacity: 0.8 + Math.random() * 0.2,
      });
    }

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if (p.y < canvas.height + 20) alive = true;
        p.y += p.speed;
        p.x += p.drift;
        p.angle += p.spin;
        p.opacity -= 0.001;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const { t } = useLanguage();
  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 400);
    const t2 = setTimeout(() => setShowConfetti(false), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <main className="main-wrapper">
      <div className="fixed-bg"><Scene /></div>
      {showConfetti && <Confetti />}
      <div className="content-layer">
        <div className="confirmation-page">
          <div className="confirmation-card glass-panel">
            {/* Animated checkmark */}
            <div className="confirm-check-wrap">
              <svg className="confirm-check-svg" viewBox="0 0 52 52">
                <circle className="confirm-check-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="confirm-check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>

            <div className={`confirm-body ${showContent ? 'confirm-visible' : ''}`}>
              <h1 className="confirm-title">{t('orderConfirmed')}</h1>
              <p className="confirmation-subtitle">
                🎉 {t('thankYou')}
              </p>

              {orderId && (
                <div className="order-id-box">
                  <span>{t('orderId')}</span>
                  <strong>#{orderId.slice(-8)}</strong>
                </div>
              )}

              <div className="confirm-timeline">
                <div className="confirm-step active">
                  <div className="confirm-step-dot"></div>
                  <span>Order Placed</span>
                </div>
                <div className="confirm-step-line"></div>
                <div className="confirm-step">
                  <div className="confirm-step-dot"></div>
                  <span>Preparing</span>
                </div>
                <div className="confirm-step-line"></div>
                <div className="confirm-step">
                  <div className="confirm-step-dot"></div>
                  <span>Shipped</span>
                </div>
                <div className="confirm-step-line"></div>
                <div className="confirm-step">
                  <div className="confirm-step-dot"></div>
                  <span>Delivered</span>
                </div>
              </div>

              <p className="confirmation-text">
                {t('orderReceivedMsg')}
              </p>

              <div className="confirmation-actions">
                <Link href="/dashboard" className="btn-primary confirm-btn">
                  📦 {t('viewMyOrders')}
                </Link>
                <Link href="/products" className="btn-outline confirm-btn">
                  🛍️ {t('continueShopping')}
                </Link>
              </div>
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
