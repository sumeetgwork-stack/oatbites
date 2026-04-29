'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/');
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [isAdmin]);

  if (isLoading || !isAdmin) {
    return <div className="page-container"><p style={{ textAlign: 'center', padding: '4rem' }}>Loading...</p></div>;
  }

  return (
    <div className="page-container admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.name} 👑</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats?.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Revenue</div>
        </div>
        <Link href="/admin/users" className="stat-card glass-panel" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-label">Users</div>
        </Link>
        <div className="stat-card glass-panel">
          <div className="stat-icon">🌾</div>
          <div className="stat-value">{stats?.totalProducts || 0}</div>
          <div className="stat-label">Products</div>
        </div>
      </div>

      <div className="admin-nav-grid">
        <Link href="/admin/products" className="admin-nav-card glass-panel">
          <h3>🛍️ Manage Products</h3>
          <p>Add, edit, or remove products from your catalog</p>
        </Link>
        <Link href="/admin/orders" className="admin-nav-card glass-panel">
          <h3>📋 Manage Orders</h3>
          <p>View and update the status of customer orders</p>
        </Link>
      </div>
    </div>
  );
}
