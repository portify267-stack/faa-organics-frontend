import React from 'react';
import { useCart } from '../context/CartContext';

export default function Footer() {
  const { openPolicy } = useCart();

  return (
    <footer className="footer-section">
      <div className="container footer-container">
        <div className="footer-brand">
          <h4 className="footer-logo">faa organics</h4>
          <p className="footer-blurb">
            Premium handmade organic skincare, crafted in small batches using farm-fresh
            goat milk and raw botanicals. Nurturing your skin naturally, ethically, and sustainably.
          </p>
          <div className="footer-socials">
            <a
              href="https://www.instagram.com/faa.organics?igsh=ZnZsNW9xYmhzeXRp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h5>Quick Links</h5>
          <ul>
            <li><a href="/#products">Products</a></li>
            <li><a href="/#shipping-info">Shipping Rates</a></li>
            <li><a href="/#custom-orders">Custom Formulations</a></li>
            <li><a href="/#reviews">Testimonials</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h5>Get In Touch</h5>
          <p>Email: <a href="mailto:faaorganicsofficial@gmail.com">faaorganicsofficial@gmail.com</a></p>
          <p>Location: Tamil Nadu, India</p>
        </div>

        <div className="footer-policies">
          <h5>Information</h5>
          <ul>
            <li>
              <button
                type="button"
                className="policy-link"
                onClick={() => openPolicy('shipping-policy')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}
              >
                Shipping Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                className="policy-link"
                onClick={() => openPolicy('returns-policy')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}
              >
                Returns &amp; Refunds
              </button>
            </li>
            <li>
              <button
                type="button"
                className="policy-link"
                onClick={() => openPolicy('privacy-policy')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom text-center">
        <p>&copy; 2026 FAA Organics. All rights reserved. Made for radiant skin.</p>
      </div>
    </footer>
  );
}

