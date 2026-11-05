import React, { useState, useEffect, useMemo } from 'react';
import { products as localProducts, CATEGORIES as localCategories } from '../data/products';
import { productService, categoryService } from '../services/api';
import ProductCard from './ProductCard';

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('all');

  // Sort helper: Display all Soap category products first before products from other categories
  const sortSoapProductsFirst = (items) => {
    return [...items].sort((a, b) => {
      const aSlug = String(a.categorySlug || a.category || '').toLowerCase();
      const aName = String(a.categoryName || '').toLowerCase();
      const isSoapA = aSlug.includes('soap') || aName.includes('soap') || a.name?.toLowerCase().includes('soap');

      const bSlug = String(b.categorySlug || b.category || '').toLowerCase();
      const bName = String(b.categoryName || '').toLowerCase();
      const isSoapB = bSlug.includes('soap') || bName.includes('soap') || b.name?.toLowerCase().includes('soap');

      if (isSoapA && !isSoapB) return -1;
      if (!isSoapA && isSoapB) return 1;

      return 0; // Preserve relative sequence for items in the same group
    });
  };

  const [productList, setProductList] = useState(() => sortSoapProductsFirst(localProducts));
  const [categoryTabs, setCategoryTabs] = useState(localCategories);
  const [isLoading, setIsLoading] = useState(true);

  // Map Backend Product Model to Customer Storefront Format
  const mapBackendProduct = (p) => {
    const primaryUrl =
      (Array.isArray(p.images) &&
        p.images.length > 0 &&
        (p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url)) ||
      (typeof p.image === 'string' && p.image ? p.image : '') ||
      '/uploads/img11.jpeg';

    const catSlug = typeof p.category === 'object' && p.category?.slug ? p.category.slug : '';
    const catId = typeof p.category === 'object' && p.category?._id ? p.category._id : p.category || '';
    const catName = typeof p.category === 'object' && p.category?.name ? p.category.name : '';

    let categoryKey = catSlug || catId || 'soap';

    return {
      id: p._id || p.id,
      _id: p._id || p.id,
      name: p.name,
      price: Number(p.price),
      weight: p.unit || p.weight || '100 g',
      unit: p.unit || p.weight || '100 g',
      category: categoryKey,
      categorySlug: catSlug,
      categoryId: catId,
      categoryName: catName,
      image: primaryUrl,
      subtitle: p.subtitle || '',
      keyIngredients: Array.isArray(p.keyIngredients)
        ? p.keyIngredients
        : String(p.keyIngredients || '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
      benefits: Array.isArray(p.benefits)
        ? p.benefits
        : String(p.benefits || '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
      howToUse: Array.isArray(p.howToUse)
        ? p.howToUse
        : String(p.howToUse || '')
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
      suitability: p.suitability || '',
      description: p.description || '',
    };
  };

  // Fetch live products and categories from shared MongoDB backend (using public endpoints)
  useEffect(() => {
    const fetchLiveCatalog = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          productService.getPublic({ limit: 100 }),
          categoryService.getPublic(),
        ]);

        // 1. Process Categories (Soap first, Combo second, no Lip/Hair Care)
        if (catRes.status === 'fulfilled' && catRes.value) {
          const rawCats = Array.isArray(catRes.value)
            ? catRes.value
            : catRes.value?.categories || [];
          if (rawCats.length > 0) {
            // Filter out Lip Care & Hair Care completely
            const activeCats = rawCats.filter((c) => {
              const name = (c?.name || '').toLowerCase();
              return !name.includes('lip care') && !name.includes('hair care');
            });

            // Sort: Soap first, Combo second, then by displayOrder / name
            const sortedCats = [...activeCats].sort((a, b) => {
              const aName = (a?.name || '').toLowerCase();
              const bName = (b?.name || '').toLowerCase();
              if (aName === 'soap' || aName === 'soaps') return -1;
              if (bName === 'soap' || bName === 'soaps') return 1;
              if (aName === 'combo') return -1;
              if (bName === 'combo') return 1;
              return (a?.displayOrder || 99) - (b?.displayOrder || 99);
            });

            const mappedTabs = [
              { id: 'all', label: 'All Products' },
              ...sortedCats.map((c) => ({
                id: c.slug || c._id,
                label: c.name,
                slug: c.slug || '',
                _id: c._id,
              })),
            ];
            setCategoryTabs(mappedTabs);
          }
        }

        // 2. Process Products
        if (prodRes.status === 'fulfilled' && prodRes.value) {
          const rawProds = Array.isArray(prodRes.value)
            ? prodRes.value
            : prodRes.value?.products || [];
          if (rawProds.length > 0) {
            const mapped = rawProds.map(mapBackendProduct);
            setProductList(mapped);
          }
        }
      } catch (err) {
        console.warn('Storefront backend fetch fallback:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveCatalog();
  }, []);

  // Filter products by selected category tab, ensuring Soap products always appear first on "All Products"
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return sortSoapProductsFirst(productList);
    }

    return productList.filter((p) => {
      const cat = String(activeCategory).toLowerCase();
      const pSlug = String(p.categorySlug || p.category || '').toLowerCase();
      const pName = String(p.categoryName || '').toLowerCase();
      const pId = String(p.categoryId || p.category || '');

      return (
        pSlug === cat ||
        pId === cat ||
        pName === cat ||
        // Support friendly category aliases (e.g., soap <-> soaps, combo <-> combo, cream <-> creams-balms)
        (cat.includes('soap') && (pSlug.includes('soap') || pName.includes('soap'))) ||
        (cat.includes('combo') && (pSlug.includes('combo') || pName.includes('combo'))) ||
        (cat.includes('cream') && (pSlug.includes('cream') || pName.includes('cream'))) ||
        (cat.includes('oil') && (pSlug.includes('oil') || pName.includes('oil'))) ||
        (cat.includes('powder') && (pSlug.includes('powder') || pName.includes('powder')))
      );
    });
  }, [activeCategory, productList]);

  return (
    <section className="products-section" id="products">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Pure Artisanal Batches</span>
          <h2 className="section-title">Our Handcrafted Formulas</h2>
          <p className="section-description">
            Experience the healing power of raw, unadulterated botanical skincare. Made fresh, packaged minimally, and designed to radiate your natural glow.
          </p>
        </div>

        {/* Category Filter Bar */}
        <div className="category-filter-bar" id="category-filter-bar" role="tablist" aria-label="Product categories">
          {categoryTabs.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              data-filter={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="products-grid" id="products-list-container">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
