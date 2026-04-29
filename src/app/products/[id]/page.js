'use client';

import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../components/Toast';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function ProductDetailsPage({ params }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const resolvedParams = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

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

  if (loading) {
    return <div className="page-container"><p style={{ textAlign: 'center', padding: '4rem' }}>Loading...</p></div>;
  }

  if (!product) {
    notFound();
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    addToast(`${qty}x ${product.name} added to cart!`, 'success');
  };

  return (
    <div className="page-container">
      <div className="product-details-grid">
        <div className="image-column">
          <Link href="/products" className="back-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            &larr; Back to Products
          </Link>
          {product.image ? (
            <img src={product.image} alt={product.name} className="product-details-image" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="product-details-image" style={{ backgroundColor: product.color }}></div>
          )}
        </div>
        
        <div className="product-details-info">
          <p className="category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="price-large">₹{product.price?.toLocaleString('en-IN')}</p>
          
          <div className="description-box">
            <p>{product.description}</p>
          </div>
          
          <div className="detail-actions">
            <div className="qty-controls" style={{ borderRadius: '12px' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="btn-primary add-to-cart-large" onClick={handleAdd}>
              Add to Cart
            </button>
          </div>
          
          <div className="benefits">
            <h4>Why you&apos;ll love it:</h4>
            <ul>
              <li>100% Organic Ingredients</li>
              <li>Sustainably Sourced</li>
              <li>No Artificial Preservatives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
