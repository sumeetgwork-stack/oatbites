'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { useEffect, useState } from 'react';

const Scene = dynamic(() => import('../components/Scene'), { ssr: false });

export default function Home() {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        const allProducts = data.products || [];
        const featuredProducts = allProducts.filter(p => p.featured);
        setProducts(featuredProducts.length > 0 ? featuredProducts.slice(0, 3) : allProducts.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = (product) => {
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
            <h1 className="hero-title">Healthy & <br/> Delicious.</h1>
            <p className="hero-subtitle">
              Experience the crunch. Premium oatbites crafted with love, care, and the finest organic ingredients.
            </p>
            <Link href="/products" className="btn-primary">Shop Now</Link>
          </div>
        </section>

        <section className="featured-section glass-panel">
          <h2 className="section-title">Featured Oatbites</h2>
          <div className="product-grid">
            {products.map((product) => {
              const cartItem = getCartItem(product.id);
              return (
                <div key={product.id} className="product-card">
                  <Link href={`/products/${product.id}`} className="product-image-link">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="product-image-placeholder" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="product-image-placeholder" style={{ backgroundColor: product.color }}></div>
                    )}
                  </Link>
                  <div className="product-info">
                    <Link href={`/products/${product.id}`}><h3>{product.name}</h3></Link>
                    <p className="price">₹{product.price?.toLocaleString('en-IN')}</p>
                    {cartItem ? (
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
                        <span className="in-cart-label">In Cart</span>
                      </div>
                    ) : (
                      <button className="btn-secondary" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="view-all-container">
            <Link href="/products" className="btn-outline">View All Products</Link>
          </div>
        </section>

        <footer className="footer">
          <p>© 2026 Oatbites by SEJ. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
