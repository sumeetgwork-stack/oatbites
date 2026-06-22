'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const syncTimeoutRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const isSyncingRef = useRef(false);

  // Save cart to database (debounced)
  const saveToDb = useCallback((items) => {
    if (!isLoggedIn) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      isSyncingRef.current = true;
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
        .catch(err => console.error('Failed to sync cart to DB:', err))
        .finally(() => { isSyncingRef.current = false; });
    }, 500); // 500ms debounce so rapid add/remove doesn't spam the server
  }, [isLoggedIn]);

  // Merge local cart with server cart (keeps higher quantities, no duplicates)
  const mergeCarts = (localCart, serverCart) => {
    const merged = [...serverCart];
    localCart.forEach(localItem => {
      const existing = merged.find(item => item.id === localItem.id);
      if (existing) {
        // Keep the higher quantity
        existing.quantity = Math.max(existing.quantity, localItem.quantity);
      } else {
        merged.push(localItem);
      }
    });
    return merged;
  };

  // Load cart: from DB (if logged in) or localStorage (if guest)
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to resolve

    const loadCart = async () => {
      const savedCart = (() => {
        try {
          const raw = localStorage.getItem('oatbites_cart');
          return raw ? JSON.parse(raw) : [];
        } catch { return []; }
      })();

      if (isLoggedIn) {
        try {
          const res = await fetch('/api/cart');
          const data = await res.json();
          const serverCart = data.items || [];

          // Merge: if user had items in localStorage before logging in, merge them
          if (savedCart.length > 0 && serverCart.length > 0) {
            const merged = mergeCarts(savedCart, serverCart);
            setCart(merged);
            // Save merged result back to DB
            saveToDb(merged);
          } else if (savedCart.length > 0) {
            // Local cart only — push it to DB
            setCart(savedCart);
            saveToDb(savedCart);
          } else {
            // Server cart only (or both empty)
            setCart(serverCart);
          }
          // Clear localStorage since DB is now the source of truth
          localStorage.removeItem('oatbites_cart');
        } catch (err) {
          console.error('Failed to load cart from DB:', err);
          setCart(savedCart);
        }
      } else {
        setCart(savedCart);
      }
      hasLoadedRef.current = true;
    };

    loadCart();

    // Sync live product prices in background
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setCart(prevCart => {
            let updated = false;
            const syncedCart = prevCart.map(cartItem => {
              const liveProduct = data.products.find(p => p.id === cartItem.id);
              if (liveProduct && (liveProduct.price !== cartItem.price || liveProduct.name !== cartItem.name)) {
                updated = true;
                return {
                  ...cartItem,
                  price: liveProduct.price,
                  name: liveProduct.name,
                  image: liveProduct.image,
                };
              }
              return cartItem;
            });
            return updated ? syncedCart : prevCart;
          });
        }
      })
      .catch(err => console.error('Failed to sync cart prices', err));
  }, [isLoggedIn, status, saveToDb]);

  // Persist cart changes — to DB (logged in) or localStorage (guest)
  useEffect(() => {
    if (!hasLoadedRef.current) return; // Don't save until initial load is done
    if (isSyncingRef.current) return; // Don't re-save while syncing from DB

    if (isLoggedIn) {
      saveToDb(cart);
    } else {
      try {
        localStorage.setItem('oatbites_cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Failed to save cart:', error);
      }
    }
  }, [cart, isLoggedIn, saveToDb]);

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
