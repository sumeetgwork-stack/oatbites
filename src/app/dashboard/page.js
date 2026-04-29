'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

export default function DashboardPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/orders/user')
        .then(res => res.json())
        .then(data => {
          setOrders(data.orders || []);
          setLoadingOrders(false);
        })
        .catch(() => setLoadingOrders(false));
    }
  }, [isLoggedIn]);

  if (isLoading || !isLoggedIn) {
    return (
      <main className="main-wrapper">
        <div className="fixed-bg"><Scene /></div>
        <div className="content-layer">
          <div className="page-container">
            <p style={{ textAlign: 'center', padding: '4rem' }}>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  const statusColor = (status) => {
    switch(status) {
      case 'Paid': return '#27ae60';
      case 'Processing': return '#f39c12';
      case 'Shipped': return '#3498db';
      case 'Delivered': return '#2ecc71';
      case 'Pending': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <main className="main-wrapper">
      <div className="fixed-bg"><Scene /></div>
      <div className="content-layer">
        <div className="page-container">
          <div className="dashboard-header">
            <div className="dashboard-profile glass-panel">
              {user?.image ? (
                <img src={user.image} alt={user.name} className="dashboard-avatar" referrerPolicy="no-referrer" />
              ) : (
                <div className="dashboard-avatar-placeholder">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="dashboard-user-info">
                <h1>{user?.name}</h1>
                <p>{user?.email}</p>
                <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'user'}`}>
                  {user?.role === 'admin' ? '👑 Admin' : '🛍️ Customer'}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="section-title" style={{ textAlign: 'left' }}>Your Orders</h2>
            
            {loadingOrders ? (
              <p className="empty-state">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="empty-state glass-panel">
                <p>🛒 You haven't placed any orders yet.</p>
                <a href="/products" className="btn-primary" style={{ marginTop: '1rem' }}>Start Shopping</a>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card glass-panel">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id">{order.id}</span>
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className="status-badge" style={{ background: statusColor(order.status) }}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-items-summary">
                      {order.items?.map((item, i) => (
                        <span key={i} className="order-item-chip">
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                    <div className="order-card-footer">
                      <span className="order-total">₹{order.total?.toLocaleString('en-IN')}</span>
                      {order.shippingAddress && (
                        <span className="order-address">📍 {order.shippingAddress.city}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
