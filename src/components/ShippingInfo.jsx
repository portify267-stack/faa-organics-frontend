import React from 'react';

export default function ShippingInfo() {
  return (
    <section className="shipping-info-section" id="shipping-info">
      <div className="container">
        <div className="shipping-info-card">
          <div className="shipping-info-header">
            <span className="shipping-info-icon">🚚</span>
            <h3 className="shipping-info-title">Shipping &amp; Delivery Rates</h3>
          </div>
          <div className="shipping-rates-grid">
            <div className="shipping-rate-item">
              <span className="shipping-rate-region">Tamil Nadu</span>
              <span className="shipping-rate-price">₹50</span>
            </div>
            <div className="shipping-rate-divider"></div>
            <div className="shipping-rate-item">
              <span className="shipping-rate-region">Other South Indian States</span>
              <span className="shipping-rate-price">₹60</span>
            </div>
            <div className="shipping-rate-divider"></div>
            <div className="shipping-rate-item">
              <span className="shipping-rate-region">North Indian States</span>
              <span className="shipping-rate-price">₹70</span>
            </div>
          </div>
          <p className="shipping-info-note">
            Calculated accurately at checkout based on your delivery state. Handcrafted in small batches and dispatched securely across India.
          </p>
        </div>
      </div>
    </section>
  );
}

