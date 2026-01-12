// TypeScript декларации для host remote модулей

declare module 'host/shared' {
  export { eventBus, sharedStore, cartStore, initialState } from '../../host/src/shared/index';
  export type { EventMap, EventKey, EventCallback, SharedState, User, CartItem } from '../../host/src/shared/index';
}

declare module 'host/eventBus' {
  import { EventMap } from 'host/shared';

  type EventKey = keyof EventMap;
  type EventCallback<K extends EventKey> = (data: EventMap[K]) => void;

  interface EventBus {
    on<K extends EventKey>(event: K, callback: EventCallback<K>): () => void;
    once<K extends EventKey>(event: K, callback: EventCallback<K>): () => void;
    emit<K extends EventKey>(event: K, data: EventMap[K]): void;
    off<K extends EventKey>(event: K): void;
    clear(): void;
    listenerCount<K extends EventKey>(event: K): number;
  }

  export const eventBus: EventBus;
  export type { EventMap, EventKey, EventCallback };
}

declare module 'host/store' {
  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }

  interface CartItem {
    productId: string;
    quantity: number;
  }

  interface SharedState {
    user: User | null;
    theme: 'light' | 'dark';
    cart: CartItem[];
    isLoading: boolean;
  }

  interface SharedStore {
    getState(): SharedState;
    subscribe(listener: (state: SharedState) => void): () => void;
    setUser(user: User | null): void;
    updateUser(updates: Partial<User>): void;
    setTheme(theme: 'light' | 'dark'): void;
    toggleTheme(): void;
    addToCart(productId: string, quantity?: number): void;
    removeFromCart(productId: string): void;
    clearCart(): void;
    getCartTotal(): number;
    setLoading(isLoading: boolean): void;
    reset(): void;
  }

  export const sharedStore: SharedStore;
  export type { SharedState, User, CartItem };
}


