import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ isOpen, onClose, product }) {
  const { addToCart, openCheckout } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients'); // 'ingredients' | 'benefits' | 'howToUse' | 'suitability'

  // Reset state whenever modal opens with a different product
  useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setIsAdded(false);
      setActiveTab('ingredients');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, product]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  // Extract and normalize image gallery
  const normalizeUrl = (u) => {
    if (!u || typeof u !== 'string') return '/uploads/img11.jpeg';
    if (u.startsWith('assets/')) return `/${u}`;
    return u;
  };

  const imageList = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img.url;
      const clean = normalizeUrl(url);
      if (clean && !imageList.includes(clean)) imageList.push(clean);
    });
  }
  if (product.image) {
    const cleanMain = normalizeUrl(product.image);
    if (!imageList.includes(cleanMain)) {
      imageList.unshift(cleanMain);
    }
  }
  if (imageList.length === 0) {
    imageList.push('/uploads/img11.jpeg');
  }

  const currentImage = imageList[selectedImageIndex] || imageList[0];

  // Helper to format string or array list
  const parseList = (content) => {
    if (!content) return [];
    if (Array.isArray(content)) return content.filter(Boolean);
    return String(content)
      .split('\n')
      .map((s) => s.trim().replace(/^[•\-\*\d\.\)]\s*/, ''))
      .filter(Boolean);
  };

  const ingredientsList = parseList(product.keyIngredients);
  const benefitsList = parseList(product.benefits);
  const howToUseList = parseList(product.howToUse);
  const suitabilityText =
    product.suitability?.trim() ||
    'Formulated gently with raw botanical actives, suitable for all skin & hair types including sensitive skin.';

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncrease = () => {
    if (quantity < 10) setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    addToCart(product.id || product._id, quantity, product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1600);
  };

  const handleBuyNow = () => {
    addToCart(product.id || product._id, quantity, product);
    onClose();
    if (openCheckout) {
      openCheckout();
    }
  };

  const categoryLabel =
    product.categoryName ||
    (typeof product.category === 'string' ? product.category : product.categorySlug) ||
    'Artisanal Skincare';

  const displayWeight = product.weight || product.unit || '100 g';
  const isOutOfStock = product.availabilityStatus === 'out_of_stock' || product.stockQuantity === 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-stone-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="product-detail-modal relative w-full max-w-4xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col md:flex-row my-auto max-h-[90vh] md:max-h-[85vh] animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-200 shadow-md flex items-center justify-center transition-transform hover:scale-110 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* LEFT COLUMN: Gallery & Image Showcase */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 bg-gradient-to-b from-[#F4EDE2] to-[#FAF8F5] flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-stone-200">
          {/* Main Photo Container */}
          <div className="relative w-full aspect-square max-h-[340px] sm:max-h-[380px] rounded-2xl overflow-hidden bg-white shadow-sm border border-stone-200/80 flex items-center justify-center group">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain md:object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                if (currentImage && currentImage.startsWith('/uploads/')) {
                  e.target.src = `/assets/images/${currentImage.replace('/uploads/', '')}`;
                } else {
                  e.target.src = '/uploads/img11.jpeg';
                }
              }}
            />

            {/* Badges Over Image */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#3a4d39]/90 text-white shadow-sm backdrop-blur-xs">
                🌿 Handcrafted
              </span>
              {isOutOfStock && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-600/90 text-white shadow-sm">
                  Out of Stock
                </span>
              )}
            </div>

            <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/60 text-white backdrop-blur-xs">
              {displayWeight}
            </span>
          </div>

          {/* Thumbnails (if multiple images exist) */}
          {imageList.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
              {imageList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-[#3a4d39] scale-105 shadow-sm ring-2 ring-[#3a4d39]/20'
                      : 'border-stone-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      if (imgUrl && imgUrl.startsWith('/uploads/')) {
                        e.target.src = `/assets/images/${imgUrl.replace('/uploads/', '')}`;
                      } else {
                        e.target.src = '/uploads/img11.jpeg';
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Boutique Quality Assurance */}
          <div className="w-full mt-4 pt-3 border-t border-stone-200/70 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs text-stone-600">
            <div className="flex flex-col items-center">
              <span className="text-base sm:text-lg mb-0.5">🌱</span>
              <span className="font-medium text-stone-700">100% Organic</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base sm:text-lg mb-0.5">🧼</span>
              <span className="font-medium text-stone-700">Small Batch</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base sm:text-lg mb-0.5">🚚</span>
              <span className="font-medium text-stone-700">Fast Shipping</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details, Tabs, & Add to Cart */}
        <div className="w-full md:w-1/2 flex flex-col justify-between overflow-y-auto max-h-[55vh] md:max-h-full">
          {/* Scrollable Content Container */}
          <div className="p-4 sm:p-6 sm:pb-4 space-y-4 sm:space-y-5">
            {/* Header: Category & Title */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBE3D5] text-[#3a4d39] uppercase tracking-wider">
                  {categoryLabel}
                </span>
                <span className="text-xs text-amber-600 font-medium">★ 4.9 (Artisanal Verified)</span>
              </div>

              <h2
                id="product-modal-title"
                className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight"
              >
                {product.name}
              </h2>

              {product.subtitle && (
                <p className="text-xs sm:text-sm text-[#7a5c3e] italic mt-1 font-medium">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* Price & Weight Block */}
            <div className="flex items-baseline gap-3 p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#2e2a26] tracking-tight">
                  ₹{product.price}
                </span>
                {product.discountPrice && product.discountPrice < product.price && (
                  <span className="text-sm sm:text-base text-stone-400 line-through">
                    ₹{product.price}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium text-stone-500 border-l border-stone-200 pl-3">
                Net Wt: <strong className="text-stone-700">{displayWeight}</strong>
              </span>
              <span className="ml-auto text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Fresh Batch
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Store Perks Highlight Banner */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <span>🎁 Special Offer:</span>
                <span className="font-normal">Free Botanical Soap Gift on orders above ₹300!</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <span>🚚 Delivery:</span>
                <span>Free shipping nationwide on orders above ₹800.</span>
              </div>
            </div>

            {/* Botanical Skincare Details: Interactive Tabs */}
            <div className="pt-2">
              <div className="flex border-b border-stone-200 gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ingredients')}
                  className={`pb-2 px-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'ingredients'
                      ? 'border-[#3a4d39] text-[#3a4d39] font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Key Ingredients
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('benefits')}
                  className={`pb-2 px-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'benefits'
                      ? 'border-[#3a4d39] text-[#3a4d39] font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Benefits
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('howToUse')}
                  className={`pb-2 px-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'howToUse'
                      ? 'border-[#3a4d39] text-[#3a4d39] font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  How to Use
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('suitability')}
                  className={`pb-2 px-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'suitability'
                      ? 'border-[#3a4d39] text-[#3a4d39] font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Suitability
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="py-3 text-xs sm:text-sm text-stone-700 min-h-[90px]">
                {activeTab === 'ingredients' && (
                  <div>
                    {ingredientsList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {ingredientsList.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF6F0] text-[#3a4d39] border border-stone-200/90 text-xs font-medium shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3a4d39]" />
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-stone-500 italic">
                        Raw cold-pressed botanical oils, therapeutic herb infusions, and pure goat milk.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'benefits' && (
                  <div>
                    {benefitsList.length > 0 ? (
                      <ul className="space-y-1.5">
                        {benefitsList.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-700 font-bold shrink-0">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-stone-500 italic">
                        Hydrates, gently cleanses, and restores skin's natural barrier.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'howToUse' && (
                  <div>
                    {howToUseList.length > 0 ? (
                      <ol className="space-y-1.5">
                        {howToUseList.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#3a4d39] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                              {idx + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-stone-500 italic">
                        Lather between damp hands, massage gently across skin for 1 minute, and rinse thoroughly with cool water.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'suitability' && (
                  <div className="p-3 rounded-xl bg-white border border-stone-200">
                    <p className="leading-relaxed text-stone-700">{suitabilityText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky / Pinned Bottom Action Bar */}
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200 shadow-lg mt-auto">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center justify-between w-full sm:w-auto rounded-xl border border-stone-300 bg-[#FAF8F5] p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-base font-bold text-stone-700 hover:bg-stone-200/80 active:scale-95 disabled:opacity-40 transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-stone-800 text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={quantity >= 10 || isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-base font-bold text-stone-700 hover:bg-stone-200/80 active:scale-95 disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdded}
                className={`flex-1 w-full py-3 px-5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                  isAdded
                    ? 'bg-emerald-700 text-white'
                    : isOutOfStock
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#3a4d39] text-white hover:bg-[#2d3d2c] active:scale-[0.98]'
                }`}
              >
                {isAdded ? (
                  <>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Added to Cart ({quantity})</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Currently Out of Stock</span>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Add to Cart • ₹{product.price * quantity}</span>
                  </>
                )}
              </button>

              {/* Buy Now Button */}
              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl text-sm font-semibold bg-[#b08968] text-white hover:bg-[#996d49] active:scale-[0.98] shadow-sm transition-all"
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
