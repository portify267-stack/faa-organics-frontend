import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelectProduct }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (quantity < 10) setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product.id || product._id, quantity, product);
    setIsAdded(true);
    setQuantity(1);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleCardClick = (e) => {
    if (
      e.target.closest('.quantity-stepper') ||
      e.target.closest('.product-add-btn') ||
      e.target.closest('button')
    ) {
      return;
    }
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Safe list parsing for bullet points and modal accordions
  const benefitsList = Array.isArray(product.benefits)
    ? product.benefits
    : String(product.benefits || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

  const ingredientsList = Array.isArray(product.keyIngredients)
    ? product.keyIngredients
    : String(product.keyIngredients || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

  const howToUseList = Array.isArray(product.howToUse)
    ? product.howToUse
    : String(product.howToUse || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

  const displayImage = product.image || product.images?.[0]?.url || '/uploads/img11.jpeg';
  const displayWeight = product.weight || product.unit || '100 g';

  return (
    <article
      className="product-card group/card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      data-id={product.id}
      data-category={product.category}
      onClick={handleCardClick}
    >
      <div className="product-image-container relative overflow-hidden group/img cursor-pointer">
        <img
          src={displayImage}
          alt={product.name}
          className="product-img transition-transform duration-500 group-hover/img:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            if (displayImage.startsWith('/uploads/')) {
              e.target.src = `/assets/images/${displayImage.replace('/uploads/', '')}`;
            } else {
              e.target.src = '/uploads/img1.jpeg';
            }
          }}
        />
        <span className="product-weight-badge">{displayWeight}</span>

        {/* Quick View Hover Cue */}
        <div className="absolute inset-0 bg-stone-900/15 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="bg-white/95 text-stone-800 text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md border border-stone-200 flex items-center gap-1.5 transform translate-y-1 group-hover/img:translate-y-0 transition-transform">
            <span>View Details</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </span>
        </div>
      </div>
      <div className="product-info-wrap">
        <h3
          className="product-title cursor-pointer hover:text-[#3a4d39] transition-colors"
          onClick={() => onSelectProduct && onSelectProduct(product)}
        >
          {product.name}
        </h3>
        {product.subtitle && (
          <p className="text-xs text-stone-500 italic mb-2">{product.subtitle}</p>
        )}
        <ul className="product-bullets">
          {benefitsList.slice(0, 3).map((benefit, idx) => (
            <li key={idx}>{benefit}</li>
          ))}
        </ul>

        <details className="product-details-accordion">
          <summary>View Ingredients &amp; Details</summary>
          <div className="product-accordion-body">
            {ingredientsList.length > 0 && (
              <div className="product-detail-subgroup">
                <strong>Key Ingredients:</strong>
                <ul>
                  {ingredientsList.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}
            {benefitsList.length > 0 && (
              <div className="product-detail-subgroup">
                <strong>All Benefits:</strong>
                <ul>
                  {benefitsList.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
            {howToUseList.length > 0 && (
              <div className="product-detail-subgroup">
                <strong>How to Use:</strong>
                <ol>
                  {howToUseList.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            {product.suitability && (
              <div className="product-detail-subgroup">
                <strong>Suitability:</strong>
                <p>{product.suitability}</p>
              </div>
            )}
          </div>
        </details>

        <div className="product-card-footer">
          <span className="product-price">₹{product.price}</span>
          <div className="product-actions">
            <div className="quantity-stepper" aria-label="Select quantity">
              <button
                type="button"
                className="stepper-btn minus"
                aria-label="Decrease quantity"
                onClick={handleDecrease}
              >
                -
              </button>
              <span className="stepper-value" aria-live="polite">{quantity}</span>
              <button
                type="button"
                className="stepper-btn plus"
                aria-label="Increase quantity"
                onClick={handleIncrease}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={`btn btn-primary product-add-btn ${isAdded ? 'success-animate' : ''}`}
              data-product-id={product.id}
              onClick={handleAddToCart}
              disabled={isAdded}
            >
              {isAdded ? 'Added ✓' : 'Add To Cart'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
