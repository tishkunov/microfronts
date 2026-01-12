import { SharedState, initialState, User } from './types';
import { eventBus } from './eventBus';

type Listener = (state: SharedState) => void;

/**
 * Shared Store для инфраструктурных данных Shell
 * НЕ содержит бизнес-данные (cart, products, orders)
 */
class SharedStore {
  private state: SharedState = { ...initialState };
  private listeners: Set<Listener> = new Set();

  /**
   * Получить текущее состояние
   */
  getState(): SharedState {
    return { ...this.state };
  }

  /**
   * Подписаться на изменения состояния
   * @returns Функция отписки
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Уведомить всех слушателей об изменении
   */
  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('[SharedStore] Error in listener:', error);
      }
    });
  }

  // === User (Infrastructure) ===

  setUser(user: User | null): void {
    this.state.user = user;
    this.notify();
    if (user) {
      eventBus.emit('user:login', { userId: user.id, email: user.email });
    } else {
      eventBus.emit('user:logout', undefined as void);
    }
  }

  updateUser(updates: Partial<User>): void {
    if (this.state.user) {
      this.state.user = { ...this.state.user, ...updates };
      this.notify();
      eventBus.emit('user:updated', {
        userId: this.state.user.id,
        name: updates.name,
        avatar: updates.avatar,
      });
    }
  }

  // === Theme (Infrastructure) ===

  setTheme(theme: 'light' | 'dark'): void {
    this.state.theme = theme;
    this.notify();
    eventBus.emit('theme:change', { theme });
  }

  toggleTheme(): void {
    this.setTheme(this.state.theme === 'light' ? 'dark' : 'light');
  }

  // === Loading (Infrastructure) ===

  setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
    this.notify();
  }

  // === Reset ===

  reset(): void {
    this.state = { ...initialState };
    this.notify();
  }
}

// Singleton экземпляр
export const sharedStore = new SharedStore();

// Экспортируем типы
export type { SharedState, User };



