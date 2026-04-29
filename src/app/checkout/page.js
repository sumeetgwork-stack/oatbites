'use client';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isLoggedIn && cart.length === 0) {
      router.push('/products');
    }
  }, [cart, isLoading, isLoggedIn, router]);

  const handlePayment = async () => {
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      alert('Please fill in all shipping details');
      return;
    }

    setProcessing(true);

    try {
      // 1. Create order on server
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
          total: cartTotal,
          shippingAddress: address,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Oatbites by SEJ',
        description: `Order ${data.orderId}`,
        order_id: data.razorpayOrderId,
        handler: async function(response) {
          // 3. Verify payment on server
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.orderId,
            }),
          });

          if (verifyRes.ok) {
            clearCart();
            router.push(`/order-confirmation?id=${data.orderId}`);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || address.fullName,
          email: user?.email || '',
          contact: address.phone,
        },
        theme: {
          color: '#e67e22',
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  if (isLoading || !isLoggedIn || cart.length === 0) {
    return (
      <main className="main-wrapper">
        <div className="fixed-bg"><Scene /></div>
        <div className="content-layer">
          <div className="page-container">
            <p style={{ textAlign: 'center', padding: '4rem' }}>Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <main className="main-wrapper">
        <div className="fixed-bg"><Scene /></div>
        <div className="content-layer">
          <div className="page-container">
            <div className="checkout-layout">
              {/* Shipping Form */}
              <div className="checkout-form glass-panel">
                <h2>Shipping Details</h2>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Full Name</span>
                    <input 
                      type="text" 
                      value={address.fullName}
                      onChange={e => setAddress({...address, fullName: e.target.value})}
                      placeholder="Your full name"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Phone Number</span>
                    <input 
                      type="tel" 
                      value={address.phone}
                      onChange={e => setAddress({...address, phone: e.target.value})}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </label>
                  <label className="form-field full-width">
                    <span>Street Address</span>
                    <input 
                      type="text" 
                      value={address.street}
                      onChange={e => setAddress({...address, street: e.target.value})}
                      placeholder="House No., Street, Locality"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>City</span>
                    <input 
                      type="text" 
                      value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                      placeholder="City"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>State</span>
                    <input 
                      type="text" 
                      value={address.state}
                      onChange={e => setAddress({...address, state: e.target.value})}
                      placeholder="State"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Pincode</span>
                    <input 
                      type="text" 
                      value={address.pincode}
                      onChange={e => setAddress({...address, pincode: e.target.value})}
                      placeholder="XXXXXX"
                      required
                    />
                  </label>
                </div>
              </div>

              {/* Order Summary */}
              <div className="checkout-summary glass-panel">
                <h2>Order Summary</h2>
                <div className="checkout-items">
                  {cart.map(item => (
                    <div key={item.id} className="checkout-item">
                      <div className="checkout-item-color" style={{ background: item.color }}></div>
                      <div className="checkout-item-info">
                        <h4>{item.name}</h4>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <div className="checkout-item-price">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="checkout-divider"></div>
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Shipping</span>
                  <span style={{ color: '#27ae60' }}>Free</span>
                </div>
                <div className="checkout-divider"></div>
                <div className="checkout-total-row grand-total">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <button 
                  className="btn-primary checkout-pay-btn"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Pay ₹${cartTotal.toLocaleString('en-IN')} with Razorpay`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
