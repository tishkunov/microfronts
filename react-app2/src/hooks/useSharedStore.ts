import { useState, useEffect, useCallback } from 'react';
import { sharedStore, SharedState } from 'host/store';

/**
 * React хук для работы с SharedStore
 * Автоматически подписывается на изменения и обновляет компонент
 */
export function useSharedStore() {
  const [state, setState] = useState<SharedState>(sharedStore.getState());

  useEffect(() => {
    // Подписываемся на изменения store
    const unsubscribe = sharedStore.subscribe((newState) => {
      setState(newState);
    });

    // Отписываемся при размонтировании
    return unsubscribe;
  }, []);

  return {
    ...state,
    // Методы store
    setUser: sharedStore.setUser.bind(sharedStore),
    updateUser: sharedStore.updateUser.bind(sharedStore),
    setTheme: sharedStore.setTheme.bind(sharedStore),
    toggleTheme: sharedStore.toggleTheme.bind(sharedStore),
    addToCart: sharedStore.addToCart.bind(sharedStore),
    removeFromCart: sharedStore.removeFromCart.bind(sharedStore),
    clearCart: sharedStore.clearCart.bind(sharedStore),
    getCartTotal: sharedStore.getCartTotal.bind(sharedStore),
    setLoading: sharedStore.setLoading.bind(sharedStore),
  };
}

/**
 * React хук для подписки на конкретные события eventBus
 */
export function useEventBus() {
  // Динамический импорт eventBus для типов
  const [eventBus, setEventBus] = useState<typeof import('host/eventBus').eventBus | null>(null);

  useEffect(() => {
    import('host/eventBus').then((module) => {
      setEventBus(module.eventBus);
    });
  }, []);

  return eventBus;
}


