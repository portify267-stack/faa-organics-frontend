import React, { useState, useEffect, useMemo } from 'react';
import { products as localProducts, CATEGORIES as localCategories } from '../data/products';
import { productService, categoryService } from '../services/api';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // Instant Cache initialization: Read last known live catalog from localStorage to avoid flashing outdated static data
  const getInitialProducts = () => {
    try {
      const cached = localStorage.getItem('faa_live_products_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sortSoapProductsFirst(parsed);
        }
      }
    } catch {
      // ignore
    }
    return []; // Empty on cold first visit to display clean skeleton loader while fetching
  };

  const getInitialCategories = () => {
    try {
      const cached = localStorage.getItem('faa_live_categories_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return localCategories;
  };

  const [productList, setProductList] = useState(getInitialProducts);
  const [categoryTabs, setCategoryTabs] = useState(getInitialCategories);
  const [isLoading, setIsLoading] = useState(() => getInitialProducts().length === 0);

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
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [{ url: primaryUrl, alt: p.name, isPrimary: true }],
      discountPrice: p.discountPrice,
      stockQuantity: p.stockQuantity,
      availabilityStatus: p.availabilityStatus || (p.stockQuantity === 0 ? 'out_of_stock' : 'in_stock'),
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
    let isMounted = true;

    const fetchLiveCatalog = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          productService.getPublic({ limit: 100 }),
          categoryService.getPublic(),
        ]);

        if (!isMounted) return;

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
            try {
              localStorage.setItem('faa_live_categories_cache', JSON.stringify(mappedTabs));
            } catch {}
          }
        }

        // 2. Process Products
        if (prodRes.status === 'fulfilled' && prodRes.value) {
          const rawProds = Array.isArray(prodRes.value)
            ? prodRes.value
            : prodRes.value?.products || [];
          if (rawProds.length > 0) {
            const mapped = sortSoapProductsFirst(rawProds.map(mapBackendProduct));
            setProductList(mapped);
            try {
              localStorage.setItem('faa_live_products_cache', JSON.stringify(mapped));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Storefront backend fetch fallback:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Immediate fetch on mount
    fetchLiveCatalog();

    // Instant refetch on window focus / tab visibility change (< 1 sec sync)
    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchLiveCatalog();
      }
    };

    window.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
    };
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
        {isLoading && productList.length === 0 ? (
          <div className="products-grid" id="products-loading-skeleton">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="product-card skeleton-card"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px',
                  opacity: 0.7,
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              >
                <div style={{ height: '220px', background: '#e2e8f0', borderRadius: '12px', marginBottom: '16px' }} />
                <div style={{ height: '20px', background: '#e2e8f0', borderRadius: '4px', width: '75%', marginBottom: '10px' }} />
                <div style={{ height: '14px', background: '#e2e8f0', borderRadius: '4px', width: '45%', marginBottom: '20px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ height: '24px', background: '#e2e8f0', borderRadius: '4px', width: '30%' }} />
                  <div style={{ height: '36px', background: '#e2e8f0', borderRadius: '8px', width: '35%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid" id="products-list-container">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Luxury Botanical Product Detail Popup Modal */}
      <ProductDetailModal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </section>
  );
}
