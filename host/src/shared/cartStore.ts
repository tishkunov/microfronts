// Глобальный store для корзины, который работает независимо от монтирования компонентов
import { eventBus } from './eventBus';

interface CartItem {
  productId: string;
  product: any; // Product из каталога
  quantity: number;
  addedAt: string; // ISO string для localStorage
}

interface CartState {
  items: CartItem[];
}

const STORAGE_KEY = 'microfrontend_cart';

// Загрузка из localStorage
const loadCartFromStorage = (): CartState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[CartStore] Error loading from localStorage:', error);
  }
  return { items: [] };
};

// Сохранение в localStorage
const saveCartToStorage = (cart: CartState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('[CartStore] Error saving to localStorage:', error);
  }
};

class CartStore {
  private cart: CartState = loadCartFromStorage();
  private listeners: Set<(cart: CartState) => void> = new Set();

  constructor() {
    // Подписываемся на события добавления в корзину
    eventBus.on('catalog:add-to-cart', (data: any) => {
      console.log('[CartStore] Received catalog:add-to-cart event:', data);
      this.addItem(data.product, data.quantity);
    });
  }

  getCart(): CartState {
    return { ...this.cart };
  }

  addItem(product: any, quantity: number = 1) {
    const existingItem = this.cart.items.find(item => item.productId === product.id);

    if (existingItem) {
      // Обновляем количество
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stockQuantity) {
        eventBus.emit('notification:show', {
          type: 'warning',
          message: `Максимальное количество: ${product.stockQuantity}`,
        });
        return;
      }

      existingItem.quantity = newQuantity;
    } else {
      // Добавляем новый товар
      this.cart.items.push({
        productId: product.id,
        product,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }

    this.save();
    this.notify();
    
    // Отправляем уведомление об успешном добавлении
    eventBus.emit('notification:show', {
      type: 'success',
      message: `${product.name} добавлен в корзину`,
      duration: 3000,
    });
    
    eventBus.emit('cart:item-added', { product, quantity });
    eventBus.emit('cart:updated', {
      itemCount: this.cart.items.reduce((sum, item) => sum + item.quantity, 0),
      total: this.cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    });
  }

  removeItem(productId: string) {
    this.cart.items = this.cart.items.filter(item => item.productId !== productId);
    this.save();
    this.notify();
    eventBus.emit('cart:item-removed', { productId });
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }

    const item = this.cart.items.find(item => item.productId === productId);
    if (item) {
      if (quantity > item.product.stockQuantity) {
        eventBus.emit('notification:show', {
          type: 'warning',
          message: `Максимальное количество: ${item.product.stockQuantity}`,
        });
        return;
      }
      item.quantity = quantity;
      this.save();
      this.notify();
      eventBus.emit('cart:item-quantity-changed', { productId, quantity });
    }
  }

  clearCart() {
    this.cart.items = [];
    this.save();
    this.notify();
    eventBus.emit('cart:cleared', '');
  }

  subscribe(listener: (cart: CartState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const cart = this.getCart();
    this.listeners.forEach(listener => {
      try {
        listener(cart);
      } catch (error) {
        console.error('[CartStore] Error in listener:', error);
      }
    });
  }

  private save() {
    saveCartToStorage(this.cart);
  }
}

// Singleton экземпляр
export const cartStore = new CartStore();
