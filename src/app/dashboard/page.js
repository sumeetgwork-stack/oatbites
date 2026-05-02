'use client';

import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

export default function DashboardPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile editing state
  const [editMode, setEditMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

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

      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setProfile({
            name: data.name || user?.name || '',
            email: data.email || user?.email || '',
            phone: data.phone || '',
            address: data.address || '',
          });
          setProfileLoading(false);
        })
        .catch(() => {
          setProfile({
            name: user?.name || '',
            email: user?.email || '',
            phone: '',
            address: '',
          });
          setProfileLoading(false);
        });
    }
  }, [isLoggedIn, user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
        }),
      });
      if (res.ok) {
        addToast(t('profileUpdated'), 'success');
        setEditMode(false);
      } else {
        addToast('Failed to update profile.', 'error');
      }
    } catch (err) {
      addToast('Failed to update profile.', 'error');
    }
    setSaving(false);
  };

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
          {/* Profile Card */}
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
                <h1>{profile.name || user?.name}</h1>
                <p>{profile.email || user?.email}</p>
                {profile.phone && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>📱 {profile.phone}</p>}
                {profile.address && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>📍 {profile.address}</p>}
                <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'user'}`}>
                  {user?.role === 'admin' ? '👑 Admin' : `🛍️ ${t('customer')}`}
                </span>
              </div>
              <button 
                className="btn-outline profile-edit-btn"
                onClick={() => setEditMode(!editMode)}
                style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}
              >
                {editMode ? t('cancel') : `✏️ ${t('editProfile')}`}
              </button>
            </div>
          </div>

          {/* Profile Edit Form */}
          {editMode && (
            <div className="profile-edit-section glass-panel" style={{ marginBottom: '2rem', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>{t('editProfile')}</h2>
              <div className="profile-edit-grid">
                <div className="profile-edit-field">
                  <label>{t('name')}</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    className="auth-input"
                  />
                </div>
                <div className="profile-edit-field">
                  <label>{t('email')}</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    disabled
                    className="auth-input"
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    title="Email cannot be changed"
                  />
                </div>
                <div className="profile-edit-field">
                  <label>{t('phone')}</label>
                  <input 
                    type="tel" 
                    value={profile.phone} 
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="auth-input"
                  />
                </div>
                <div className="profile-edit-field full-width">
                  <label>{t('address')}</label>
                  <input 
                    type="text" 
                    value={profile.address} 
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    placeholder="123 Street, City, State - 400001"
                    className="auth-input"
                  />
                </div>
              </div>
              <button 
                className="btn-primary" 
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ marginTop: '1.5rem' }}
              >
                {saving ? t('saving') : t('saveChanges')}
              </button>
            </div>
          )}

          {/* Orders Section */}
          <div className="dashboard-section">
            <h2 className="section-title" style={{ textAlign: 'left' }}>{t('yourOrders')}</h2>
            
            {loadingOrders ? (
              <p className="empty-state">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="empty-state glass-panel">
                <p>🛒 {t('noOrders')}</p>
                <a href="/products" className="btn-primary" style={{ marginTop: '1rem' }}>{t('startShopping')}</a>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card glass-panel">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id">#{order.id?.slice(-8)}</span>
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
