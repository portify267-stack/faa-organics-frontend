import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function OrderSuccess() {
  const [orderData, setOrderData] = useState(null);
  const [isCustom, setIsCustom] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    try {
      const storedOrder = sessionStorage.getItem('faa_latest_order');
      const storedCustom = sessionStorage.getItem('faa_is_custom');
      if (storedOrder) {
        setOrderData(JSON.parse(storedOrder));
      }
      setIsCustom(storedCustom === 'true');
    } catch (e) {
      console.warn('SessionStorage read error:', e);
    }
  }, []);

  // Fallback data if user navigated directly
  const order = orderData || {
    orderId: 'FAA-20261102-7482',
    orderDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    name: 'Valued Skincare Customer',
    email: 'customer@example.com',
    phone: '9876543210',
    address: 'Anna Nagar, Chennai',
    pincode: '600040',
    state: 'Tamil Nadu',
    shipping: 'FREE',
    shippingZone: 'Tamil Nadu',
    subtotal: '₹470',
    total: '₹470',
    cart: [
      { name: 'Premium Skin Brightening Goat Milk Soap', weight: '100 g', price: 230, qty: 1 },
      { name: 'Premium 20+ Herb Infused Nalangumaavu Soap', weight: '100 g', price: 240, qty: 1 },
      { id: '__free-gift__', name: 'Special Free Gift', weight: 'Complimentary', price: 0, qty: 1 }
    ]
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="order-success-body">
      <Navbar />

      <main className="order-success-main" id="main-content">
        <div className="container">
          <div className="success-page-card">
            {/* Success Icon Animation */}
            <div className="success-checkmark-wrapper">
              <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" aria-hidden="true">
                <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>

            {/* Page Heading & Thank You Message */}
            <h1 className="success-page-heading">Order Placed Successfully!</h1>
            <p className="success-page-lead" id="order-lead-message">
              Thank you for your order. Your handmade organic skincare product is being prepared with love and care. We will process your order shortly.
            </p>

            {/* Payment Information Card */}
            <div className="success-payment-info-card">
              <h3 className="payment-info-title">Payment Information</h3>
              <p className="payment-info-text">
                We will contact you via WhatsApp to confirm your order and collect the payment manually.
              </p>
              <p className="payment-info-thankyou">
                Thank you for shopping with us!
              </p>
            </div>

            {/* Order Metadata Summary Strip */}
            <div className="success-meta-strip">
              <div className="meta-strip-cell">
                <span className="cell-label">Order Number</span>
                <div className="cell-value-wrap">
                  <strong className="cell-value order-id-highlight" id="display-order-id">{order.orderId}</strong>
                  <button
                    type="button"
                    className="btn-copy-id"
                    id="copy-order-id-btn"
                    title="Copy Order ID"
                    aria-label="Copy Order ID"
                    onClick={handleCopyId}
                  >
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="meta-strip-cell">
                <span className="cell-label">Order Date</span>
                <strong className="cell-value" id="display-order-date">{order.orderDate}</strong>
              </div>
              <div className="meta-strip-cell">
                <span className="cell-label">Order Status</span>
                <span className="badge-status badge-placed" id="display-order-status">Placed</span>
              </div>
              <div className="meta-strip-cell">
                <span className="cell-label">Payment Status</span>
                <span className="badge-status badge-pending" id="display-payment-status">Pending (Cash / UPI)</span>
              </div>
            </div>

            {/* Two-Column Order Content Grid */}
            <div className="success-grid-layout">
              {/* Left Column: Customer & Delivery Details */}
              <div className="success-grid-left">
                <div className="success-box customer-details-box">
                  <h3 className="box-title">Customer &amp; Delivery Information</h3>
                  <div className="customer-info-grid">
                    <div className="info-row">
                      <span className="info-label">Customer Name</span>
                      <span className="info-val">{order.name || 'Valued Customer'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email Address</span>
                      <span className="info-val">{order.email || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone Number</span>
                      <span className="info-val">{order.phone || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Delivery Address</span>
                      <span className="info-val">
                        {isCustom ? (
                          'Custom Formulation Request (Shipping calculated on confirmation)'
                        ) : (
                          `${order.address || ''}${order.state ? ', ' + order.state : ''}${order.pincode ? ' - ' + order.pincode : ''}`
                        )}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Postal Pincode</span>
                      <span className="info-val">{order.pincode || '—'}</span>
                    </div>
                    {order.notes && (
                      <div className="info-row">
                        <span className="info-label">Order Notes</span>
                        <span className="info-val">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Support Box */}
                <div className="success-box contact-support-box">
                  <h3 className="box-title">Need Help or Questions?</h3>
                  <p className="contact-box-text">
                    Our artisan team is available to assist you. If you have any inquiries regarding your handcrafted batch, reach out to us:
                  </p>
                  <div className="contact-channels">
                    <div className="channel-item">
                      <span className="channel-icon">✉️</span>
                      <div>
                        <strong>Email Support</strong>
                        <p><a href="mailto:faaorganicsofficial@gmail.com">faaorganicsofficial@gmail.com</a></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="success-grid-right">
                <div className="success-box order-summary-box">
                  <h3 className="box-title">
                    {isCustom ? 'Custom Formulation Summary' : 'Ordered Products Summary'}
                  </h3>

                  <div className="order-items-list" id="display-items-container">
                    {isCustom ? (
                      <div className="order-item-card custom-item-card">
                        <div className="item-info">
                          <strong className="item-title">Custom Soap / Skincare Formulation</strong>
                          <p className="item-desc">{order.description || 'Custom organic ingredient blend request.'}</p>
                        </div>
                        <div className="item-price-tag">
                          <span>To Be Confirmed</span>
                        </div>
                      </div>
                    ) : (
                      order.cart && order.cart.map((item, idx) => {
                        const isGift = item.id === '__free-gift__' || (item.name && item.name.toLowerCase().includes('free gift'));
                        if (isGift) {
                          return (
                            <div key={idx} className="order-item-card gift-item-card">
                              <div className="item-icon">🎁</div>
                              <div className="item-info">
                                <strong className="item-title">{item.name}</strong>
                                <span className="item-sub">Unlocked Free Gift with Order</span>
                              </div>
                              <div className="item-price-tag gift-free-badge">FREE</div>
                            </div>
                          );
                        }
                        return (
                          <div key={idx} className="order-item-card">
                            <div className="item-icon">🌿</div>
                            <div className="item-info">
                              <strong className="item-title">{item.name}</strong>
                              <span className="item-sub">{item.weight || ''} • Qty: {item.qty || 1}</span>
                            </div>
                            <div className="item-price-tag">
                              {typeof item.price === 'number' ? `₹${item.price * (item.qty || 1)}` : item.price}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="order-totals-breakdown">
                    <div className="total-line">
                      <span>Subtotal</span>
                      <span>{order.subtotal || '₹0'}</span>
                    </div>
                    <div className="total-line">
                      <span>Shipping Charge</span>
                      <span>{order.shipping || '₹0'}</span>
                    </div>
                    <div className="total-line grand-total-line">
                      <span>Total Payable</span>
                      <strong>{order.total || '₹0'}</strong>
                    </div>
                  </div>

                  <div className="summary-assurances">
                    <span>🌿 100% Organic &amp; Small Batch</span>
                    <span>✨ Handcrafted with Care</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Action Buttons */}
            <div className="success-footer-actions">
              <Link to="/#products" className="btn btn-primary btn-large">Continue Shopping</Link>
              <Link to="/" className="btn btn-outline btn-large">Return to Homepage</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

