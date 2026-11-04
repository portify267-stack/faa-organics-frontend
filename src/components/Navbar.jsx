import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { totalItemsCount, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isOrderSuccess = location.pathname === '/order-success';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="container navbar-container">
        <Link to="/" className="brand-logo" aria-label="FAA Organics Homepage" onClick={closeMobileMenu}>
          <img src="assets/images/faa.jpeg" alt="FAA Organics logo" className="brand-logo-img" />
          <span className="brand-logo-text">Faa Organics</span>
        </Link>

        <nav className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`} id="nav-menu" aria-label="Main Navigation">
          <a href="/#products" className="nav-item" onClick={closeMobileMenu}>Products</a>
          <a href="/#shipping-info" className="nav-item" onClick={closeMobileMenu}>Shipping</a>
          <a href="/#custom-orders" className="nav-item" onClick={closeMobileMenu}>Custom Blends</a>
          <a href="/#reviews" className="nav-item" onClick={closeMobileMenu}>Reviews</a>
        </nav>

        <div className="nav-actions">
          {isOrderSuccess ? (
            <Link to="/#products" className="btn btn-outline nav-shop-link">Shop Collection</Link>
          ) : (
            <button
              className="cart-trigger-btn"
              id="cart-btn"
              aria-label="Open shopping cart"
              aria-expanded="false"
              onClick={openCart}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className="cart-badge" id="cart-count">{totalItemsCount}</span>
            </button>
          )}

          <button
            className="mobile-nav-toggle"
            id="mobile-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

