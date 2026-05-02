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
    <div className="page-container admin-page" style={{ paddingTop: '2rem' }}>
      <div className="admin-header" style={{ marginBottom: '1.5rem', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem' }}>Admin Dashboard</h1>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Welcome back, {user?.name} 👑</p>
      </div>

      <div className="stats-grid" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <div className="stat-icon" style={{ fontSize: '1.5rem' }}>📦</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats?.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <div className="stat-icon" style={{ fontSize: '1.5rem' }}>💰</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Revenue</div>
        </div>
        <Link href="/admin/users" className="stat-card" style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
          <div className="stat-icon" style={{ fontSize: '1.5rem' }}>👥</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats?.totalUsers || 0}</div>
          <div className="stat-label">Users</div>
        </Link>
        <div className="stat-card" style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <div className="stat-icon" style={{ fontSize: '1.5rem' }}>🌾</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats?.totalProducts || 0}</div>
          <div className="stat-label">Products</div>
        </div>
      </div>

      <div className="admin-nav-grid" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <Link href="/admin/products" className="admin-nav-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '1.2rem' }}>🛍️ Manage Products</h3>
          <p style={{ fontSize: '0.9rem' }}>Add, edit, or remove products from your catalog</p>
        </Link>
        <Link href="/admin/orders" className="admin-nav-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '1.2rem' }}>📋 Manage Orders</h3>
          <p style={{ fontSize: '0.9rem' }}>View and update the status of customer orders</p>
        </Link>
      </div>

      <div className="analytics-visuals" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1.5rem', height: '300px', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>📈 Page Views (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={stats?.analytics?.dailyViews || []}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e67e22" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e67e22" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="_id" stroke="#888" tick={{fontSize: 12}} />
              <YAxis stroke="#888" tick={{fontSize: 12}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#e67e22" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ padding: '1.5rem', height: '300px', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>🍩 Unique Visitors Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={stats?.analytics?.visitorDistribution || []}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="_id"
              >
                {stats?.analytics?.visitorDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
