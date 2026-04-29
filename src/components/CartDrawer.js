'use client';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="item-color-box" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="item-color-box" style={{ backgroundColor: item.color }}></div>
                )}
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>₹{item.price?.toLocaleString('en-IN')}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className="remove-btn" onClick={() => {
                  removeFromCart(item.id);
                  addToast(`${item.name} removed from cart.`, 'info');
                }}>Remove</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
