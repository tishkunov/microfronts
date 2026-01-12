import { EventMap } from './types';

type EventKey = keyof EventMap;
type EventCallback<K extends EventKey> = (data: EventMap[K]) => void;

class EventBus {
  private listeners: Map<EventKey, Set<EventCallback<any>>> = new Map();

  /**
   * Подписаться на событие
   * @returns Функция отписки
   */
  on<K extends EventKey>(event: K, callback: EventCallback<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Debug logging
    console.log(`[EventBus] Subscribed to "${event}". Listeners: ${this.listeners.get(event)!.size}`);

    // Возвращаем функцию отписки
    return () => {
      this.listeners.get(event)?.delete(callback);
      console.log(`[EventBus] Unsubscribed from "${event}". Listeners: ${this.listeners.get(event)?.size || 0}`);
    };
  }

  /**
   * Подписаться на событие один раз
   */
  once<K extends EventKey>(event: K, callback: EventCallback<K>): () => void {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    });
    return unsubscribe;
  }

  /**
   * Отправить событие
   */
  emit<K extends EventKey>(event: K, data: EventMap[K]): void {
    const callbacks = this.listeners.get(event);
    const listenerCount = callbacks?.size || 0;
    
    console.log(`[EventBus] Emitting "${event}" to ${listenerCount} listener(s):`, data);
    
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error in handler for "${event}":`, error);
        }
      });
    } else {
      console.warn(`[EventBus] No listeners for event "${event}"`);
    }
  }

  /**
   * Отписать все обработчики от события
   */
  off<K extends EventKey>(event: K): void {
    this.listeners.delete(event);
  }

  /**
   * Очистить все подписки
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Получить количество слушателей для события (для отладки)
   */
  listenerCount<K extends EventKey>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// Singleton экземпляр
export const eventBus = new EventBus();

// Добавляем уникальный ID для отладки
(eventBus as any).__instanceId = `eventBus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
console.log('[EventBus] Singleton instance created with ID:', (eventBus as any).__instanceId);

// Экспортируем тип для использования в других модулях
export type { EventMap, EventKey, EventCallback };


