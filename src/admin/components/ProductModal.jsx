import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import ImageUpload from './ImageUpload';
import { getStockStatus } from '../data/mockData';

export default function ProductModal({
  isOpen,
  onClose,
  product = null,
  categories = [],
  onSave
}) {
  const isEditing = !!product;

  const catList = Array.isArray(categories) ? categories : [];
  const initialCategoryVal =
    catList.length > 0 ? (catList[0]?._id || catList[0]?.id || '') : 'soap';

  const [formData, setFormData] = useState({
    name: '',
    category: initialCategoryVal,
    weight: '100 g',
    price: '',
    stock: 50,
    image: '/assets/images/img11.jpeg',
    description: '',
    // View Ingredients & Details fields
    subtitle: '',
    keyIngredients: '',
    benefits: '',
    howToUse: '',
    suitability: ''
  });

  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const list = Array.isArray(categories) ? categories : [];
    const defaultCat =
      list.length > 0 ? (list[0]?._id || list[0]?.id || '') : 'soap';

    if (product) {
      // Find category _id if product.category is an object or slug
      let categoryId = defaultCat;
      if (typeof product.category === 'object' && product.category?._id) {
        categoryId = product.category._id;
      } else if (product.category) {
        const found = list.find(
          (c) =>
            c &&
            (c._id === product.category ||
              c.id === product.category ||
              c.slug === product.category)
        );
        categoryId = found?._id || found?.id || product.category;
      }

      setFormData({
        name: product.name || '',
        category: categoryId,
        weight: product.weight || product.unit || '100 g',
        price: product.price !== undefined ? product.price : '',
        stock: product.stock !== undefined ? product.stock : (product.stockQuantity ?? 50),
        image: product.image || (product.images?.[0]?.url) || '/assets/images/img11.jpeg',
        description: product.description || '',
        subtitle: product.subtitle || '',
        keyIngredients: Array.isArray(product.keyIngredients)
          ? product.keyIngredients.join('\n')
          : product.keyIngredients || '',
        benefits: Array.isArray(product.benefits)
          ? product.benefits.join('\n')
          : product.benefits || '',
        howToUse: Array.isArray(product.howToUse)
          ? product.howToUse.join('\n')
          : product.howToUse || '',
        suitability: product.suitability || ''
      });
    } else {
      setFormData({
        name: '',
        category: defaultCat,
        weight: '100 g',
        price: '',
        stock: 50,
        image: '/assets/images/img11.jpeg',
        description: '',
        subtitle: '',
        keyIngredients: '',
        benefits: '',
        howToUse: '',
        suitability: ''
      });
    }
    setErrors({});
  }, [product, isOpen, categories]);

  // Automatic Stock Status calculation:
  // Stock quantity > 0 → In Stock; Stock quantity = 0 → Out of Stock
  const currentStockStatus = getStockStatus(formData.stock);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.stock === '' || Number(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity (0 or greater) is required';
    }
    if (!formData.image.trim()) newErrors.image = 'Product image is required. Please choose an image.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Ensure we send the selected Category's MongoDB _id (not slug or label)
    const matchedCategory = categories.find(
      (c) =>
        c._id === formData.category ||
        c.id === formData.category ||
        c.slug === formData.category
    );
    const resolvedCategoryId =
      matchedCategory?._id || matchedCategory?.id || formData.category;

    onSave({
      ...formData,
      id: product?._id || product?.id || `product-${Date.now()}`,
      _id: product?._id || product?.id,
      category: resolvedCategoryId,
      price: Number(formData.price),
      stock: Number(formData.stock),
      stockQuantity: Number(formData.stock),
      unit: formData.weight,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Skincare Product' : 'Add New Skincare Product'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FIELD 1: Product Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
            1. Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Premium Skin Brightening Goat Milk Soap"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
          />
          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
        </div>

        {/* FIELDS 2, 3, 4: Category, Weight, Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* FIELD 2: Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              2. Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39] bg-white"
            >
              {categories.map((c) => {
                const optVal = c._id || c.id || c.slug;
                return (
                  <option key={optVal} value={optVal}>
                    {c.name || c.label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* FIELD 3: Weight */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              3. Weight / Size
            </label>
            <input
              type="text"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="e.g. 100 g, 50 ml"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
            />
          </div>

          {/* FIELD 4: Price */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              4. Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 230"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
            />
            {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
          </div>
        </div>

        {/* FIELDS 5 & 6: Stock Quantity and Stock Status (Auto Calculated) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF6F0] border border-stone-200">
          {/* FIELD 5: Stock Quantity */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              5. Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0 or higher"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39] bg-white"
            />
            {errors.stock && <p className="text-xs text-rose-600 mt-1">{errors.stock}</p>}
            <p className="text-[11px] text-stone-500 mt-1">
              Enter 0 for Out of Stock; greater than 0 for In Stock.
            </p>
          </div>

          {/* FIELD 6: Stock Status (Automatically calculated, NOT manually selectable) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              6. Stock Status (Automatic)
            </label>
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl border border-stone-300 bg-white/80 h-[42px]">
              <StatusBadge type="product" status={currentStockStatus} />
              <span className="text-xs text-stone-500 font-mono">
                ({Number(formData.stock) > 0 ? `${formData.stock} units` : '0 units'})
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Automatically calculated based on stock quantity.
            </p>
          </div>
        </div>

        {/* FIELD 7: Product Image Upload Component (Mobile Camera/Photos & Desktop Files) */}
        <div>
          <ImageUpload
            label="7. Product Image"
            required={true}
            value={formData.image}
            onChange={(img) => setFormData({ ...formData, image: img })}
            error={errors.image}
          />
        </div>

        {/* FIELD 8: Description (Separate field, NOT inside View Ingredients & Details) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
            8. Description
          </label>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the formulation, craft method, and natural qualities..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
          />
        </div>

        {/* SEPARATE EXPANDABLE SECTION: View Ingredients & Details */}
        <div className="border border-stone-300 rounded-2xl overflow-hidden bg-white shadow-xs">
          <button
            type="button"
            onClick={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
            className="w-full px-5 py-3.5 bg-[#FAF6F0] flex items-center justify-between text-left hover:bg-[#f4efe8] transition-colors"
          >
            <div>
              <h4 className="text-sm font-serif font-bold text-[#2e2a26]">
                View Ingredients &amp; Details
              </h4>
              <p className="text-[11px] text-stone-500">
                Additional botanical specifications (Subtitle, Key Ingredients, All Benefits, How to Use, Suitability)
              </p>
            </div>
            <span className="text-xs font-medium text-[#3a4d39] px-2.5 py-1 rounded-lg border border-stone-300 bg-white">
              {isIngredientsExpanded ? 'Hide ▲' : 'Expand ▼'}
            </span>
          </button>

          {isIngredientsExpanded && (
            <div className="p-5 space-y-4 border-t border-stone-200">
              {/* 1. Subtitle */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  1. Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Handcrafted Radiant Glow Formula"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
                />
              </div>

              {/* 2. Key Ingredients */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  2. Key Ingredients
                </label>
                <textarea
                  rows="3"
                  value={formData.keyIngredients}
                  onChange={(e) => setFormData({ ...formData, keyIngredients: e.target.value })}
                  placeholder="e.g. Premium Goat Milk Soap Base, Manjistha, Licorice, Oats Extract..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
                />
              </div>

              {/* 3. All Benefits */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  3. All Benefits
                </label>
                <textarea
                  rows="3"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="Enter each benefit on a new line (e.g. Helps remove tan, reduces dullness...)"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
                />
              </div>

              {/* 4. How to Use */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  4. How to Use
                </label>
                <textarea
                  rows="3"
                  value={formData.howToUse}
                  onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                  placeholder="Enter application instructions (e.g. Wet face, lather, leave for 1 min, rinse)..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
                />
              </div>

              {/* 5. Suitability */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  5. Suitability
                </label>
                <textarea
                  rows="2"
                  value={formData.suitability}
                  onChange={(e) => setFormData({ ...formData, suitability: e.target.value })}
                  placeholder="e.g. All skin types, including sensitive and acne-prone skin..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#3a4d39] text-white text-sm font-medium hover:bg-[#2d3d2c] shadow-sm transition-colors"
          >
            {isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
