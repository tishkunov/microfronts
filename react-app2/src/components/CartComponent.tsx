import React, { useEffect, useState, useCallback } from 'react';
import './CartComponent.css';

let eventBus: any = null;
let cartStore: any = null;

const loadDependencies = async () => {
  try {
    // @ts-ignore
    const shared = await import('host/shared');
    return { eventBus: shared.eventBus, cartStore: shared.cartStore };
  } catch (error) {
    console.warn('[CartComponent] Standalone mode');
    return { eventBus: null, cartStore: null };
  }
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  brand: string;
  inStock: boolean;
  stockQuantity: number;
}

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
}

export const CartComponent: React.FC = () => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isEventBusReady, setIsEventBusReady] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.productId === product.id);

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stockQuantity) {
          if (eventBus) {
            eventBus.emit('notification:show', {
              type: 'warning',
              message: `Максимальное количество: ${product.stockQuantity}`,
            });
          }
          return prev;
        }

        return {
          ...prev,
          items: prev.items.map(item =>
            item.productId === product.id
              ? { ...item, quantity: newQuantity }
              : item
          ),
        };
      } else {
        // Add new item
        return {
          ...prev,
          items: [
            ...prev.items,
            {
              productId: product.id,
              product,
              quantity,
              addedAt: new Date(),
            },
          ],
        };
      }
    });

    if (eventBus) {
      eventBus.emit('cart:item-added', { product, quantity });
      eventBus.emit('notification:show', {
        type: 'success',
        message: `${product.name} добавлен в корзину`,
      });
    }
  }, []);

  useEffect(() => {
    console.log('[CartComponent] Loading dependencies...');
    loadDependencies().then(({ eventBus: bus, cartStore: store }) => {
      console.log('[CartComponent] Dependencies loaded:', { hasEventBus: !!bus, hasCartStore: !!store });
      if (bus && store) {
        eventBus = bus;
        cartStore = store;
        setIsEventBusReady(true);
        console.log('[CartComponent] EventBus and CartStore initialized');

        // Загружаем корзину из store
        const savedCart = cartStore.getCart();
        console.log('[CartComponent] Loading cart from store:', savedCart);
        setCart(prev => ({
          ...prev,
          items: savedCart.items.map((item: any) => ({
            ...item,
            addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
          })),
        }));

        // Подписываемся на изменения корзины
        const unsubscribeCart = cartStore.subscribe((newCart: any) => {
          console.log('[CartComponent] Cart updated from store:', newCart);
          setCart(prev => ({
            ...prev,
            items: newCart.items.map((item: any) => ({
              ...item,
              addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
            })),
          }));
        });

        eventBus.emit('microfrontend:loaded', {
          name: 'cart',
          timestamp: Date.now(),
        });

        return () => {
          unsubscribeCart();
        };
      }
    });
  }, []);

  // Recalculate totals when cart items change
  useEffect(() => {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const shipping = subtotal > 0 ? (subtotal >= 5000 ? 0 : 300) : 0;
    const discount = cart.couponCode ? subtotal * 0.1 : 0; // 10% discount
    const tax = (subtotal - discount + shipping) * 0.13; // 13% VAT
    const total = subtotal - discount + shipping + tax;

    setCart(prev => ({
      ...prev,
      subtotal,
      discount,
      shipping,
      tax,
      total,
    }));

    // Emit cart updated event
    if (isEventBusReady && eventBus) {
      eventBus.emit('cart:updated', {
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        total,
      });
    }
  }, [cart.items, cart.couponCode, isEventBusReady]);

  const removeItem = (productId: string) => {
    const item = cart.items.find(i => i.productId === productId);

    if (cartStore) {
      cartStore.removeItem(productId);
    } else {
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.productId !== productId),
      }));
    }

    if (eventBus && item) {
      eventBus.emit('notification:show', {
        type: 'info',
        message: `${item.product.name} удален из корзины`,
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }

    if (cartStore) {
      cartStore.updateQuantity(productId, quantity);
    } else {
      const item = cart.items.find(i => i.productId === productId);
      if (item && quantity > item.product.stockQuantity) {
        if (eventBus) {
          eventBus.emit('notification:show', {
            type: 'warning',
            message: `Максимальное количество: ${item.product.stockQuantity}`,
          });
        }
        return;
      }

      setCart(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productId === productId
            ? { ...item, quantity }
            : item
        ),
      }));
    }

    if (eventBus) {
      eventBus.emit('cart:item-quantity-changed', { productId, quantity });
    }
  };

  const clearCart = () => {
    if (cartStore) {
      cartStore.clearCart();
    } else {
      setCart(prev => ({ ...prev, items: [], couponCode: undefined }));
    }
    setCouponCode('');

    if (eventBus) {
      eventBus.emit('notification:show', {
        type: 'info',
        message: 'Корзина очищена',
      });
    }
  };

  const applyCoupon = () => {
    // Simple coupon validation
    const validCoupons = ['SALE10', 'DISCOUNT', 'PROMO'];
    
    if (validCoupons.includes(couponCode.toUpperCase())) {
      setCart(prev => ({ ...prev, couponCode: couponCode.toUpperCase() }));
      setCouponError('');
      
      if (eventBus) {
        eventBus.emit('notification:show', {
          type: 'success',
          message: '✓ Купон применен! Скидка 10%',
        });
      }
    } else {
      setCouponError('Неверный купон');
    }
  };

  const removeCoupon = () => {
    setCart(prev => ({ ...prev, couponCode: undefined }));
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) return;

    setIsCheckingOut(true);

    // Simulate order creation
    setTimeout(() => {
      const order = {
        id: `ORD-${Date.now()}`,
        userId: 'user123',
        items: cart.items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0],
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity,
        })),
        status: 'pending' as const,
        subtotal: cart.subtotal,
        discount: cart.discount,
        shipping: cart.shipping,
        tax: cart.tax,
        total: cart.total,
        shippingAddress: {
          street: 'ул. Примерная, д. 1',
          city: 'Москва',
          state: 'Московская обл.',
          zipCode: '123456',
          country: 'Россия',
        },
        paymentMethod: 'card' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (eventBus) {
        eventBus.emit('order:created', { order });
        eventBus.emit('notification:show', {
          type: 'success',
          message: `✓ Заказ ${order.id} оформлен!`,
          duration: 5000,
        });
      }

      setOrderSuccess(true);
      setIsCheckingOut(false);
      
      // Clear cart after 2 seconds
      setTimeout(() => {
        setCart(prev => ({ ...prev, items: [], couponCode: undefined }));
        setCouponCode('');
        setOrderSuccess(false);
      }, 2000);
    }, 1500);
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Debug logging
  console.log('[CartComponent] Cart state:', { itemCount, itemsLength: cart.items.length, items: cart.items });

  if (orderSuccess) {
    return (
      <div className="cart-container">
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h2>Заказ успешно оформлен!</h2>
          <p>Спасибо за покупку. Мы отправили подтверждение на вашу почту.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <div>
          <h1>🛒 Корзина</h1>
          <p>{itemCount} {itemCount === 1 ? 'товар' : 'товаров'}</p>
        </div>
        <div className={`status ${isEventBusReady ? 'connected' : 'disconnected'}`}>
          {isEventBusReady ? '🟢 Online' : '🔴 Offline'}
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Корзина пуста</h2>
          <p>Добавьте товары из каталога</p>
        </div>
      ) : (
        <div className="cart-body">
          {/* Items */}
          <div className="cart-items">
            <div className="cart-items-header">
              <h3>Товары ({cart.items.length})</h3>
              <button onClick={clearCart} className="btn-clear">
                Очистить корзину
              </button>
            </div>

            {cart.items.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="item-image">
                  <img src={item.product.images[0]} alt={item.product.name} />
                </div>

                <div className="item-info">
                  <div className="item-brand">{item.product.brand}</div>
                  <h4 className="item-name">{item.product.name}</h4>
                  <div className="item-price">{item.product.price.toLocaleString()} ₽</div>
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="qty-btn"
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  {(item.product.price * item.quantity).toLocaleString()} ₽
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="btn-remove"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Итого</h3>

            {/* Coupon */}
            <div className="coupon-section">
              {!cart.couponCode ? (
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Введите купон"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input"
                  />
                  <button onClick={applyCoupon} className="btn-apply-coupon">
                    Применить
                  </button>
                </div>
              ) : (
                <div className="coupon-applied">
                  <span>✓ Купон: {cart.couponCode}</span>
                  <button onClick={removeCoupon} className="btn-remove-coupon">
                    ✕
                  </button>
                </div>
              )}
              {couponError && <div className="coupon-error">{couponError}</div>}
              <small className="coupon-hint">Попробуйте: SALE10, DISCOUNT, PROMO</small>
            </div>

            {/* Price breakdown */}
            <div className="price-breakdown">
              <div className="price-row">
                <span>Товары ({itemCount})</span>
                <span>{cart.subtotal.toLocaleString()} ₽</span>
              </div>

              {cart.discount > 0 && (
                <div className="price-row discount">
                  <span>Скидка</span>
                  <span>−{cart.discount.toLocaleString()} ₽</span>
                </div>
              )}

              <div className="price-row">
                <span>Доставка</span>
                <span>
                  {cart.shipping === 0 ? (
                    <span className="free-shipping">Бесплатно</span>
                  ) : (
                    `${cart.shipping} ₽`
                  )}
                </span>
              </div>

              {cart.subtotal < 5000 && cart.subtotal > 0 && (
                <div className="shipping-hint">
                  До бесплатной доставки: {(5000 - cart.subtotal).toLocaleString()} ₽
                </div>
              )}

              <div className="price-row">
                <span>Налог (НДС 13%)</span>
                <span>{cart.tax.toLocaleString()} ₽</span>
              </div>

              <div className="price-row total">
                <span>Итого</span>
                <span>{cart.total.toLocaleString()} ₽</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-checkout"
              disabled={isCheckingOut || cart.items.length === 0}
            >
              {isCheckingOut ? '⏳ Оформление...' : '✓ Оформить заказ'}
            </button>

            <div className="payment-methods">
              <small>Принимаем к оплате:</small>
              <div className="payment-icons">
                💳 💵 🅿️ ₿
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="cart-info">
        <h4>ℹ️ Информация</h4>
        <ul>
          <li>✓ Бесплатная доставка при заказе от 5000 ₽</li>
          <li>✓ Гарантия возврата в течение 14 дней</li>
          <li>✓ Оплата при получении</li>
          <li>✓ Скидка 10% по купонам</li>
        </ul>
      </div>
    </div>
  );
};

export default CartComponent;


