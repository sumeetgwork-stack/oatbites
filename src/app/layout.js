import './globals.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import { ToastProvider } from '../components/Toast';
import AnalyticsTracker from '../components/AnalyticsTracker';

export const metadata = {
  title: 'Oatbites by SEJ | Premium Oat Products',
  description: 'Premium oatbites for a healthy lifestyle. Experience our 3D interactive world and shop the finest organic oat products.',
  keywords: ['oatbites', 'premium oats', 'organic snacks', 'healthy lifestyle', 'oat products', 'SEJ'],
  authors: [{ name: 'SEJ' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Oatbites by SEJ',
    description: 'Premium oatbites for a healthy lifestyle. Experience our 3D interactive world and shop the finest organic oat products.',
    url: 'https://oatbitesbysej.vercel.app',
    siteName: 'Oatbites by SEJ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oatbites by SEJ | Premium Oat Products',
    description: 'Premium oatbites for a healthy lifestyle.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsTracker />
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Header />
              <CartDrawer />
              {children}
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
