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

  return (
    <header className="header glass-panel">
      <Link href="/" className="logo">
        OATBITES <span style={{fontWeight: 300}}>BY SEJ</span>
      </Link>
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
