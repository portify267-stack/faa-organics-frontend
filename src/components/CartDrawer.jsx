import React from 'react';
import { useCart } from '../context/CartContext';
import { FREE_GIFT_ITEM, FREE_GIFT_THRESHOLD, FREE_SHIPPING_THRESHOLD } from '../data/products';

export default function CartDrawer() {
  const {
    cart,
    displayCart,
    subtotal,
    freeGiftUnlocked,
    freeShippingUnlocked,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeFromCart
  } = useCart();

  if (!isCartOpen) return null;

  const giftRemaining = Math.max(0, FREE_GIFT_THRESHOLD - subtotal);
  const giftProgress = Math.min(100, (subtotal / FREE_GIFT_THRESHOLD) * 100);

  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <>
      <div className="cart-drawer-overlay active" id="cart-overlay" onClick={closeCart} aria-hidden="false"></div>
      <div className="cart-drawer active" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping Cart">
        <div className="cart-header">
          <h3>Your Cart</h3>
          <button type="button" className="cart-close-btn" id="cart-close" aria-label="Close shopping cart" onClick={closeCart}>
            &times;
          </button>
        </div>

        {/* Free Gift Progress Banner */}
        {cart.length > 0 && (
          freeGiftUnlocked ? (
            <div className="cart-threshold-banner threshold-unlocked">
              <span>🎉 Congratulations! Free Gift Unlocked!</span>
            </div>
          ) : (
            <div className="cart-threshold-banner threshold-progress">
              <span>🎁 Add ₹{giftRemaining} more to unlock a FREE Gift!</span>
              <div className="threshold-progress-bar">
                <div className="threshold-progress-fill" style={{ width: `${giftProgress}%` }}></div>
              </div>
            </div>
          )
        )}

        {/* Free Shipping Progress Banner */}
        {cart.length > 0 && (
          freeShippingUnlocked ? (
            <div className="cart-threshold-banner threshold-unlocked">
              <span>🚚 FREE Shipping Unlocked!</span>
            </div>
          ) : (
            <div className="cart-threshold-banner threshold-progress">
              <span>🚚 Add ₹{shippingRemaining} more for FREE Shipping!</span>
              <div className="threshold-progress-bar">
                <div className="threshold-progress-fill" style={{ width: `${shippingProgress}%` }}></div>
              </div>
            </div>
          )
        )}

        {/* Cart Items List */}
        <div className="cart-body" id="cart-items-container">
          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <span className="empty-cart-icon">🛒</span>
              <p>Your skincare basket is empty.</p>
              <button
                type="button"
                className="btn btn-outline"
                id="browse-btn"
                onClick={() => {
                  closeCart();
                  const prod = document.getElementById('products');
                  if (prod) prod.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            displayCart.map(item => {
              const isGift = item.id === FREE_GIFT_ITEM.id;
              if (isGift) {
                return (
                  <article key={item.id} className="cart-item cart-item-free-gift" data-item-id={item.id}>
                    <div className="cart-item-img-wrap free-gift-icon-wrap">
                      <span className="free-gift-icon">🎁</span>
                    </div>
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-meta">Complimentary with your order</p>
                      <div className="cart-item-row-bottom">
                        <span className="cart-item-price free-gift-price">FREE</span>
                      </div>
                    </div>
                  </article>
                );
              }
              return (
                <article key={item.id} className="cart-item" data-item-id={item.id}>
                  <div className="cart-item-img-wrap">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                  </div>
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.name}</h4>
                    <p className="cart-item-meta">{item.weight}</p>
                    <div className="cart-item-row-bottom">
                      <div className="quantity-stepper cart-stepper">
                        <button
                          type="button"
                          className="stepper-btn minus"
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                        >
                          -
                        </button>
                        <span className="stepper-value">{item.qty}</span>
                        <button
                          type="button"
                          className="stepper-btn plus"
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-item-price">₹{item.price * item.qty}</span>
                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove product"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span className="subtotal-label">Subtotal</span>
              <span className="subtotal-value" id="cart-subtotal">₹{subtotal}</span>
            </div>
            <div className="cart-shipping-row">
              <span className="shipping-label">Shipping</span>
              <span className="shipping-value" id="cart-shipping">
                {freeShippingUnlocked ? 'FREE' : 'Calculated at checkout'}
              </span>
            </div>
            <div className="cart-total-row">
              <span className="total-label">Estimated Total</span>
              <span className="total-value" id="cart-total">₹{subtotal}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary w-full"
              id="checkout-btn"
              onClick={openCheckout}
            >
              Proceed to Checkout
            </button>
            <button
              type="button"
              className="btn btn-outline w-full"
              id="continue-shopping"
              onClick={closeCart}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

