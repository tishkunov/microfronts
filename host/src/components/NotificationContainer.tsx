import React, { useEffect, useState, useRef } from 'react';
import { eventBus } from '../shared/eventBus';
import { EventMap } from '../shared/types';
import './NotificationContainer.css';

interface Notification {
  id: number;
  type: EventMap['notification:show']['type'];
  message: string;
  duration?: number;
}

// Глобальный реестр активных экземпляров компонента
const activeInstances = new Set<{
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  notificationIdRef: React.MutableRefObject<number>;
  timeoutsRef: React.MutableRefObject<Map<number, NodeJS.Timeout>>;
}>();

// Глобальные обработчики событий (создаются один раз)
let isSubscribed = false;
let unsubscribeNotification: (() => void) | null = null;
let unsubscribeClear: (() => void) | null = null;

const setupGlobalHandlers = () => {
  if (isSubscribed || !eventBus || typeof eventBus.on !== 'function') {
    return;
  }

  console.log('[NotificationContainer] Setting up global event handlers...');

  const handleNotification = (data: EventMap['notification:show']) => {
    console.log('[NotificationContainer] ✅ Global handler received notification:show event:', data);
    console.log('[NotificationContainer] Active instances count:', activeInstances.size);
    
    activeInstances.forEach(instance => {
      const id = ++instance.notificationIdRef.current;
      const notification: Notification = { id, ...data };
      
      instance.setNotifications(prev => [...prev, notification]);

      const timeout = setTimeout(() => {
        instance.setNotifications(prev => prev.filter(n => n.id !== id));
        instance.timeoutsRef.current.delete(id);
      }, data.duration || 3000);

      instance.timeoutsRef.current.set(id, timeout);
    });
  };

  const handleClear = () => {
    console.log('[NotificationContainer] Clearing all notifications');
    activeInstances.forEach(instance => {
      instance.timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      instance.timeoutsRef.current.clear();
      instance.setNotifications([]);
    });
  };

  unsubscribeNotification = eventBus.on('notification:show', handleNotification);
  unsubscribeClear = eventBus.on('notification:clear', handleClear);
  isSubscribed = true;

  const listenerCount = eventBus.listenerCount('notification:show');
  console.log('[NotificationContainer] ✅ Global handlers registered. Count:', listenerCount);
};

export const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationIdRef = useRef(0);
  const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const instanceRef = useRef({
    setNotifications,
    notificationIdRef,
    timeoutsRef,
  });

  // Обновляем ref при изменении setNotifications
  instanceRef.current.setNotifications = setNotifications;

  useEffect(() => {
    console.log('[NotificationContainer] ✅ Component mounted');
    
    // Обновляем ref с актуальным setNotifications
    instanceRef.current.setNotifications = setNotifications;
    
    // Настраиваем глобальные обработчики (только один раз)
    setupGlobalHandlers();
    
    // Регистрируем этот экземпляр
    activeInstances.add(instanceRef.current);
    console.log('[NotificationContainer] Instance registered. Total instances:', activeInstances.size);

    return () => {
      console.log('[NotificationContainer] 🧹 Component unmounting');
      activeInstances.delete(instanceRef.current);
      console.log('[NotificationContainer] Instance unregistered. Total instances:', activeInstances.size);
      
      // Очищаем таймауты для этого экземпляра
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, [setNotifications]);

  // Всегда рендерим контейнер, чтобы компонент был смонтирован и useEffect выполнился
  return (
    <div className="notification-container" style={{ display: notifications.length === 0 ? 'none' : 'flex' }}>
      {notifications.map(notif => (
        <div key={notif.id} className={`notification notification-${notif.type}`}>
          {notif.message}
        </div>
      ))}
    </div>
  );
};

