'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from './Toast';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPermission(Notification.permission);
      
      // Expose function globally so the Dashboard can trigger it manually later
      window.requestPushPermission = requestPermission;

      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(err => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && permission === 'granted') {
      subscribeUser();
    }
  }, [isLoggedIn, permission]);

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        // Send to server just in case it's not there
        await saveSubscription(existingSubscription);
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID public key not found');
        return;
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      await saveSubscription(subscription);
      console.log('User is subscribed to push notifications.');
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
    }
  };

  const saveSubscription = async (subscription) => {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });
    } catch (err) {
      console.error('Failed to save subscription on server:', err);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        addToast(t('notificationsEnabled'), 'success');
        if (isLoggedIn) {
          subscribeUser();
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const dismissPrompt = () => {
    setPermission('denied'); // temporary dismiss in state
    localStorage.setItem('push_prompt_dismissed', 'true');
  };

  // Only show the prompt if they haven't made a choice and are logged in
  const isDismissed = typeof window !== 'undefined' ? localStorage.getItem('push_prompt_dismissed') : null;
  if (isLoggedIn && permission === 'default' && !isDismissed) {
    return (
      <div className="push-prompt">
        <p>{t('enableNotifPrompt')}</p>
        <div className="push-actions">
          <button onClick={requestPermission} className="btn-primary push-btn">{t('enable')}</button>
          <button onClick={dismissPrompt} className="btn-secondary push-btn">{t('notNow')}</button>
        </div>
        <style jsx>{`
          .push-prompt {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #ffffff;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 9999;
            max-width: 320px;
            border-left: 4px solid #2e7d32;
            animation: slideIn 0.3s ease-out;
          }
          .push-prompt p {
            margin: 0 0 12px;
            font-size: 0.95rem;
            color: #2c1810;
            line-height: 1.4;
          }
          .push-actions {
            display: flex;
            gap: 10px;
          }
          .push-btn {
            padding: 8px 16px;
            font-size: 0.85rem;
            flex: 1;
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @media (max-width: 768px) {
            .push-prompt {
              bottom: 16px;
              top: auto;
              right: 16px;
              left: 16px;
              max-width: none;
              border-left: none;
              border-top: none;
              border-bottom: 4px solid #2e7d32;
              animation: slideUp 0.3s ease-out;
            }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
