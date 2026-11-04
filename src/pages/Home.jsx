import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Products from '../components/Products';
import ShippingInfo from '../components/ShippingInfo';
import CustomOrder from '../components/CustomOrder';
import Reviews from '../components/Reviews';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import PolicyModal from '../components/PolicyModal';

export default function Home() {
  return (
    <>
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <Products />
        <ShippingInfo />
        <CustomOrder />
        <Reviews />
      </main>

      <Footer />

      {/* Global Overlays & Modals */}
      <CartDrawer />
      <CheckoutModal />
      <PolicyModal />
    </>
  );
}

