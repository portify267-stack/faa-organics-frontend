import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';

export default function CustomOrder() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    if (!formData.description.trim()) {
      errs.description = 'Description of requirements is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        orderType: 'custom',
        description: formData.description.trim(),
        customOrderDetails: {
          isCustomOrder: true,
          specialInstructions: formData.description.trim(),
          awaitingPriceConfirmation: true,
        },
      };

      const createdOrder = await orderService.create(payload);
      const realOrderId = createdOrder.orderId || createdOrder.id || `FAO-${Date.now()}`;

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
        description: formData.description.trim(),
        cart: [{ name: 'Custom Skincare Soap Formulation', price: 'To Be Confirmed', qty: 1 }],
        subtotal: 'To Be Confirmed',
        shipping: 'To Be Confirmed',
        total: 'To Be Confirmed',
        timestamp: new Date().toLocaleString('en-IN'),
      };

      try {
        sessionStorage.setItem('faa_latest_order', JSON.stringify(orderData));
        sessionStorage.setItem('faa_is_custom', 'true');
      } catch (err) {
        console.warn('SessionStorage failed:', err);
      }

      navigate('/order-success');
    } catch (err) {
      console.error('Failed to submit custom order:', err);
      setSubmitError(
        err.response?.data?.message || err.message || 'Could not submit your request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="custom-orders-section" id="custom-orders">
      <div className="container custom-orders-container">
        <div className="custom-orders-intro">
          <span className="section-subtitle">Tailored Skincare</span>
          <h2 className="section-title">Request a Custom Skin Formulation</h2>
          <p className="custom-text">
            Have a specific skin condition, sensitivity, or fragrance preference? Our
            herbal artisan will craft a personalized batch of goat milk soap tailored strictly to your
            skin's unique biochemical requirements.
          </p>
          <p className="custom-text">
            Submit your details and skin goals. We will review your request, consult with
            you, and formulate your personalized recipe.
          </p>

          <div className="custom-pricing-callout">
            <span className="price-lbl">Estimated Price:</span>
            <span className="price-val">To Be Confirmed</span>
            <p className="price-desc">
              Custom recipes require recipe balancing and separate batch curing. Prices
              are locked after direct email confirmation.
            </p>
          </div>
        </div>

        <div className="custom-form-wrapper">
          <form id="custom-order-form" className="custom-form" onSubmit={handleSubmit} noValidate>
            <h3 className="form-title">Custom Order Request</h3>

            <div className="form-group">
              <label htmlFor="custom-name" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="custom-name"
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
                <label htmlFor="custom-email" className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="custom-email"
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
                <label htmlFor="custom-phone" className="form-label">
                  Phone Number (10 digits) <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="custom-phone"
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
              <label htmlFor="custom-description" className="form-label">
                Describe what you need <span className="required">*</span>
              </label>
              <textarea
                id="custom-description"
                name="description"
                className="form-control"
                rows="5"
                placeholder="Mention skin type (oily, dry, sensitive), specific concerns (eczema, hyperpigmentation), fragrance preferences (essential oils only), or ingredient requests..."
                value={formData.description}
                onChange={handleChange}
                style={errors.description ? { borderColor: 'red' } : {}}
              ></textarea>
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-note">
              <strong>Note:</strong> File attachment uploads are not available natively. We will collect
              your description and you can share references via email once we reach out.
            </div>

            {submitError && (
              <div
                className="custom-order-error-alert"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  color: '#b91c1c',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  marginBottom: '14px',
                }}
              >
                ⚠️ {submitError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              id="submit-custom-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

