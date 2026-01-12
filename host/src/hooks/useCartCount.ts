import { useEffect, useState } from 'react';
import { eventBus } from '../shared/eventBus';

/**
 * Hook для получения количества товаров в корзине
 * Слушает события от CartMF через EventBus
 * Shell не хранит cart state, только слушает события
 */
export const useCartCount = (): number => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Слушаем бизнес-события от CartMF
    // Тип события определяется MF, Shell просто передает через EventBus
    const unsubscribe = eventBus.on('cart:updated', (data: any) => {
      if (data && typeof data.itemCount === 'number') {
        setCartCount(data.itemCount);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return cartCount;
};

