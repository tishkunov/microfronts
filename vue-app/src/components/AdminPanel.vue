<template>
  <div class="admin-container">
    <!-- Header -->
    <div class="admin-header">
      <div>
        <h1>⚙️ Панель администратора</h1>
        <p>Управление товарами и заказами</p>
      </div>
      <div class="header-actions">
        <div :class="['status', isEventBusReady ? 'connected' : 'disconnected']">
          {{ isEventBusReady ? '🟢 Online' : '🔴 Offline' }}
        </div>
      </div>
    </div>

    <!-- Stats Dashboard -->
    <div class="stats-dashboard">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalProducts }}</div>
          <div class="stat-label">Всего товаров</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🛍️</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalOrders }}</div>
          <div class="stat-label">Всего заказов</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value">{{ formatPrice(stats.totalRevenue) }}</div>
          <div class="stat-label">Общая выручка</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-value">{{ formatPrice(stats.todayRevenue) }}</div>
          <div class="stat-label">Сегодня</div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pendingOrders }}</div>
          <div class="stat-label">Ожидают обработки</div>
        </div>
      </div>

      <div class="stat-card alert">
        <div class="stat-icon">⚠️</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.lowStockProducts }}</div>
          <div class="stat-label">Заканчиваются</div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'products' }]"
        @click="activeTab = 'products'"
      >
        📦 Товары ({{ products.length }})
      </button>
      <button
        :class="['tab', { active: activeTab === 'orders' }]"
        @click="activeTab = 'orders'"
      >
        🛍️ Заказы ({{ orders.length }})
      </button>
    </div>

    <!-- Products Tab -->
    <div v-if="activeTab === 'products'" class="tab-content">
      <div class="content-header">
        <h2>Управление товарами</h2>
        <button @click="showProductModal()" class="btn-primary">
          ➕ Добавить товар
        </button>
      </div>

      <!-- Products Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Изображение</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Остаток</th>
              <th>Рейтинг</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td><code>{{ product.id }}</code></td>
              <td>
                <div class="table-image">
                  <img :src="product.images[0]" :alt="product.name" />
                </div>
              </td>
              <td>
                <div class="product-name-cell">
                  <strong>{{ product.name }}</strong>
                  <small>{{ product.brand }}</small>
                </div>
              </td>
              <td>
                <span class="category-badge">{{ product.category }}</span>
              </td>
              <td>
                <div class="price-cell">
                  <strong>{{ formatPrice(product.price) }}</strong>
                  <small v-if="product.oldPrice">{{ formatPrice(product.oldPrice) }}</small>
                </div>
              </td>
              <td>
                <span :class="['stock-badge', getStockClass(product)]">
                  {{ product.stockQuantity }} шт
                </span>
              </td>
              <td>
                <div class="rating-cell">
                  ⭐ {{ product.rating }}
                  <small>({{ product.reviewsCount }})</small>
                </div>
              </td>
              <td>
                <span :class="['status-badge', product.inStock ? 'active' : 'inactive']">
                  {{ product.inStock ? 'В наличии' : 'Нет' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="showProductModal(product)" class="btn-icon" title="Редактировать">
                    ✏️
                  </button>
                  <button @click="deleteProduct(product)" class="btn-icon" title="Удалить">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Orders Tab -->
    <div v-if="activeTab === 'orders'" class="tab-content">
      <div class="content-header">
        <h2>Управление заказами</h2>
        <div class="order-filters">
          <select v-model="orderFilter" class="filter-select">
            <option value="all">Все заказы</option>
            <option value="pending">Ожидают</option>
            <option value="processing">В обработке</option>
            <option value="shipped">Отправлены</option>
            <option value="delivered">Доставлены</option>
            <option value="cancelled">Отменены</option>
          </select>
        </div>
      </div>

      <!-- Orders List -->
      <div class="orders-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div>
              <h3>Заказ {{ order.id }}</h3>
              <p>{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-status">
              <select
                :value="order.status"
                @change="updateOrderStatus(order, ($event.target as HTMLSelectElement).value)"
                class="status-select"
              >
                <option value="pending">⏳ Ожидает</option>
                <option value="processing">🔄 В обработке</option>
                <option value="shipped">📦 Отправлен</option>
                <option value="delivered">✅ Доставлен</option>
                <option value="cancelled">❌ Отменен</option>
              </select>
            </div>
          </div>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.productId" class="order-item">
              <img :src="item.productImage" :alt="item.productName" />
              <div class="order-item-info">
                <strong>{{ item.productName }}</strong>
                <p>{{ item.quantity }} × {{ formatPrice(item.price) }}</p>
              </div>
              <div class="order-item-total">
                {{ formatPrice(item.total) }}
              </div>
            </div>
          </div>

          <div class="order-summary">
            <div class="order-totals">
              <div class="total-row">
                <span>Товары:</span>
                <span>{{ formatPrice(order.subtotal) }}</span>
              </div>
              <div class="total-row" v-if="order.discount > 0">
                <span>Скидка:</span>
                <span class="discount">−{{ formatPrice(order.discount) }}</span>
              </div>
              <div class="total-row">
                <span>Доставка:</span>
                <span>{{ formatPrice(order.shipping) }}</span>
              </div>
              <div class="total-row">
                <span>Налог:</span>
                <span>{{ formatPrice(order.tax) }}</span>
              </div>
              <div class="total-row total">
                <span>Итого:</span>
                <span>{{ formatPrice(order.total) }}</span>
              </div>
            </div>

            <button @click="cancelOrder(order)" class="btn-cancel-order" :disabled="order.status === 'cancelled' || order.status === 'delivered'">
              ❌ Отменить заказ
            </button>
          </div>
        </div>

        <div v-if="filteredOrders.length === 0" class="no-orders">
          <p>📭 Заказов не найдено</p>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Редактировать товар' : 'Добавить товар' }}</h2>
          <button @click="closeModal" class="modal-close">✕</button>
        </div>

        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="productForm.name" type="text" required class="form-input" />
          </div>

          <div class="form-group">
            <label>Описание *</label>
            <textarea v-model="productForm.description" required class="form-textarea"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Цена *</label>
              <input v-model.number="productForm.price" type="number" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Старая цена</label>
              <input v-model.number="productForm.oldPrice" type="number" class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Категория *</label>
              <select v-model="productForm.category" required class="form-select">
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home</option>
                <option value="sports">Sports</option>
                <option value="toys">Toys</option>
                <option value="food">Food</option>
                <option value="beauty">Beauty</option>
              </select>
            </div>

            <div class="form-group">
              <label>Бренд *</label>
              <input v-model="productForm.brand" type="text" required class="form-input" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Остаток *</label>
              <input v-model.number="productForm.stockQuantity" type="number" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Изображение URL</label>
              <input v-model="productForm.imageUrl" type="text" class="form-input" />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {{ editingProduct ? 'Сохранить' : 'Добавить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';

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
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: any;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export default defineComponent({
  name: 'AdminPanel',
  setup() {
    const isEventBusReady = ref(false);
    const activeTab = ref('products');
    const products = ref<Product[]>([]);
    const orders = ref<Order[]>([]);
    const orderFilter = ref('all');
    const showModal = ref(false);
    const editingProduct = ref<Product | null>(null);
    const productForm = ref({
      name: '',
      description: '',
      price: 0,
      oldPrice: 0,
      category: 'electronics',
      brand: '',
      stockQuantity: 0,
      imageUrl: '',
    });

    const stats = ref({
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
    });

    let eventBus: any = null;
    let unsubscribers: (() => void)[] = [];

    onMounted(async () => {
      try {
        // @ts-ignore
        const shared = await import('host/shared');
        // @ts-ignore
        const data = await import('host/mockData');
        
        eventBus = shared.eventBus;
        products.value = JSON.parse(JSON.stringify(data.MOCK_PRODUCTS || []));
        
        isEventBusReady.value = true;

        eventBus.emit('microfrontend:loaded', {
          name: 'admin',
          timestamp: Date.now(),
        });

        // Subscribe to events
        const unsubOrderCreated = eventBus.on('order:created', (data: any) => {
          orders.value.push(data.order);
          updateStats();
        });

        unsubscribers.push(unsubOrderCreated);
        updateStats();
      } catch (error) {
        console.warn('[AdminPanel] Standalone mode');
      }
    });

    onUnmounted(() => {
      unsubscribers.forEach(unsub => unsub());
    });

    const filteredOrders = computed(() => {
      if (orderFilter.value === 'all') {
        return orders.value;
      }
      return orders.value.filter(o => o.status === orderFilter.value);
    });

    const updateStats = () => {
      stats.value.totalProducts = products.value.length;
      stats.value.totalOrders = orders.value.length;
      stats.value.totalRevenue = orders.value.reduce((sum, o) => sum + o.total, 0);
      stats.value.todayRevenue = orders.value
        .filter(o => {
          const today = new Date().toDateString();
          return new Date(o.createdAt).toDateString() === today;
        })
        .reduce((sum, o) => sum + o.total, 0);
      stats.value.pendingOrders = orders.value.filter(o => o.status === 'pending').length;
      stats.value.lowStockProducts = products.value.filter(p => p.stockQuantity < 10 && p.inStock).length;
    };

    const formatPrice = (price: number): string => {
      return `${price.toLocaleString()} ₽`;
    };

    const formatDate = (date: Date): string => {
      return new Date(date).toLocaleString('ru-RU');
    };

    const getStockClass = (product: Product): string => {
      if (product.stockQuantity === 0) return 'out';
      if (product.stockQuantity < 10) return 'low';
      return 'ok';
    };

    const showProductModal = (product?: Product) => {
      if (product) {
        editingProduct.value = product;
        productForm.value = {
          name: product.name,
          description: product.description,
          price: product.price,
          oldPrice: product.oldPrice || 0,
          category: product.category,
          brand: product.brand,
          stockQuantity: product.stockQuantity,
          imageUrl: product.images[0] || '',
        };
      } else {
        editingProduct.value = null;
        productForm.value = {
          name: '',
          description: '',
          price: 0,
          oldPrice: 0,
          category: 'electronics',
          brand: '',
          stockQuantity: 0,
          imageUrl: '',
        };
      }
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      editingProduct.value = null;
    };

    const saveProduct = () => {
      const newProduct: Product = {
        id: editingProduct.value?.id || `${Date.now()}`,
        name: productForm.value.name,
        description: productForm.value.description,
        price: productForm.value.price,
        oldPrice: productForm.value.oldPrice || undefined,
        discount: productForm.value.oldPrice
          ? Math.round(((productForm.value.oldPrice - productForm.value.price) / productForm.value.oldPrice) * 100)
          : undefined,
        images: [productForm.value.imageUrl || 'https://via.placeholder.com/400x400/cccccc/ffffff?text=No+Image'],
        category: productForm.value.category,
        rating: editingProduct.value?.rating || 4.5,
        reviewsCount: editingProduct.value?.reviewsCount || 0,
        inStock: productForm.value.stockQuantity > 0,
        stockQuantity: productForm.value.stockQuantity,
        brand: productForm.value.brand,
        tags: editingProduct.value?.tags || [],
        createdAt: editingProduct.value?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (editingProduct.value) {
        // Update existing
        const index = products.value.findIndex(p => p.id === editingProduct.value!.id);
        if (index !== -1) {
          products.value[index] = newProduct;
        }

        if (eventBus) {
          eventBus.emit('admin:product-updated', { product: newProduct });
          eventBus.emit('notification:show', {
            type: 'success',
            message: `✓ ${newProduct.name} обновлен`,
          });
        }
      } else {
        // Add new
        products.value.push(newProduct);

        if (eventBus) {
          eventBus.emit('admin:product-created', { product: newProduct });
          eventBus.emit('notification:show', {
            type: 'success',
            message: `✓ ${newProduct.name} добавлен`,
          });
        }
      }

      updateStats();
      closeModal();
    };

    const deleteProduct = (product: Product) => {
      if (!confirm(`Удалить товар "${product.name}"?`)) return;

      products.value = products.value.filter(p => p.id !== product.id);

      if (eventBus) {
        eventBus.emit('admin:product-deleted', { productId: product.id });
        eventBus.emit('notification:show', {
          type: 'info',
          message: `${product.name} удален`,
        });
      }

      updateStats();
    };

    const updateOrderStatus = (order: Order, newStatus: string) => {
      order.status = newStatus;
      order.updatedAt = new Date();

      if (eventBus) {
        eventBus.emit('admin:order-status-changed', { orderId: order.id, status: newStatus });
        eventBus.emit('notification:show', {
          type: 'info',
          message: `Статус заказа ${order.id} изменен`,
        });
      }

      updateStats();
    };

    const cancelOrder = (order: Order) => {
      if (!confirm(`Отменить заказ ${order.id}?`)) return;
      updateOrderStatus(order, 'cancelled');
    };

    return {
      isEventBusReady,
      activeTab,
      products,
      orders,
      orderFilter,
      filteredOrders,
      showModal,
      editingProduct,
      productForm,
      stats,
      formatPrice,
      formatDate,
      getStockClass,
      showProductModal,
      closeModal,
      saveProduct,
      deleteProduct,
      updateOrderStatus,
      cancelOrder,
    };
  },
});
</script>

<style scoped src="./AdminPanel.css"></style>


