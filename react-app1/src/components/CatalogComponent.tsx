import React, { useEffect, useState, useMemo } from 'react';
import './CatalogComponent.css';

// EventBus загружается динамически через Module Federation (см. loadDependencies ниже)
// Статический импорт невозможен, так как модуль доступен только во время выполнения
// Типы определены в host-remotes.d.ts
let eventBus: any = null;
let mockData: any = null;

const loadDependencies = async () => {
  try {
    // @ts-ignore
    const shared = await import('host/shared');
    // @ts-ignore
    const data = await import('host/mockData');
    return { eventBus: shared.eventBus, mockData: data };
  } catch (error) {
    console.warn('[CatalogComponent] Standalone mode');
    return { eventBus: null, mockData: null };
  }
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity: number;
  brand: string;
  tags: string[];
}

interface Filter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

export const CatalogComponent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Filter>({
    sortBy: 'popular',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isEventBusReady, setIsEventBusReady] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  console.log(filteredProducts)

  // Load dependencies
  useEffect(() => {
    console.log('[CatalogComponent] Loading dependencies...');
    loadDependencies().then(({ eventBus: bus, mockData: data }) => {
      console.log('[CatalogComponent] Dependencies loaded:', { hasEventBus: !!bus, hasMockData: !!data });
      if (bus && data) {
        eventBus = bus;
        mockData = data;
        setIsEventBusReady(true);
        setProducts(data.MOCK_PRODUCTS || []);
        console.log('[CatalogComponent] EventBus initialized, products loaded:', (data.MOCK_PRODUCTS || []).length);
        
        eventBus.emit('microfrontend:loaded', {
          name: 'catalog',
          timestamp: Date.now(),
        });

        // Subscribe to cart updates
        const unsubCart = eventBus.on('cart:updated', (data: any) => {
          setCartCount(data.itemCount);
        });

        return () => {
          unsubCart();
        };
      }
    });
  }, []);

  // Apply filters
  useEffect(() => {
    if (!products.length) return;

    let result = [...products];

    // Category filter
    if (filter.category) {
      result = result.filter(p => p.category === filter.category);
    }

    // Price filter
    if (filter.minPrice !== undefined) {
      result = result.filter(p => p.price >= filter.minPrice!);
    }
    if (filter.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filter.maxPrice!);
    }

    // Stock filter
    if (filter.inStock !== undefined) {
      result = result.filter(p => p.inStock === filter.inStock);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    if (filter.sortBy) {
      result.sort((a, b) => {
        let comparison = 0;
        
        switch (filter.sortBy) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'rating':
            comparison = b.rating - a.rating;
            break;
          case 'newest':
            // Fallback if createdAt does not exist
            // Treat products without createdAt as oldest
            const aCreatedAt = (a as any).createdAt;
            const bCreatedAt = (b as any).createdAt;
            const aDate = aCreatedAt ? new Date(aCreatedAt).getTime() : 0;
            const bDate = bCreatedAt ? new Date(bCreatedAt).getTime() : 0;
            comparison = bDate - aDate;
            break;
          case 'popular':
            comparison = b.reviewsCount - a.reviewsCount;
            break;
        }
        
        return filter.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    setFilteredProducts(result);

    // Emit filter changed event
    if (isEventBusReady && eventBus) {
      eventBus.emit('catalog:filter-changed', { filter });
    }
  }, [products, filter, searchQuery, isEventBusReady]);

  const handleAddToCart = (product: Product) => {
    console.log('[CatalogComponent] handleAddToCart called:', { product, eventBus: !!eventBus, isEventBusReady });
    
    if (eventBus) {
      const eventData = { product, quantity: 1 };
      console.log('[CatalogComponent] Emitting catalog:add-to-cart:', eventData);
      
      // Проверка количества слушателей перед отправкой
      const listenerCount = (eventBus as any).listenerCount?.('catalog:add-to-cart') ?? 0;
      console.log(`[CatalogComponent] Listener count for catalog:add-to-cart: ${listenerCount}`);
      
      eventBus.emit('catalog:add-to-cart', eventData);
      // Уведомление отправляется автоматически из cartStore
    } else {
      console.warn('[CatalogComponent] EventBus is not available!');
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    
    if (eventBus) {
      eventBus.emit('catalog:product-viewed', {
        productId: product.id,
        timestamp: Date.now(),
      });
      eventBus.emit('catalog:product-selected', { product });
    }
  };

  const handleFilterChange = (key: keyof Filter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilter({ sortBy: 'popular', sortOrder: 'desc' });
    setSearchQuery('');
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats);
  }, [products]);

  const priceRange = useMemo(() => {
    if (!products.length) return { min: 0, max: 100000 };
    return {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price)),
    };
  }, [products]);

  return (
    <div className="catalog-container">
      {/* Header */}
      <div className="catalog-header">
        <div>
          <h1>🛍️ Каталог товаров</h1>
          <p>{filteredProducts.length} товаров найдено</p>
        </div>
        <div className="header-actions">
          <div className={`status ${isEventBusReady ? 'connected' : 'disconnected'}`}>
            {isEventBusReady ? '🟢 Online' : '🔴 Offline'}
          </div>
          {cartCount > 0 && (
            <div className="cart-badge">
              🛒 Корзина: {cartCount}
            </div>
          )}
        </div>
      </div>

      <div className="catalog-body">
        {/* Sidebar with filters */}
        <aside className="catalog-sidebar">
          <div className="filter-section">
            <h3>Фильтры</h3>
            <button onClick={resetFilters} className="btn-reset-filters">
              Сбросить все
            </button>
          </div>

          {/* Search */}
          <div className="filter-group">
            <label>🔍 Поиск</label>
            <input
              type="text"
              placeholder="Название, бренд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Category */}
          <div className="filter-group">
            <label>📂 Категория</label>
            <select
              value={filter.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              className="filter-select"
            >
              <option value="">Все категории</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label>💰 Цена</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="От"
                value={filter.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="price-input"
              />
              <span>—</span>
              <input
                type="number"
                placeholder="До"
                value={filter.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="price-input"
              />
            </div>
            <small>От {priceRange.min.toLocaleString()} до {priceRange.max.toLocaleString()} ₽</small>
          </div>

          {/* Stock */}
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter.inStock === true}
                onChange={(e) => handleFilterChange('inStock', e.target.checked || undefined)}
              />
              ✓ Только в наличии
            </label>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label>🔽 Сортировка</label>
            <select
              value={filter.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="popular">По популярности</option>
              <option value="price">По цене</option>
              <option value="rating">По рейтингу</option>
              <option value="newest">Сначала новые</option>
            </select>
            <select
              value={filter.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="filter-select"
              style={{ marginTop: '8px' }}
            >
              <option value="asc">По возрастанию</option>
              <option value="desc">По убыванию</option>
            </select>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="catalog-main">
          {/* View switcher */}
          <div className="view-controls">
            <button
              className={view === 'grid' ? 'active' : ''}
              onClick={() => setView('grid')}
            >
              ⊞ Сетка
            </button>
            <button
              className={view === 'list' ? 'active' : ''}
              onClick={() => setView('list')}
            >
              ☰ Список
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>😕 Товары не найдены</p>
              <button onClick={resetFilters} className="btn-primary">
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className={`products-${view}`}>
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                >
                  {/* Discount badge */}
                  {product.discount && (
                    <div className="discount-badge">-{product.discount}%</div>
                  )}
                  
                  {/* Stock badge */}
                  {!product.inStock && (
                    <div className="out-of-stock-badge">Нет в наличии</div>
                  )}

                  {/* Image */}
                  <div className="product-image">
                    <img src={product.images[0]} alt={product.name} />
                  </div>

                  {/* Info */}
                  <div className="product-info">
                    <div className="product-brand">{product.brand}</div>
                    <h3 className="product-name">{product.name}</h3>
                    
                    {/* Rating */}
                    <div className="product-rating">
                      <span className="rating-stars">⭐ {product.rating}</span>
                      <span className="rating-count">({product.reviewsCount})</span>
                    </div>

                    {/* Price */}
                    <div className="product-price">
                      <span className="price-current">{product.price.toLocaleString()} ₽</span>
                      {product.oldPrice && (
                        <span className="price-old">{product.oldPrice.toLocaleString()} ₽</span>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="product-tags">
                      {product.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <button
                      className="btn-add-to-cart"
                      onClick={(e) => {
                        console.log('onClick', product)
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? '🛒 В корзину' : 'Нет в наличии'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>
              ✕
            </button>
            
            <div className="modal-body">
              <div className="modal-image">
                <img src={selectedProduct.images[0]} alt={selectedProduct.name} />
              </div>
              
              <div className="modal-info">
                <div className="product-brand">{selectedProduct.brand}</div>
                <h2>{selectedProduct.name}</h2>
                
                <div className="product-rating">
                  <span className="rating-stars">⭐ {selectedProduct.rating}</span>
                  <span className="rating-count">({selectedProduct.reviewsCount} отзывов)</span>
                </div>

                <p className="product-description">{selectedProduct.description}</p>

                <div className="product-tags">
                  {selectedProduct.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>

                <div className="product-stock">
                  {selectedProduct.inStock ? (
                    <span className="in-stock">✓ В наличии ({selectedProduct.stockQuantity} шт.)</span>
                  ) : (
                    <span className="out-of-stock">✕ Нет в наличии</span>
                  )}
                </div>

                <div className="modal-price">
                  <span className="price-current">{selectedProduct.price.toLocaleString()} ₽</span>
                  {selectedProduct.oldPrice && (
                    <>
                      <span className="price-old">{selectedProduct.oldPrice.toLocaleString()} ₽</span>
                      <span className="price-save">
                        Экономия {(selectedProduct.oldPrice - selectedProduct.price).toLocaleString()} ₽
                      </span>
                    </>
                  )}
                </div>

                <button
                  className="btn-add-to-cart-large"
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={!selectedProduct.inStock}
                >
                  {selectedProduct.inStock ? '🛒 Добавить в корзину' : 'Нет в наличии'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogComponent;


