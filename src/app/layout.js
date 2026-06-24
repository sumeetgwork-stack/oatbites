import './globals.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import { ToastProvider } from '../components/Toast';
import AnalyticsTracker from '../components/AnalyticsTracker';
import PushNotificationManager from '../components/PushNotificationManager';
import InstallPrompt from '../components/InstallPrompt';

export const metadata = {
  metadataBase: new URL('https://oatbites.in'),
  title: 'Oatbites by SEJ | Premium Oat Products',
  description: 'Premium oatbites for a healthy lifestyle. Experience our 3D interactive world and shop the finest organic oat products.',
  keywords: ['oatbites', 'premium oats', 'organic snacks', 'healthy lifestyle', 'oat products', 'SEJ'],
  authors: [{ name: 'SEJ' }],
  robots: 'index, follow',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Oatbites by SEJ',
    description: 'Premium oatbites for a healthy lifestyle. Experience our 3D interactive world and shop the finest organic oat products.',
    url: 'https://oatbites.in',
    siteName: 'Oatbites by SEJ',
    images: [{ url: '/logo.png', width: 500, height: 500, alt: 'Oatbites by SEJ Logo' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oatbites by SEJ | Premium Oat Products',
    description: 'Premium oatbites for a healthy lifestyle.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e67e22" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Oatbites" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <AnalyticsTracker />
            <CartProvider>
              <ToastProvider>
                <PushNotificationManager />
                <InstallPrompt />
                <Header />
                <CartDrawer />
                {children}
              </ToastProvider>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
