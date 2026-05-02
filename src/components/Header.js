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
  const [langOpen, setLangOpen] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const langRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch user address for navbar display
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.address) {
            setUserAddress(data.address);
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  // Extract short address (city or first part)
  const shortAddress = userAddress
    ? userAddress.split(',').pop()?.trim() || userAddress.slice(0, 20)
    : '';

  return (
    <header className="header glass-panel">
      <div className="header-left">
        <Link href="/" className="logo">
          OATBITES <span style={{fontWeight: 300}}>BY SEJ</span>
        </Link>
        
        {/* Amazon-style Address Display */}
        {isLoggedIn && (
          <Link href="/dashboard" className="nav-address-btn" title={userAddress || 'Set your address'}>
            <span className="nav-address-icon">📍</span>
            <div className="nav-address-text">
              <span className="nav-address-label">{t('deliverTo')}</span>
              <span className="nav-address-value">{shortAddress || t('setAddress')}</span>
            </div>
          </Link>
        )}
      </div>

      <nav className="nav-links">
        <Link href="/about" className="nav-link">{t('aboutUs')}</Link>
        
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
