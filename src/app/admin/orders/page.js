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
    fetch('/api/admin/orders')
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
    <div className="page-container admin-page">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="back-link">← Back to Dashboard</Link>
          <h1>Manage Orders</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="admin-table-container glass-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>
                    <div>{order.userName || 'N/A'}</div>
                    <small style={{ color: '#888' }}>{order.userEmail}</small>
                  </td>
                  <td>
                    {order.items?.map((item, i) => (
                      <span key={i} className="order-item-chip">{item.name} ×{item.quantity}</span>
                    ))}
                  </td>
                  <td><strong>₹{order.total?.toLocaleString('en-IN')}</strong></td>
                  <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td>
                    <span className="status-badge" style={{ background: statusColor(order.status) }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="status-select"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
