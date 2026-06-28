'use client';

import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

function OrderTimeline({ order }) {
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  
  let currentIndex = 0;
  if (order.status === 'Processing') currentIndex = 1;
  if (order.status === 'Shipped') currentIndex = 2;
  if (order.status === 'Delivered') currentIndex = 3;
  if (order.status.includes('COD')) currentIndex = 0;

  return (
    <div className="order-timeline-container" style={{ padding: '32px 24px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ position: 'absolute', top: '12px', left: '0', right: '0', height: '2px', background: '#e0e0e0', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '12px', left: '0', width: `${(currentIndex / 3) * 100}%`, height: '2px', background: '#26a541', zIndex: 1, transition: 'width 0.4s ease' }}></div>
        
        {statuses.map((status, index) => (
          <div key={status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '50%', 
              background: index <= currentIndex ? '#26a541' : '#e0e0e0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '12px', fontWeight: 'bold',
              boxShadow: index <= currentIndex ? '0 0 0 4px rgba(38, 165, 65, 0.2)' : 'none'
            }}>
              {index <= currentIndex ? '✓' : ''}
            </div>
            <span style={{ marginTop: '8px', fontSize: '12px', fontWeight: index <= currentIndex ? '600' : '400', color: index <= currentIndex ? '#212121' : '#878787' }}>
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

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
  const [addressErrors, setAddressErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});

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
    const pErrors = {};
    if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
      pErrors.phone = 'Phone must be exactly 10 digits';
    }
    if (Object.keys(pErrors).length > 0) {
      setProfileErrors(pErrors);
      return;
    }
    setProfileErrors({});
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
    const errors = {};
    if (!newAddress.name || newAddress.name.trim().length < 2) {
      errors.name = 'Name is required (min 2 characters)';
    }
    if (!newAddress.phone || !/^\d{10}$/.test(newAddress.phone)) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    if (!newAddress.pincode || !/^\d{6}$/.test(newAddress.pincode)) {
      errors.pincode = 'Pincode must be exactly 6 digits';
    }
    if (!newAddress.locality || !newAddress.locality.trim()) {
      errors.locality = 'Locality is required';
    }
    if (!newAddress.address || newAddress.address.trim().length < 5) {
      errors.address = 'Address is required (min 5 characters)';
    }
    if (!newAddress.city || !newAddress.city.trim()) {
      errors.city = 'City is required';
    }
    if (!newAddress.state || !newAddress.state.trim()) {
      errors.state = 'State is required';
    }
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }
    setAddressErrors({});
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
        setAddressErrors({});
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

  if (isLoading || !isLoggedIn) return <div className="page-container" style={{paddingTop:'100px', textAlign:'center'}}>{t('loading')}</div>;

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
                  <span>{t('hello')}</span>
                  <strong>{profile.name}</strong>
                </div>
              </div>

              <div className="fk-sidebar-nav">
                <button onClick={() => setActiveTab('orders')} className={`fk-nav-mainbtn ${activeTab === 'orders' ? 'active' : ''}`}>
                  <span className="fk-icon">📦</span> {t('myOrders')}
                </button>
                
                <div className="fk-nav-group">
                  <h3><span className="fk-icon">👤</span> {t('accountSettings')}</h3>
                  <button onClick={() => setActiveTab('profile')} className={`fk-nav-subbtn ${activeTab === 'profile' ? 'active' : ''}`}>{t('profileInfo')}</button>
                  <button onClick={() => setActiveTab('addresses')} className={`fk-nav-subbtn ${activeTab === 'addresses' ? 'active' : ''}`}>{t('manageAddresses')}</button>
                  <button onClick={() => setActiveTab('notifications')} className={`fk-nav-subbtn ${activeTab === 'notifications' ? 'active' : ''}`}>{t('notifications')}</button>
                </div>

              </div>
            </aside>

            {/* RIGHT CONTENT */}
            <section className="fk-content">
              {activeTab === 'profile' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>{t('personalInfo')}</h2>
                    <button className="fk-edit-link" onClick={() => setEditMode(!editMode)}>{editMode ? t('cancel') : t('edit')}</button>
                  </div>
                  
                  <div className="fk-profile-form">
                    <div className="fk-input-group">
                      <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} disabled={!editMode} placeholder="Full Name" />
                    </div>
                    
                    <h3 className="fk-field-label">{t('yourGender')}</h3>
                    <div className="fk-radio-group">
                      <label>
                        <input type="radio" name="gender" value="Men" checked={profile.gender === 'Men'} disabled={!editMode || (profile.gender && profile.gender !== 'Not Specified')} onChange={e => setProfile({...profile, gender: e.target.value})} /> {t('male')}
                      </label>
                      <label>
                        <input type="radio" name="gender" value="Women" checked={profile.gender === 'Women'} disabled={!editMode || (profile.gender && profile.gender !== 'Not Specified')} onChange={e => setProfile({...profile, gender: e.target.value})} /> {t('female')}
                      </label>
                    </div>

                    <h3 className="fk-field-label">{t('emailAddress')}</h3>
                    <div className="fk-input-group">
                      <input type="email" value={profile.email} disabled placeholder="Email Address" />
                    </div>

                    <h3 className="fk-field-label">{t('mobileNumber')}</h3>
                    <div className="fk-input-group">
                      <input type="tel" value={profile.phone} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setProfile({...profile, phone: v}); if (profileErrors.phone) setProfileErrors(prev => ({ ...prev, phone: '' })); }} disabled={!editMode} placeholder="+91 9876543210" style={{ fontSize: '16px' }} />
                      {profileErrors.phone && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{profileErrors.phone}</span>}
                    </div>

                    {editMode && (
                      <button className="fk-save-btn" onClick={handleSaveProfile} disabled={saving}>
                        {saving ? t('savingUpper') : t('save')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>{t('manageAddresses')}</h2>
                  </div>
                  <div className="fk-tab-body" style={{ padding: '32px' }}>
                  
                  {!showAddAddress ? (
                    <button className="fk-add-address-btn" onClick={() => setShowAddAddress(true)}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span> {t('addNewAddress')}
                    </button>
                  ) : (
                    <div className="fk-address-form-container">
                      <h3 style={{ color: '#2874f0', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>{t('addNewAddress')}</h3>
                      <form onSubmit={handleSaveAddress} className="fk-address-form" noValidate>
                        <div className="fk-form-row">
                          <div style={{ flex: 1 }}>
                            <input type="text" placeholder="Name" value={newAddress.name} onChange={e => { setNewAddress({...newAddress, name: e.target.value}); if (addressErrors.name) setAddressErrors(prev => ({ ...prev, name: '' })); }} style={{ fontSize: '16px', width: '100%' }} />
                            {addressErrors.name && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{addressErrors.name}</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <input type="tel" placeholder="10-digit mobile number" value={newAddress.phone} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setNewAddress({...newAddress, phone: v}); if (addressErrors.phone) setAddressErrors(prev => ({ ...prev, phone: '' })); }} style={{ fontSize: '16px', width: '100%' }} />
                            {addressErrors.phone && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{addressErrors.phone}</span>}
                          </div>
                        </div>
                        <div className="fk-form-row">
                          <div style={{ flex: 1 }}>
                            <input type="text" placeholder="Pincode" value={newAddress.pincode} onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setNewAddress({...newAddress, pincode: v}); if (addressErrors.pincode) setAddressErrors(prev => ({ ...prev, pincode: '' })); }} style={{ fontSize: '16px', width: '100%' }} />
                            {addressErrors.pincode && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{addressErrors.pincode}</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <input type="text" placeholder="Locality" value={newAddress.locality} onChange={e => { setNewAddress({...newAddress, locality: e.target.value}); if (addressErrors.locality) setAddressErrors(prev => ({ ...prev, locality: '' })); }} style={{ fontSize: '16px', width: '100%' }} />
                            {addressErrors.locality && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{addressErrors.locality}</span>}
                          </div>
                        </div>
                        <div className="fk-form-row full">
                          <div style={{ width: '100%' }}>
                            <textarea placeholder="Address (Area and Street)" rows="3" value={newAddress.address} onChange={e => { setNewAddress({...newAddress, address: e.target.value}); if (addressErrors.address) setAddressErrors(prev => ({ ...prev, address: '' })); }} style={{ fontSize: '16px', width: '100%' }}></textarea>
                            {addressErrors.address && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{addressErrors.address}</span>}
                          </div>
                        </div>
                        <div className="fk-form-row">
                          <div style={{ flex: 1 }}>
                            <input type="text" placeholder="City/District/Town" value={newAddress.city} onChange={e => { setNewAddress({...newAddress, city: e.target.value}); if (addressErrors.city) setAddressErrors(prev => ({ ...prev, city: '' })); }} style={{ fontSize: '16px', width: '100%' }} />
                            {addressErrors.city && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{addressErrors.city}</span>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <input type="text" placeholder="State" value={newAddress.state} onChange={e => { setNewAddress({...newAddress, state: e.target.value}); if (addressErrors.state) setAddressErrors(prev => ({ ...prev, state: '' })); }} style={{ fontSize: '16px', width: '100%' }} />
                            {addressErrors.state && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{addressErrors.state}</span>}
                          </div>
                        </div>
                        <div className="fk-radio-group" style={{ margin: '16px 0' }}>
                          <span style={{ fontSize: '14px', color: '#878787', marginRight: '16px' }}>{t('addressType')}</span>
                          <label><input type="radio" name="type" value="Home" checked={newAddress.type === 'Home'} onChange={e => setNewAddress({...newAddress, type: e.target.value})} /> {t('home')}</label>
                          <label><input type="radio" name="type" value="Work" checked={newAddress.type === 'Work'} onChange={e => setNewAddress({...newAddress, type: e.target.value})} /> {t('work')}</label>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                          <button type="submit" className="fk-save-btn" style={{ marginTop: 0 }} disabled={saving}>{t('saveAndDeliver')}</button>
                          <button type="button" className="fk-cancel-btn" onClick={() => { setShowAddAddress(false); setAddressErrors({}); }}>{t('cancel').toUpperCase()}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="fk-address-list">
                    {profile.addresses?.map((addr) => (
                      <div key={addr.id} className="fk-address-card">
                        <div className="fk-address-header">
                          <span className="fk-address-type">{addr.type}</span>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="fk-delete-btn">{t('delete')}</button>
                        </div>
                        <p className="fk-address-name"><strong>{addr.name}</strong> &nbsp;&nbsp; <strong>{addr.phone}</strong></p>
                        <p className="fk-address-detail">{addr.address}, {addr.locality}</p>
                        <p className="fk-address-detail">{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

              {activeTab === 'notifications' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>{t('pushNotifications')}</h2>
                  </div>
                  <div className="fk-tab-body" style={{ padding: '32px' }}>
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
                      <p style={{ fontSize: '1.1rem', color: '#212121', marginBottom: '0.5rem', fontWeight: '500' }}>{t('stayUpdated')}</p>
                      <p style={{ fontSize: '0.9rem', color: '#878787', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                        {t('pushDescription')}
                      </p>
                      <button 
                        className="fk-save-btn" 
                        style={{ display: 'inline-block' }}
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.requestPushPermission) {
                            window.requestPushPermission();
                          } else {
                            addToast(t('enableInBrowser'), 'info');
                          }
                        }}
                      >
                        {t('enableNotifications')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="fk-tab-content">
                  <div className="fk-tab-header">
                    <h2>{t('myOrders')}</h2>
                  </div>
                  <div className="fk-tab-body" style={{ padding: '32px' }}>
                  {loadingOrders ? <p style={{ padding: '2rem', textAlign: 'center' }}>{t('loading')}</p> : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                      <p style={{ fontSize: '1.2rem', color: '#878787', marginBottom: '1rem' }}>{t('noOrdersFound')}</p>
                      <Link href="/products" className="fk-save-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>{t('startShopping').toUpperCase()}</Link>
                    </div>
                  ) : (
                    <div className="fk-orders-list">
                      {orders.map(order => (
                        <div key={order.id} style={{ display: 'flex', flexDirection: 'column', border: '1px solid #f0f0f0', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                          <div className="fk-order-card" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: expandedOrder === order.id ? 'none' : '1px solid transparent', marginBottom: 0, background: 'transparent' }}>
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
                              <p className="fk-order-date">{t('orderedOn')} {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="fk-order-price">₹{order.total?.toLocaleString('en-IN')}</div>
                            <div className="fk-order-status">
                              <span className={`fk-status-dot ${order.status.toLowerCase().replace(/[^a-z]/g, '')}`}></span>
                              {order.status}
                            </div>
                            <div className="fk-order-action">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setExpandedOrder(expandedOrder === order.id ? null : order.id); }}
                                style={{ background: 'transparent', border: '1px solid #2874f0', color: '#2874f0', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', width: '100%' }}
                              >
                                {expandedOrder === order.id ? 'Close Track' : 'Track Your Order'}
                              </button>
                            </div>
                          </div>
                          {expandedOrder === order.id && <OrderTimeline order={order} />}
                        </div>
                      ))}
                    </div>
                  )}
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
