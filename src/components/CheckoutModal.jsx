import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getShippingRateForState, STATE_OPTIONS } from '../data/shippingRates';
import { FREE_GIFT_ITEM, FREE_SHIPPING_THRESHOLD } from '../data/products';
import { orderService } from '../services/api';

export default function CheckoutModal() {
  const {
    displayCart,
    subtotal,
    isCheckoutOpen,
    closeCheckout,
    clearCart
  } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    pincode: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isCheckoutOpen) return null;

  const rateInfo = getShippingRateForState(formData.state);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCharge = isFreeShipping ? 0 : (rateInfo ? rateInfo.rate : 0);
  const grandTotal = subtotal + shippingCharge;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      errs.phone = 'Phone number must be exactly 10 digits.';
    }
    if (!formData.address.trim()) {
      errs.address = 'Delivery address is required.';
    }
    if (!formData.state) {
      errs.state = 'Please select your state.';
    }
    if (!formData.pincode.trim()) {
      errs.pincode = 'Pincode is required.';
    } else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Pincode must be exactly 6 digits.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      customerName: formData.name.trim(),
      customerEmail: formData.email.trim(),
      customerPhone: formData.phone.trim(),
      deliveryAddress: {
        street: formData.address.trim(),
        state: formData.state,
        postalCode: formData.pincode.trim(),
        country: 'India',
      },
      shippingCharge: shippingCharge,
      notes: formData.notes.trim(),
      items: displayCart.map(item => ({
        id: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty || 1,
      })),
    };

    try {
      const createdOrder = await orderService.create(payload);

      const realOrderId = createdOrder.orderId || createdOrder.id || `FAO-${Date.now()}`;
      const realTotal =
        createdOrder.finalTotal !== undefined ? `₹${createdOrder.finalTotal}` : `₹${grandTotal}`;
      const realSubtotal =
        createdOrder.subtotal !== undefined ? `₹${createdOrder.subtotal}` : `₹${subtotal}`;
      const realDeliveryCharge =
        createdOrder.deliveryCharges !== undefined ? createdOrder.deliveryCharges : shippingCharge;

      const orderData = {
        orderId: realOrderId,
        orderDate: new Date(createdOrder.orderDate || Date.now()).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        name: createdOrder.customerName || formData.name.trim(),
        email: createdOrder.customerEmail || formData.email.trim(),
        phone: createdOrder.customerPhone || formData.phone.trim(),
        address: createdOrder.deliveryAddress?.street || formData.address.trim(),
        state: createdOrder.deliveryAddress?.state || formData.state,
        pincode:
          createdOrder.deliveryAddress?.postalCode ||
          createdOrder.deliveryAddress?.pincode ||
          formData.pincode.trim(),
        notes: formData.notes.trim(),
        shipping: realDeliveryCharge === 0 ? 'FREE' : `₹${realDeliveryCharge}`,
        shippingZone: rateInfo ? rateInfo.zone : formData.state,
        subtotal: realSubtotal,
        total: realTotal,
        cart:
          createdOrder.orderedProducts && createdOrder.orderedProducts.length > 0
            ? createdOrder.orderedProducts.map(p => ({
                id: p.product || p._id,
                name: p.name,
                price: p.price,
                qty: p.quantity,
              }))
            : displayCart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                weight: item.weight,
                qty: item.qty,
              })),
        timestamp: new Date().toLocaleString('en-IN'),
      };

      try {
        sessionStorage.setItem('faa_latest_order', JSON.stringify(orderData));
        sessionStorage.setItem('faa_is_custom', 'false');
      } catch (err) {
        console.warn('SessionStorage failed:', err);
      }

      clearCart();
      closeCheckout();
      navigate('/order-success');
    } catch (err) {
      console.error('Failed to submit order:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not submit your order. Please check your network and try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="checkout-overlay-section active" id="checkout-overlay" role="dialog" aria-modal="true" aria-label="Checkout details">
      <div className="checkout-modal-container">
        <button type="button" className="checkout-close-btn" id="checkout-close" aria-label="Close checkout" onClick={closeCheckout}>
          &times;
        </button>

        <div className="checkout-grid">
          {/* Checkout Form */}
          <div className="checkout-form-column">
            <h2 className="checkout-title">Billing &amp; Delivery Details</h2>
            <form id="checkout-shipping-form" className="checkout-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="shipping-name" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="shipping-name"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Aditi Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  style={errors.name ? { borderColor: 'red' } : {}}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shipping-email" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="shipping-email"
                    name="email"
                    className="form-control"
                    placeholder="e.g. aditi@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={errors.email ? { borderColor: 'red' } : {}}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="shipping-phone" className="form-label">
                    Phone Number (10 digits) <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="shipping-phone"
                    name="phone"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    style={errors.phone ? { borderColor: 'red' } : {}}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="shipping-address" className="form-label">
                  Delivery Address <span className="required">*</span>
                </label>
                <textarea
                  id="shipping-address"
                  name="address"
                  className="form-control"
                  rows="2"
                  placeholder="House/Flat No., Apartment, Street, Landmark"
                  value={formData.address}
                  onChange={handleChange}
                  style={errors.address ? { borderColor: 'red' } : {}}
                ></textarea>
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="shipping-state" className="form-label">
                    State / Region <span className="required">*</span>
                  </label>
                  <select
                    id="shipping-state"
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleChange}
                    style={errors.state ? { borderColor: 'red' } : {}}
                  >
                    <option value="">-- Select Your State --</option>
                    {STATE_OPTIONS.map((grp, idx) => (
                      <optgroup key={idx} label={grp.group}>
                        {grp.options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="shipping-pincode" className="form-label">
                    Pincode / Postal Code <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="shipping-pincode"
                    name="pincode"
                    className="form-control"
                    placeholder="e.g. 600001"
                    maxLength="6"
                    inputMode="numeric"
                    value={formData.pincode}
                    onChange={handleChange}
                    style={errors.pincode ? { borderColor: 'red' } : {}}
                  />
                  {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="shipping-notes" className="form-label">Order Notes (Optional)</label>
                <textarea
                  id="shipping-notes"
                  name="notes"
                  className="form-control"
                  rows="2"
                  placeholder="Instructions for delivery, gifting details, etc."
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="checkout-submit-wrapper">
                {submitError && (
                  <div
                    className="order-submit-error-alert"
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #f87171',
                      color: '#b91c1c',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.875rem',
                      marginBottom: '12px',
                    }}
                  >
                    ⚠️ {submitError}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  id="confirm-order-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-summary-column">
            <h3 className="summary-title">Your Order Summary</h3>
            <div className="checkout-summary-items" id="checkout-summary-list">
              {displayCart.map(item => {
                if (item.id === FREE_GIFT_ITEM.id) {
                  return (
                    <div key={item.id} className="checkout-summary-item-card checkout-free-gift">
                      <span className="checkout-item-name-qty">🎁 {item.name}</span>
                      <span className="checkout-item-total-price free-gift-price">FREE</span>
                    </div>
                  );
                }
                return (
                  <div key={item.id} className="checkout-summary-item-card">
                    <span className="checkout-item-name-qty">
                      {item.qty}x {item.name}{' '}
                      <small style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                        ({item.weight})
                      </small>
                    </span>
                    <span className="checkout-item-total-price">₹{item.price * item.qty}</span>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary-totals">
              <div className="summary-total-row">
                <span>Subtotal</span>
                <span id="summary-subtotal">₹{subtotal}</span>
              </div>
              <div className="summary-total-row">
                <span>Shipping</span>
                <span id="summary-shipping" style={isFreeShipping ? { color: '#16a34a', fontWeight: '600' } : {}}>
                  {isFreeShipping ? 'FREE' : (rateInfo ? `₹${rateInfo.rate} (${rateInfo.zone})` : 'Select State')}
                </span>
              </div>
              <div className="summary-total-row grand-total">
                <span>Total Payable</span>
                <strong id="summary-total">₹{grandTotal}</strong>
              </div>
            </div>

            <div className="checkout-assurances">
              <div className="assurance-item">
                <span>🌿</span>
                <span>100% Organic &amp; Small Batch</span>
              </div>
              <div className="assurance-item">
                <span>📦</span>
                <span>Eco-Friendly Packaging</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

