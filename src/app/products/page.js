'use client';

import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {
        import('../../lib/products').then(mod => {
          setProducts(mod.products || []);
        });
      });
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    addToast(`${product.name} added to cart!`, 'success');
  };

  const getCartItem = (id) => cart.find(item => item.id === id);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>All Products</h1>
        <p>Discover our full range of premium oat-based goods.</p>
      </div>

      <div className="product-grid page-grid">
        {products.map((product) => {
          const cartItem = getCartItem(product.id);
          return (
            <div key={product.id} className="product-card flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <Link href={`/products/${product.id}`} className="product-image-link">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="product-image-placeholder" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="product-image-placeholder" style={{ backgroundColor: product.color }}></div>
                    )}
                  </Link>
                  <div className="product-info">
                    <Link href={`/products/${product.id}`} className="product-name-link">
                      <h3>{product.name}</h3>
                    </Link>
                    <p className="category">{product.category}</p>
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
                      <button className="btn-secondary" onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
                <div className="flip-card-back" style={{ backgroundColor: product.color }}>
                  <div className="flip-card-back-content">
                    <h3>{product.name}</h3>
                    <p>{product.description || 'Premium organic oat product crafted with the finest ingredients for your health and taste.'}</p>
                    {!cartItem ? (
                      <button className="btn-primary" style={{ background: 'white', color: '#333' }} onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </button>
                    ) : (
                      <span className="in-cart-label" style={{ color: 'white', border: '1px solid white' }}>✓ In Cart ({cartItem.quantity})</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
