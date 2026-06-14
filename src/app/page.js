'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/Toast';
import { RatingDisplay } from '../components/StarRating';
import { useEffect, useState } from 'react';

const Scene = dynamic(() => import('../components/Scene'), { ssr: false });

export default function Home() {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        const allProducts = data.products || [];
        const featuredProducts = allProducts.filter(p => p.featured);
        setProducts(featuredProducts.length > 0 ? featuredProducts.slice(0, 3) : allProducts.slice(0, 3));
      })
      .catch(() => {});

    // Fetch all product ratings
    fetch('/api/reviews?allRatings=true')
      .then(res => res.json())
      .then(data => setRatings(data.ratings || {}))
      .catch(() => {});
  }, []);

  const handleAddToCart = (product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      addToast('This product is currently out of stock', 'error');
      return;
    }
    addToCart(product);
    addToast(`${product.name} added to cart!`, 'success');
  };

  const getCartItem = (id) => cart.find(item => item.id === id);

  return (
    <main className="main-wrapper">
      <div className="fixed-bg"><Scene /></div>
      <div className="content-layer">
        <section className="hero-section">
          <div className="glass-panel hero-card">
            <h1 className="hero-title">{t('heroTitle')} <br/> {t('heroTitle2')}</h1>
            <p className="hero-subtitle">
              {t('heroSubtitle')}
            </p>
            <Link href="/products" className="btn-primary">{t('shopNow')}</Link>
          </div>
        </section>

        <section className="featured-section glass-panel">
          <h2 className="section-title">{t('featuredOatbites')}</h2>
          <div className="product-grid">
            {products.map((product) => {
              const cartItem = getCartItem(product.id);
              const isOutOfStock = product.stock !== undefined && product.stock <= 0;
              const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
              const productRating = ratings[product.id];

              return (
                <div key={product.id} className={`product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
                  <Link href={`/products/${product.id}`} className="product-image-link">
                    <div style={{ position: 'relative' }}>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="product-image-placeholder" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="product-image-placeholder" style={{ backgroundColor: product.color }}></div>
                      )}
                      {isOutOfStock && (
                        <div className="stock-overlay-badge out-of-stock">OUT OF STOCK</div>
                      )}
                      {isLowStock && (
                        <div className="stock-overlay-badge low-stock">Only {product.stock} left!</div>
                      )}
                    </div>
                  </Link>
                  <div className="product-info">
                    <Link href={`/products/${product.id}`}><h3>{product.name}</h3></Link>
                    {productRating && (
                      <RatingDisplay avgRating={productRating.avgRating} reviewCount={productRating.count} />
                    )}
                    <p className="price">₹{product.price?.toLocaleString('en-IN')}</p>
                    {isOutOfStock ? (
                      <button className="btn-secondary disabled" disabled>Out of Stock</button>
                    ) : cartItem ? (
                      <div className="product-actions">
                        <div className="qty-controls">
                          <button onClick={() => {
                            if (cartItem.quantity <= 1) {
                              removeFromCart(product.id);
                              addToast(`${product.name} removed from cart.`, 'info');
                            } else {
                              updateQuantity(product.id, cartItem.quantity - 1);
                            }
                          }}>−</button>
                          <span>{cartItem.quantity}</span>
                          <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>+</button>
                        </div>
                        <span className="in-cart-label">{t('inCart')}</span>
                      </div>
                    ) : (
                      <button className="btn-secondary" onClick={() => handleAddToCart(product)}>{t('addToCart')}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="view-all-container">
            <Link href="/products" className="btn-outline">{t('viewAllProducts')}</Link>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-about">
              <h3>About Us</h3>
              <p>At OatBites by Sej, we believe that healthy snacking should be simple, delicious, and made with ingredients you can trust. Our journey began with a passion for creating wholesome treats that bring together nutrition, taste, and convenience in every bite.</p>
              <p>Each OatBite is carefully handcrafted using thoughtfully selected ingredients and prepared in small batches to ensure quality and freshness. We focus on creating snacks that fit effortlessly into modern lifestyles whether as a quick energy boost, a mindful snack, or a healthier alternative to traditional sweets.</p>
              <p>More than just a snack brand, OatBites by Sej is a commitment to wholesome living. Through every product we create, we aim to make healthy choices enjoyable, accessible, and a part of everyday life.</p>
            </div>
            <div className="footer-social">
              <a href="https://www.instagram.com/oatbites_by_sej?igsh=MWtvMGUwYzFiOWx1OQ==" target="_blank" rel="noopener noreferrer" className="instagram-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span>Follow on Instagram</span>
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('copyright')}</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
