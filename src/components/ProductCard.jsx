import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleIncrease = () => {
    if (quantity < 10) setQuantity(prev => prev + 1);
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity, product);
    setIsAdded(true);
    setQuantity(1);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
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
    <article className="product-card" data-id={product.id} data-category={product.category}>
      <div className="product-image-container">
        <img
          src={displayImage}
          alt={product.name}
          className="product-img"
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
      </div>
      <div className="product-info-wrap">
        <h3 className="product-title">{product.name}</h3>
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
