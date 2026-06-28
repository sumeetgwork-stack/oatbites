'use client';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('../../components/Scene'), { ssr: false });

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isLoggedIn, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const SHIPPING_COST = 30;
  const COD_HANDLING_FEE = 10;
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!address.fullName?.trim()) errors.fullName = 'Full Name is required';
    else if (address.fullName.trim().length < 2) errors.fullName = 'Full Name must be at least 2 characters';

    if (!address.phone?.trim()) errors.phone = 'Phone Number is required';
    else if (address.phone.length !== 10) errors.phone = 'Phone Number must be exactly 10 digits';

    if (!address.street?.trim()) errors.street = 'Street Address is required';
    else if (address.street.trim().length < 5) errors.street = 'Address must be at least 5 characters';

    if (!address.city?.trim()) errors.city = 'City is required';
    else if (address.city.trim().length < 2) errors.city = 'City must be at least 2 characters';

    if (!address.state?.trim()) errors.state = 'State is required';
    else if (address.state.trim().length < 2) errors.state = 'State must be at least 2 characters';

    if (!address.pincode?.trim()) errors.pincode = 'Pincode is required';
    else if (address.pincode.length !== 6) errors.pincode = 'Pincode must be exactly 6 digits';

    if (!address.fullName || address.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }
    if (!address.phone || !/^\d{10}$/.test(address.phone)) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    if (!address.street || address.street.trim().length < 5) {
      errors.street = 'Street address must be at least 5 characters';
    }
    if (!address.city || address.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters';
    }
    if (!address.state || address.state.trim().length < 2) {
      errors.state = 'State must be at least 2 characters';
    }
    if (!address.pincode || !/^\d{6}$/.test(address.pincode)) {
      errors.pincode = 'Pincode must be exactly 6 digits';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      if (cart.length === 0) {
        router.push('/products');
        return;
      }

      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          const savedAddrId = localStorage.getItem('activeDeliveryAddressId');
          let selectedAddr = null;

          if (savedAddrId && data.addresses) {
            selectedAddr = data.addresses.find(a => a.id === savedAddrId);
          }

          if (!selectedAddr && data.addresses && data.addresses.length > 0) {
            selectedAddr = data.addresses[0];
          }

          if (selectedAddr) {
            setAddress({
              fullName: selectedAddr.name || user?.name || '',
              phone: selectedAddr.phone || '',
              street: `${selectedAddr.address}, ${selectedAddr.locality}`,
              city: selectedAddr.city || '',
              state: selectedAddr.state || '',
              pincode: selectedAddr.pincode || '',
            });
          } else if (data.address) {
            setAddress(prev => ({
              ...prev,
              fullName: user?.name || '',
              street: data.address
            }));
          }
        })
        .catch(console.error);
    }
  }, [cart, isLoading, isLoggedIn, router, user?.name]);

  const handleCOD = async () => {
    if (!validateForm()) return;

    setProcessing(true);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
          total: cartTotal + SHIPPING_COST + COD_HANDLING_FEE,
          shippingAddress: address,
          paymentMethod: 'COD',
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      clearCart();
      router.push(`/order-confirmation?id=${data.orderId}`);
    } catch (error) {
      console.error('COD failed:', error);
      alert('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setProcessing(true);

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
          total: cartTotal + SHIPPING_COST,
          shippingAddress: address,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Oatbites by SEJ',
        description: `Order ${data.orderId}`,
        order_id: data.razorpayOrderId,
        handler: async function(response) {
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
              <div className="checkout-form glass-panel">
                <h2>{t('shippingDetails')}</h2>
                <div className="form-grid">
                  <div className="form-field">
                    <span>{t('fullName')}</span>
                    <input 
                      type="text" 
                      value={address.fullName}
                      onChange={e => {
                        setAddress({...address, fullName: e.target.value});
                        setFieldErrors(p => ({...p, fullName: ''}));
                      }}
                      placeholder={t('fullName')}
                      className={fieldErrors.fullName ? 'input-error' : ''}
                      style={{ fontSize: '16px' }}
                    />
                    {fieldErrors.fullName && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{fieldErrors.fullName}</span>}
                  </div>
                  <div className="form-field">
                    <span>{t('phone')}</span>
                    <input 
                      type="tel" 
                      value={address.phone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setAddress({...address, phone: val});
                        setFieldErrors(p => ({...p, phone: ''}));
                      }}
                      placeholder="10-digit number"
                      className={fieldErrors.phone ? 'input-error' : ''}
                      style={{ fontSize: '16px' }}
                    />
                    {fieldErrors.phone && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{fieldErrors.phone}</span>}
                  </div>
                  <div className="form-field full-width">
                    <span>{t('streetAddress')}</span>
                    <input 
                      type="text" 
                      value={address.street}
                      onChange={e => {
                        setAddress({...address, street: e.target.value});
                        setFieldErrors(p => ({...p, street: ''}));
                      }}
                      placeholder={t('streetAddress')}
                      className={fieldErrors.street ? 'input-error' : ''}
                      style={{ fontSize: '16px' }}
                    />
                    {fieldErrors.street && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{fieldErrors.street}</span>}
                  </div>
                  <div className="form-field">
                    <span>{t('city')}</span>
                    <input 
                      type="text" 
                      value={address.city}
                      onChange={e => {
                        setAddress({...address, city: e.target.value});
                        setFieldErrors(p => ({...p, city: ''}));
                      }}
                      placeholder={t('city')}
                      className={fieldErrors.city ? 'input-error' : ''}
                      style={{ fontSize: '16px' }}
                    />
                    {fieldErrors.city && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{fieldErrors.city}</span>}
                  </div>
                  <div className="form-field">
                    <span>{t('state')}</span>
                    <input 
                      type="text" 
                      value={address.state}
                      onChange={e => {
                        setAddress({...address, state: e.target.value});
                        setFieldErrors(p => ({...p, state: ''}));
                      }}
                      placeholder={t('state')}
                      className={fieldErrors.state ? 'input-error' : ''}
                      style={{ fontSize: '16px' }}
                    />
                    {fieldErrors.state && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{fieldErrors.state}</span>}
                  </div>
                  <div className="form-field">
                    <span>{t('pincode')}</span>
                    <input 
                      type="text" 
                      value={address.pincode}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setAddress({...address, pincode: val});
                        setFieldErrors(p => ({...p, pincode: ''}));
                      }}
                      placeholder="6-digit pincode"
                      className={fieldErrors.pincode ? 'input-error' : ''}
                      style={{ fontSize: '16px' }}
                    />
                    {fieldErrors.pincode && <span className="field-error" style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{fieldErrors.pincode}</span>}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="checkout-summary glass-panel">
                <h2>{t('orderSummary')}</h2>
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
                  <span>{t('subtotal')}</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="checkout-total-row">
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    {t('shipping')}
                    <small style={{ fontSize: '0.8em', color: '#666', fontWeight: 'normal' }}>(Delivery in 5-6 days)</small>
                  </span>
                  <span>₹{SHIPPING_COST}</span>
                </div>
                <div className="checkout-divider"></div>
                <div className="checkout-total-row grand-total">
                  <span>{t('total')}</span>
                  <span>₹{(cartTotal + SHIPPING_COST).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexDirection: 'column' }}>
                  <button 
                    className="btn-primary checkout-pay-btn"
                    onClick={handlePayment}
                    disabled={processing}
                    style={{ margin: 0 }}
                  >
                    {processing ? 'Processing...' : `Pay Online ₹${(cartTotal + SHIPPING_COST).toLocaleString('en-IN')}`}
                  </button>
                  <button 
                    className="btn-secondary checkout-pay-btn"
                    onClick={handleCOD}
                    disabled={processing}
                    style={{ background: '#f8f9fa', color: '#2c1810', border: '1px solid #dcdde1', margin: 0 }}
                  >
                    {processing ? 'Processing...' : `Cash on Delivery ₹${(cartTotal + SHIPPING_COST + COD_HANDLING_FEE).toLocaleString('en-IN')}`}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#888', margin: '0' }}>
                    COD includes ₹{COD_HANDLING_FEE} handling fee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
