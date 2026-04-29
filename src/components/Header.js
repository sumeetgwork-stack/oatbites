'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'next-auth/react';

export default function Header() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isLoggedIn, isAdmin } = useAuth();

  return (
    <header className="header glass-panel">
      <Link href="/" className="logo">
        OATBITES <span style={{fontWeight: 300}}>BY SEJ</span>
      </Link>
      <nav className="nav-links">
        <Link href="/about" className="nav-link">About Us</Link>
        
        {isLoggedIn && isAdmin && (
          <Link href="/admin" className="nav-link admin-link">Admin</Link>
        )}
        
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
              <Link href="/dashboard" className="dropdown-item">Dashboard</Link>
              <button 
                className="dropdown-item sign-out-btn"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="nav-link sign-in-link">Sign In</Link>
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
