'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isLoggedIn, isAdmin } = useAuth();
  const { locale, changeLanguage, t, LANGUAGE_NAMES } = useLanguage();
  const [userAddresses, setUserAddresses] = useState([]);
  const [addressOpen, setAddressOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const addressRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (addressRef.current && !addressRef.current.contains(e.target)) {
        setAddressOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [activeAddress, setActiveAddress] = useState(null);

  // Fetch user profile for addresses
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.address) setUserAddress(data.address);
          if (data.addresses) {
            setUserAddresses(data.addresses);
            
            // Set active address from localStorage or default to first one
            const savedAddrId = localStorage.getItem('activeDeliveryAddressId');
            const found = data.addresses.find(a => a.id === savedAddrId) || data.addresses[0];
            if (found) {
              setActiveAddress(found);
              const formatted = `${found.address}, ${found.locality}, ${found.city}, ${found.state} - ${found.pincode}`;
              setUserAddress(formatted);
            }
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  const selectAddress = (addr) => {
    setActiveAddress(addr);
    const formatted = `${addr.address}, ${addr.locality}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
    setUserAddress(formatted);
    localStorage.setItem('activeDeliveryAddressId', addr.id);
    setAddressOpen(false);
  };

  // Display name or user name
  const displayName = activeAddress?.name || user?.name || '';

  return (
    <header className="header">
      <div className="header-left-col">
        <Link href="/" className="logo">
          OATBITES <span style={{fontWeight: 300}}>BY SEJ</span>
        </Link>
        
        {/* Amazon-style Address Display & Dropdown */}
        {isLoggedIn && (
          <div className="nav-address-container" ref={addressRef}>
            <button 
              className="nav-address-btn" 
              onClick={() => setAddressOpen(!addressOpen)}
              title={userAddress || 'Set your address'}
            >
              <span className="nav-address-icon">📍</span>
              <div className="nav-address-text">
                <span className="nav-address-label">{t('deliverTo')}</span>
                <span className="nav-address-value">{displayName || t('setAddress')}</span>
              </div>
            </button>

            {addressOpen && (
              <div className="address-dropdown glass-panel">
                <div className="address-dropdown-header">
                  <h3>Choose your delivery location</h3>
                  <p>Delivery options and speeds may vary for different locations</p>
                </div>
                <div className="address-dropdown-list">
                  {userAddresses.length > 0 ? (
                    userAddresses.map((addr) => (
                      <button 
                        key={addr.id} 
                        className={`address-option ${userAddress.includes(addr.pincode) ? 'active' : ''}`}
                        onClick={() => selectAddress(addr)}
                      >
                        <span className="addr-type">{addr.type}</span>
                        <strong>{addr.name}</strong>
                        <p>{addr.address}, {addr.locality}</p>
                        <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      </button>
                    ))
                  ) : (
                    <div className="no-address-msg">
                      <p>No addresses saved.</p>
                      <Link href="/dashboard" onClick={() => setAddressOpen(false)} className="btn-link">Manage Addresses</Link>
                    </div>
                  )}
                </div>
                <div className="address-dropdown-footer">
                  <Link href="/dashboard" onClick={() => setAddressOpen(false)}>Manage address book</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="nav-links">
        {isLoggedIn && isAdmin && (
          <Link href="/admin" className="nav-link admin-link">{t('admin')}</Link>
        )}

        {/* Language Selector */}
        <div className="lang-selector-container" ref={langRef}>
          <button
            className="lang-btn nav-link"
            onClick={() => setLangOpen(!langOpen)}
            aria-label="Change Language"
          >
            🌐 <span className="lang-code">{locale.toUpperCase()}</span>
          </button>
          {langOpen && (
            <div className="lang-dropdown">
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <button
                  key={code}
                  className={`lang-option ${locale === code ? 'active' : ''}`}
                  onClick={() => { changeLanguage(code); setLangOpen(false); }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {isLoggedIn ? (
          <div className="user-dropdown-container">
            <Link href="/dashboard" className="nav-link" style={{ padding: 0 }}>
              {user?.image ? (
                <img 
                  src={user.image} 
                  alt={user.name} 
                  className="user-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="user-initials">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </Link>
            <div className="user-dropdown-menu">
              <Link href="/dashboard" className="dropdown-item">{t('dashboard')}</Link>
              <button 
                className="dropdown-item sign-out-btn"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="nav-link sign-in-link">{t('signIn')}</Link>
        )}
        
        <button 
          className="cart-btn nav-link"
          onClick={() => setIsCartOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontFamily: 'inherit' }}
        >
          <span>🛒</span>
          {cartCount > 0 && (
            <span className="cart-badge">{cartCount}</span>
          )}
        </button>
      </nav>
    </header>
  );
}
