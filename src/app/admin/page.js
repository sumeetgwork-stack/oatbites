'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#e67e22', '#d35400', '#f39c12', '#2c3e50', '#34495e'];

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
      // Added cache-busting timestamp to ensure fresh data
      fetch('/api/admin/stats?t=' + Date.now())
        .then(res => res.json())
        .then(data => {
          console.log('Admin Stats Data:', data);
          setStats(data);
        })
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

      <div className="admin-nav-grid" style={{ marginBottom: '3rem' }}>
        <Link href="/admin/products" className="admin-nav-card glass-panel">
          <h3>🛍️ Manage Products</h3>
          <p>Add, edit, or remove products from your catalog</p>
        </Link>
        <Link href="/admin/orders" className="admin-nav-card glass-panel">
          <h3>📋 Manage Orders</h3>
          <p>View and update the status of customer orders</p>
        </Link>
      </div>

      <div className="analytics-visuals" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>📈 Page Views (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={stats?.analytics?.dailyViews || []}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e67e22" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e67e22" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="_id" stroke="#888" />
              <YAxis stroke="#888" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#e67e22" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>🍩 Unique Visitors Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={stats?.analytics?.visitorDistribution || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="_id"
              >
                {stats?.analytics?.visitorDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
