import React from 'react';

export default function Hero() {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg-overlay"></div>
      <div className="container hero-container">
        <div className="hero-content">
          <span className="hero-subtitle">100% Pure &amp; Handmade Skin Nutrition</span>
          <h1 className="hero-title">Timeless Radiance, Crafted by Nature</h1>
          <p className="hero-description">
            Experience premium goat milk soaps and botanical face masks handcrafted
            with organic extracts and ancient principles for healthy, glowing skin.
          </p>
          <div className="hero-cta-wrapper">
            <a href="#products" className="btn btn-primary">Explore Products</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-frame">
            <div className="hero-image-inner">
              <img
                src="assets/images/hero.jpeg"
                alt="Aesthetic arrangement of FAA Organics products, fresh plants and essential oils"
                className="hero-img"
                loading="eager"
              />
            </div>
            <div className="floating-badge badge-bottom">
              <strong>⭐ 4.9</strong>
              <small>200+ Reviews</small>
            </div>
            <div className="floating-badge badge-top">
              <strong>Customisation</strong>
              <small>Also Available</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

