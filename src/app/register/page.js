'use client';

import { signIn } from 'next-auth/react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

export default function RegisterPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // After successful registration, log them in
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError('Registered successfully but login failed.');
        setIsSubmitting(false);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="main-wrapper">
        <div className="fixed-bg"><Scene /></div>
        <div className="content-layer">
          <div className="auth-page">
            <div className="auth-card glass-panel">
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main-wrapper">
      <div className="fixed-bg"><Scene /></div>
      <div className="content-layer">
        <div className="auth-page">
          <div className="auth-card glass-panel">
            <div className="auth-logo">🌾</div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join Oatbites to start shopping</p>
            
            {error && <div className="auth-error">{error}</div>}
            
            <form onSubmit={handleRegister} className="auth-form">
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="auth-input"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="auth-input"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength={6}
                className="auth-input"
              />
              <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>
            
            <button 
              className="google-btn"
              onClick={() => signIn('google', { callbackUrl: '/' })}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign up with Google
            </button>
            
            <p className="auth-footer-text">
              Already have an account? <Link href="/login" className="auth-link">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
