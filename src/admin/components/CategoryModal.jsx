import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ImageUpload from './ImageUpload';

export default function CategoryModal({
  isOpen,
  onClose,
  category = null,
  onSave
}) {
  const isEditing = !!category;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'Active',
    image: '/assets/images/img11.jpeg'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || category.id || '',
        description: category.description || '',
        status: category.status || 'Active',
        image: category.image || '/assets/images/img11.jpeg'
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        status: 'Active',
        image: '/assets/images/img11.jpeg'
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Category identifier/slug is required';
    if (!formData.image.trim()) newErrors.image = 'Category image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (val) => {
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: isEditing ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      id: category?._id || category?.id || formData.slug || `cat-${Date.now()}`,
      _id: category?._id || category?.id,
      productCount: category?.productCount || 0
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Skincare Category' : 'Add New Category'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Image Upload */}
        <ImageUpload
          label="Category Image"
          required={true}
          value={formData.image}
          onChange={(img) => setFormData({ ...formData, image: img })}
          error={errors.image}
        />

        {/* Category Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Herbal Face Packs"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
          />
          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
        </div>

        {/* Slug & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Category Slug / ID *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. face-pack"
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
            />
            {errors.slug && <p className="text-xs text-rose-600 mt-1">{errors.slug}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39] bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
            Description
          </label>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the category, herbal specialties, and suitable skin benefits..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#3a4d39]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[#3a4d39] text-white text-sm font-medium hover:bg-[#2d3d2c] shadow-sm transition-colors"
          >
            {isEditing ? 'Save Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
