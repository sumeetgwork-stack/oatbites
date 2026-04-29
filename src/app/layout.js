import './globals.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import CartDrawer from '../components/CartDrawer';
import { ToastProvider } from '../components/Toast';

export const metadata = {
  title: 'Oatbites by SEJ | Premium Oat Products',
  description: 'Premium oatbites for a healthy lifestyle. Experience our 3D interactive world and shop the finest organic oat products.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
