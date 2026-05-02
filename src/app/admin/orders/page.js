'use client';

import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STATUSES = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered'];

export default function AdminOrdersPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/');
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch('/api/admin/orders?t=' + Date.now())
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .catch(console.error);
  };

  const updateStatus = async (orderId, newStatus) => {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    fetchOrders();
  };

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

  if (isLoading || !isAdmin) return null;

  return (
    <main className="main-wrapper">
      <div className="content-layer">
        <div className="page-container admin-page" style={{ paddingTop: '2rem' }}>
          <div className="admin-header">
            <div>
              <Link href="/admin" className="back-link">← Back to Dashboard</Link>
              <h1 style={{ fontSize: '1.5rem' }}>Manage Orders</h1>
            </div>
          </div>

      {orders.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="admin-orders-list" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {orders.map(order => (
            <div key={order.id} className="admin-order-card glass-panel">
              <div className="admin-order-card-top">
                <div className="admin-order-id">
                  <span className="admin-order-id-label">Order ID</span>
                  <span className="admin-order-id-value">#{order.id?.slice(-8)}</span>
                </div>
                <span className="status-badge" style={{ background: statusColor(order.status) }}>
                  {order.status}
                </span>
              </div>

              <div className="admin-order-card-body">
                <div className="admin-order-detail">
                  <span className="admin-order-detail-label">👤 Customer</span>
                  <span className="admin-order-detail-value">{order.userName || 'N/A'}</span>
                  <small style={{ color: '#888', fontSize: '0.8rem' }}>{order.userEmail}</small>
                </div>

                <div className="admin-order-detail">
                  <span className="admin-order-detail-label">📦 Items</span>
                  <div className="admin-order-items-wrap">
                    {order.items?.map((item, i) => (
                      <span key={i} className="order-item-chip">{item.name} ×{item.quantity}</span>
                    ))}
                  </div>
                </div>

                <div className="admin-order-meta-row">
                  <div className="admin-order-detail">
                    <span className="admin-order-detail-label">💰 Total</span>
                    <span className="admin-order-detail-value" style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                      ₹{order.total?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="admin-order-detail">
                    <span className="admin-order-detail-label">📅 Date</span>
                    <span className="admin-order-detail-value">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-order-card-footer">
                <label className="admin-order-action-label">Update Status:</label>
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="status-select"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
    </main>
  );
}
