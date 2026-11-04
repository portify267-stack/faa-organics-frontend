import React, { createContext, useContext, useState, useEffect } from 'react';
import { products, FREE_GIFT_ITEM, FREE_GIFT_THRESHOLD, FREE_SHIPPING_THRESHOLD } from '../data/products';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('faa_organic_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('faa_organic_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  // Calculate subtotal (excluding free gift)
  const subtotal = cart.reduce((sum, item) => {
    if (item.id === FREE_GIFT_ITEM.id) return sum;
    return sum + (item.price * item.qty);
  }, 0);

  // Total quantity of paid items
  const totalItemsCount = cart.reduce((count, item) => {
    if (item.id === FREE_GIFT_ITEM.id) return count;
    return count + item.qty;
  }, 0);

  const freeGiftUnlocked = subtotal >= FREE_GIFT_THRESHOLD;
  const freeShippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD;

  // Add product to cart
  const addToCart = (productId, qty = 1, productObj = null) => {
    let product = productObj;
    if (!product) {
      product = products.find(p => p.id === productId || p._id === productId);
    }
    if (!product) return;

    const targetId = product.id || product._id || productId;

    setCart(prev => {
      const existing = prev.find(item => item.id === targetId || item.id === productId);
      if (existing) {
        return prev.map(item =>
          item.id === targetId || item.id === productId
            ? { ...item, qty: Math.min(10, item.qty + qty) }
            : item
        );
      }
      return [...prev, {
        id: targetId,
        name: product.name,
        price: Number(product.price),
        weight: product.weight || product.unit || '100 g',
        image: product.image || product.images?.[0]?.url || '/assets/images/img11.jpeg',
        qty: Math.min(10, qty)
      }];
    });
  };

  // Remove item
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId
        ? { ...item, qty: Math.min(10, newQty) }
        : item
    ));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Full cart list including free gift if unlocked
  const displayCart = [...cart];
  if (freeGiftUnlocked && cart.length > 0) {
    if (!displayCart.some(i => i.id === FREE_GIFT_ITEM.id)) {
      displayCart.push(FREE_GIFT_ITEM);
    }
  }

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const openPolicy = (key) => setActivePolicy(key);
  const closePolicy = () => setActivePolicy(null);

  return (
    <CartContext.Provider value={{
      cart,
      displayCart,
      subtotal,
      totalItemsCount,
      freeGiftUnlocked,
      freeShippingUnlocked,
      isCartOpen,
      isCheckoutOpen,
      activePolicy,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      openPolicy,
      closePolicy,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

