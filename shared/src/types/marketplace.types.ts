/**
 * @package @microfrontends/shared/types
 * @description Типы для маркетплейса
 */

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  images: string[];
  category: ProductCategory;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockQuantity: number;
  brand: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = 
  | 'electronics' 
  | 'clothing' 
  | 'books' 
  | 'home' 
  | 'sports' 
  | 'toys'
  | 'food'
  | 'beauty';

export interface ProductFilter {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type PaymentMethod = 'card' | 'paypal' | 'cash' | 'crypto';

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stockQuantity: number;
  brand: string;
  images: string[];
  tags: string[];
}

// ============================================================================
// EVENT BUS TYPES FOR MARKETPLACE
// ============================================================================

export interface MarketplaceEventMap {
  // Catalog events
  'catalog:product-viewed': { productId: string; timestamp: number };
  'catalog:product-selected': { product: Product };
  'catalog:filter-changed': { filter: ProductFilter };
  'catalog:add-to-cart': { product: Product; quantity: number };
  
  // Cart events
  'cart:item-added': { product: Product; quantity: number };
  'cart:item-removed': { productId: string };
  'cart:item-quantity-changed': { productId: string; quantity: number };
  'cart:cleared': void;
  'cart:checkout-started': { cart: Cart };
  'cart:updated': { itemCount: number; total: number };
  
  // Order events
  'order:created': { order: Order };
  'order:status-changed': { orderId: string; status: OrderStatus };
  'order:cancelled': { orderId: string };
  
  // Admin events
  'admin:product-created': { product: Product };
  'admin:product-updated': { product: Product };
  'admin:product-deleted': { productId: string };
  'admin:order-status-changed': { orderId: string; status: OrderStatus };
  
  // Notification events
  'notification:show': { 
    type: 'success' | 'error' | 'info' | 'warning'; 
    message: string;
    duration?: number;
  };
}


