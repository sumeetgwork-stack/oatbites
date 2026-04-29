'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage and sync with live data on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('oatbites_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart); // Set immediately for snappy UI
        
        // Fetch live product data in background to ensure prices are up-to-date
        fetch('/api/admin/products')
          .then(res => res.json())
          .then(data => {
            if (data.products) {
              setCart(prevCart => {
                let updated = false;
                const syncedCart = prevCart.map(cartItem => {
                  const liveProduct = data.products.find(p => p.id === cartItem.id);
                  // If product exists and price (or other details) changed, update it
                  if (liveProduct && (liveProduct.price !== cartItem.price || liveProduct.name !== cartItem.name)) {
                    updated = true;
                    return { 
                      ...cartItem, 
                      price: liveProduct.price, 
                      name: liveProduct.name,
                      image: liveProduct.image 
                    };
                  }
                  return cartItem;
                });
                return updated ? syncedCart : prevCart;
              });
            }
          })
          .catch(err => console.error('Failed to sync cart prices', err));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('oatbites_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    // Cart drawer only opens on explicit Cart button click
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
