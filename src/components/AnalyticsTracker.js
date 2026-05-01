'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Generate a simple session ID if not exists
    let sessionId = sessionStorage.getItem('ob_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('ob_session_id', sessionId);
    }

    // Don't track admin pages to avoid inflating stats
    if (pathname && !pathname.startsWith('/admin')) {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: pathname, 
          sessionId,
          email: user?.email || null 
        })
      }).catch(() => {
        // Silently fail if tracking fails
      });
    }
  }, [pathname, user]);

  return null; // This component doesn't render anything
}
