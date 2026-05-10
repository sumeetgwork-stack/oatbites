'use client';

import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../components/Toast';
import ReviewSection from '../../../components/ReviewSection';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function ProductDetailsPage({ params }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const resolvedParams = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [notifySubscribed, setNotifySubscribed] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        const found = (data.products || []).find(p => p.id === resolvedParams.id);
        setProduct(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resolvedParams.id]);

  // Check if user is subscribed to restock notification
  useEffect(() => {
    if (product && product.stock !== undefined && product.stock <= 0 && isLoggedIn) {
      fetch(`/api/notifications/stock?productId=${product.id}`)
        .then(res => res.json())
        .then(data => setNotifySubscribed(data.subscribed || false))
        .catch(() => {});
    }
  }, [product, isLoggedIn]);

  const handleNotifyMe = async () => {
    if (!isLoggedIn) {
      addToast(t('loginToNotify'), 'error');
      return;
    }
    setNotifyLoading(true);
    try {
      if (notifySubscribed) {
        // Unsubscribe
        await fetch('/api/notifications/stock', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
        setNotifySubscribed(false);
        addToast(t('notificationRemoved'), 'info');
      } else {
        // Subscribe
        const res = await fetch('/api/notifications/stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
        const data = await res.json();
        if (res.ok) {
          setNotifySubscribed(true);
          addToast(data.message || t('youllBeNotified'), 'success');
        } else {
          addToast(data.error || t('somethingWentWrong'), 'error');
        }
      }
    } catch {
      addToast(t('somethingWentWrong'), 'error');
    }
    setNotifyLoading(false);
  };

  if (loading) {
    return <div className="page-container"><p style={{ textAlign: 'center', padding: '4rem' }}>{t('loading')}</p></div>;
  }

  if (!product) {
    notFound();
  }

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  const handleAdd = () => {
    if (isOutOfStock) {
      addToast(t('outOfStock'), 'error');
      return;
    }
    for (let i = 0; i < qty; i++) addToCart(product);
    addToast(`${qty}x ${product.name} ${t('addToCart')}!`, 'success');
  };

  return (
    <div className="page-container">
      <div className="product-details-grid">
        <div className="image-column">
          <Link href="/products" className="back-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            {t('backToProducts')}
          </Link>
          <div style={{ position: 'relative' }}>
            {product.image ? (
              <img src={product.image} alt={product.name} className="product-details-image" style={{ objectFit: 'cover' }} />
            ) : (
              <div className="product-details-image" style={{ backgroundColor: product.color }}></div>
            )}
            {isOutOfStock && (
              <div className="stock-overlay-badge out-of-stock">{t('outOfStock').toUpperCase()}</div>
            )}
          </div>
        </div>
        
        <div className="product-details-info">
          <p className="category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="price-large">₹{product.price?.toLocaleString('en-IN')}</p>
          
          {/* Stock indicator */}
          {isOutOfStock && (
            <div className="stock-badge stock-out">
              <span>●</span> {t('outOfStock')}
            </div>
          )}
          {isLowStock && (
            <div className="stock-badge stock-low">
              <span>●</span> {t('lowStock').replace('{n}', product.stock)}
            </div>
          )}
          {product.stock > 5 && (
            <div className="stock-badge stock-in">
              <span>●</span> {t('inStock')}
            </div>
          )}

          <div className="description-box">
            <p>{product.description}</p>
          </div>
          
          {isOutOfStock ? (
            <div className="detail-actions">
              <button
                className={`notify-me-btn ${notifySubscribed ? 'subscribed' : ''}`}
                onClick={handleNotifyMe}
                disabled={notifyLoading}
              >
                {notifyLoading ? '...' : notifySubscribed ? t('youllBeNotified') : t('notifyMe')}
              </button>
            </div>
          ) : (
            <div className="detail-actions">
              <div className="qty-controls" style={{ borderRadius: '12px' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button className="btn-primary add-to-cart-large" onClick={handleAdd}>
                {t('addToCart')}
              </button>
            </div>
          )}
          
          <div className="benefits">
            <h4>{t('whyYoullLoveIt')}</h4>
            <ul>
              <li>{t('organicIngredients')}</li>
              <li>{t('sustainablySourced')}</li>
              <li>{t('noPreservatives')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection productId={product.id} />
    </div>
  );
}
