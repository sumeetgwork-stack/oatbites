'use client';

import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

export default function DashboardPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Layout state
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '', gender: '', addresses: []
  });

  // Addresses state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', type: 'Home' });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push('/login');
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/orders/user')
        .then(res => res.json())
        .then(data => { setOrders(data.orders || []); setLoadingOrders(false); })
        .catch(() => setLoadingOrders(false));

      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          setProfile({
            name: data.name || user?.name || '',
            email: data.email || user?.email || '',
            phone: data.phone || '',
            address: data.address || '',
            gender: data.gender || '',
            addresses: data.addresses || []
          });
          setProfileLoading(false);
        })
        .catch(() => setProfileLoading(false));
    }
  }, [isLoggedIn, user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, phone: profile.phone, address: profile.address, gender: profile.gender, addresses: profile.addresses }),
      });
      if (res.ok) {
        addToast('Profile updated successfully!', 'success');
        setEditMode(false);
      } else {
        addToast('Failed to update profile.', 'error');
      }
    } catch (err) {
      addToast('Failed to update profile.', 'error');
    }
    setSaving(false);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const currentAddresses = profile.addresses || [];
      const updatedAddresses = [...currentAddresses, { ...newAddress, id: Date.now().toString() }];
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, addresses: updatedAddresses }),
      });
      if (res.ok) {
        setProfile({ ...profile, addresses: updatedAddresses });
        setShowAddAddress(false);
        setNewAddress({ name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', type: 'Home' });
        addToast('Address added successfully!', 'success');
      } else {
        const d = await res.json();
        addToast(d.error || 'Failed to save address', 'error');
      }
    } catch (err) {
      addToast('An error occurred while saving', 'error');
      console.error(err);
    }
    setSaving(false);
  };

  const handleDeleteAddress = async (id) => {
    const currentAddresses = profile.addresses || [];
    const updatedAddresses = currentAddresses.filter(a => a.id !== id);
    setProfile({ ...profile, addresses: updatedAddresses });
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, addresses: updatedAddresses }),
      });
      addToast('Address removed', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !isLoggedIn) return <div className="page-container" style={{paddingTop:'100px', textAlign:'center'}}>Loading...</div>;

  return (
    <main className="main-wrapper" style={{ background: '#f1f3f6', minHeight: '100vh' }}>
      <div className="fixed-bg"><Scene /></div>
      <div className="content-layer">
        <div className="page-container fk-dashboard" style={{ paddingTop: '2rem' }}>
          
          <div className="fk-layout-grid">
            {/* LEFT SIDEBAR */}
            <aside className="fk-sidebar">
              <div className="fk-sidebar-profile">
                <div className="fk-avatar">
                  {user?.image ? <img src={user.image} alt="User" referrerPolicy="no-referrer" /> : <span>{profile.name?.charAt(0) || 'U'}</span>}
                </div>
                <div className="fk-hello">
                  <span>Hello,</span>
                  <strong>{profile.name}</strong>
                </div>
              </div>

              <div className="fk-sidebar-nav">
                <button onClick={() => setActiveTab('orders')} className={`fk-nav-mainbtn ${activeTab === 'orders' ? 'active' : ''}`}>
                  <span className="fk-icon">📦</span> MY ORDERS
                </button>
                
                <div className="fk-nav-group">
                  <h3><span className="fk-icon">👤</span> ACCOUNT SETTINGS</h3>
                  <button onClick={() => setActiveTab('profile')} className={`fk-nav-subbtn ${activeTab === 'profile' ? 'active' : ''}`}>Profile Information</button>
                  <button onClick={() => setActiveTab('addresses')} className={`fk-nav-subbtn ${activeTab === 'addresses' ? 'active' : ''}`}>Manage Addresses</button>
                </div>

                <div className="fk-nav-group">
                  <h3><span className="fk-icon">💳</span> PAYMENTS</h3>
                  <button onClick={() => setActiveTab('giftcards')} className={`fk-nav-subbtn ${activeTab === 'giftcards' ? 'active' : ''}`}>Gift Cards</button>
                  <button onClick={() => setActiveTab('upi')} className={`fk-nav-subbtn ${activeTab === 'upi' ? 'active' : ''}`}>Saved UPI</button>
                  <button onClick={() => setActiveTab('cards')} className={`fk-nav-subbtn ${activeTab === 'cards' ? 'active' : ''}`}>Saved Cards</button>
                </div>
              </div>
            </aside>

            {/* RIGHT CONTENT */}
            <section className="fk-content">
              {activeTab === 'profile' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>Personal Information</h2>
                    <button className="fk-edit-link" onClick={() => setEditMode(!editMode)}>{editMode ? 'Cancel' : 'Edit'}</button>
                  </div>
                  
                  <div className="fk-profile-form">
                    <div className="fk-input-group">
                      <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} disabled={!editMode} placeholder="Full Name" />
                    </div>
                    
                    <h3 className="fk-field-label">Your Gender</h3>
                    <div className="fk-radio-group">
                      <label>
                        <input type="radio" name="gender" value="Men" checked={profile.gender === 'Men'} disabled={!editMode || (profile.gender && profile.gender !== 'Not Specified')} onChange={e => setProfile({...profile, gender: e.target.value})} /> Male
                      </label>
                      <label>
                        <input type="radio" name="gender" value="Women" checked={profile.gender === 'Women'} disabled={!editMode || (profile.gender && profile.gender !== 'Not Specified')} onChange={e => setProfile({...profile, gender: e.target.value})} /> Female
                      </label>
                    </div>

                    <h3 className="fk-field-label">Email Address</h3>
                    <div className="fk-input-group">
                      <input type="email" value={profile.email} disabled placeholder="Email Address" />
                    </div>

                    <h3 className="fk-field-label">Mobile Number</h3>
                    <div className="fk-input-group">
                      <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} disabled={!editMode} placeholder="+91 9876543210" />
                    </div>

                    {editMode && (
                      <button className="fk-save-btn" onClick={handleSaveProfile} disabled={saving}>
                        {saving ? 'SAVING...' : 'SAVE'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>Manage Addresses</h2>
                  </div>
                  <div className="fk-tab-body" style={{ padding: '32px' }}>
                  
                  {!showAddAddress ? (
                    <button className="fk-add-address-btn" onClick={() => setShowAddAddress(true)}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span> ADD A NEW ADDRESS
                    </button>
                  ) : (
                    <div className="fk-address-form-container">
                      <h3 style={{ color: '#2874f0', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>ADD A NEW ADDRESS</h3>
                      <form onSubmit={handleSaveAddress} className="fk-address-form">
                        <div className="fk-form-row">
                          <input type="text" placeholder="Name" required value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} />
                          <input type="text" placeholder="10-digit mobile number" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                        </div>
                        <div className="fk-form-row">
                          <input type="text" placeholder="Pincode" required value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} />
                          <input type="text" placeholder="Locality" required value={newAddress.locality} onChange={e => setNewAddress({...newAddress, locality: e.target.value})} />
                        </div>
                        <div className="fk-form-row full">
                          <textarea placeholder="Address (Area and Street)" required rows="3" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})}></textarea>
                        </div>
                        <div className="fk-form-row">
                          <input type="text" placeholder="City/District/Town" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                          <input type="text" placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                        </div>
                        <div className="fk-radio-group" style={{ margin: '16px 0' }}>
                          <span style={{ fontSize: '14px', color: '#878787', marginRight: '16px' }}>Address Type</span>
                          <label><input type="radio" name="type" value="Home" checked={newAddress.type === 'Home'} onChange={e => setNewAddress({...newAddress, type: e.target.value})} /> Home</label>
                          <label><input type="radio" name="type" value="Work" checked={newAddress.type === 'Work'} onChange={e => setNewAddress({...newAddress, type: e.target.value})} /> Work</label>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                          <button type="submit" className="fk-save-btn" style={{ marginTop: 0 }} disabled={saving}>SAVE AND DELIVER HERE</button>
                          <button type="button" className="fk-cancel-btn" onClick={() => setShowAddAddress(false)}>CANCEL</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="fk-address-list">
                    {profile.addresses?.map((addr) => (
                      <div key={addr.id} className="fk-address-card">
                        <div className="fk-address-header">
                          <span className="fk-address-type">{addr.type}</span>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="fk-delete-btn">Delete</button>
                        </div>
                        <p className="fk-address-name"><strong>{addr.name}</strong> &nbsp;&nbsp; <strong>{addr.phone}</strong></p>
                        <p className="fk-address-detail">{addr.address}, {addr.locality}</p>
                        <p className="fk-address-detail">{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>My Orders</h2>
                  </div>
                  <div className="fk-tab-body" style={{ padding: '32px' }}>
                  {loadingOrders ? <p style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</p> : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                      <p style={{ fontSize: '1.2rem', color: '#878787', marginBottom: '1rem' }}>No orders found.</p>
                      <Link href="/products" className="fk-save-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>START SHOPPING</Link>
                    </div>
                  ) : (
                    <div className="fk-orders-list">
                      {orders.map(order => (
                        <div key={order.id} className="fk-order-card">
                          <div className="fk-order-images">
                            {order.items.slice(0, 3).map((item, i) => (
                              <div key={i} className="fk-order-thumb" title={item.name}>
                                {item.image ? <img src={item.image} alt={item.name} /> : <span>📦</span>}
                              </div>
                            ))}
                            {order.items.length > 3 && <div className="fk-order-thumb-more">+{order.items.length - 3}</div>}
                          </div>
                          <div className="fk-order-details">
                            <p className="fk-order-title">{order.items.map(i => i.name).join(', ')}</p>
                            <p className="fk-order-date">Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="fk-order-price">₹{order.total?.toLocaleString('en-IN')}</div>
                          <div className="fk-order-status">
                            <span className={`fk-status-dot ${order.status.toLowerCase()}`}></span>
                            {order.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                </div>
              )}

              {activeTab === 'giftcards' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>Gift Cards</h2>
                  </div>
                  <div className="fk-tab-body" style={{ padding: '32px' }}>
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
                      <p style={{ fontSize: '1.1rem', color: '#212121', marginBottom: '0.5rem', fontWeight: '500' }}>No Gift Cards found</p>
                      <p style={{ fontSize: '0.9rem', color: '#878787', marginBottom: '2rem' }}>You haven't added any gift cards yet.</p>
                      <button className="fk-save-btn" style={{ display: 'inline-block' }}>ADD A GIFT CARD</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'upi' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>Saved UPI</h2>
                  </div>
                  <div className="fk-tab-body" style={{ padding: '32px' }}>
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                      <p style={{ fontSize: '1.1rem', color: '#212121', marginBottom: '0.5rem', fontWeight: '500' }}>No Saved UPI IDs</p>
                      <p style={{ fontSize: '0.9rem', color: '#878787', marginBottom: '2rem' }}>Save your UPI IDs for faster payments.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cards' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>Saved Cards</h2>
                  </div>
                  <div className="fk-tab-body" style={{ padding: '32px' }}>
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                      <p style={{ fontSize: '1.1rem', color: '#212121', marginBottom: '0.5rem', fontWeight: '500' }}>No Saved Cards</p>
                      <p style={{ fontSize: '0.9rem', color: '#878787', marginBottom: '2rem' }}>You can save your Credit/Debit cards for a seamless checkout experience.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
