import React, { useEffect, useState } from 'react';
import { eventBus } from '../shared/eventBus';
import './EventBusMonitor.css';

interface EventLog {
  id: number;
  event: string;
  data: any;
  timestamp: Date;
}

export const EventBusMonitor: React.FC = () => {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    if (!isMonitoring) return;

    let eventId = 0;

    // Перехватываем emit для логирования всех событий
    const originalEmit = eventBus.emit.bind(eventBus);
    
    (eventBus as any).emit = function(event: string, data: any) {
      setEvents(prev => [
        {
          id: eventId++,
          event,
          data,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49), // Храним последние 50 событий
      ]);
      
      return originalEmit(event, data);
    };

    return () => {
      // Восстанавливаем оригинальный emit
      (eventBus as any).emit = originalEmit;
    };
  }, [isMonitoring]);

  const clearEvents = () => {
    setEvents([]);
  };

  const filteredEvents = filter
    ? events.filter(e => e.event.toLowerCase().includes(filter.toLowerCase()))
    : events;

  const getEventColor = (eventName: string): string => {
    if (eventName.startsWith('chart:')) return '#4CAF50';
    if (eventName.startsWith('counter:')) return '#9c27b0';
    if (eventName.startsWith('form:')) return '#42b983';
    if (eventName.startsWith('notification:')) return '#ff9800';
    if (eventName.startsWith('microfrontend:')) return '#2196F3';
    if (eventName.startsWith('data:')) return '#00bcd4';
    return '#666';
  };

  const getEventIcon = (eventName: string): string => {
    if (eventName.startsWith('chart:')) return '📊';
    if (eventName.startsWith('counter:')) return '🔢';
    if (eventName.startsWith('form:')) return '📝';
    if (eventName.startsWith('notification:')) return '🔔';
    if (eventName.startsWith('microfrontend:')) return '🎯';
    if (eventName.startsWith('data:')) return '🔄';
    return '📡';
  };

  return (
    <div className="eventbus-monitor">
      <div className="monitor-header">
        <h3>📡 EventBus Monitor</h3>
        <div className="monitor-controls">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={isMonitoring ? 'btn-pause' : 'btn-play'}
          >
            {isMonitoring ? '⏸ Пауза' : '▶️ Продолжить'}
          </button>
          <button onClick={clearEvents} className="btn-clear">
            🗑️ Очистить
          </button>
          <input
            type="text"
            placeholder="Фильтр событий..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-input"
          />
          <span className="event-count">
            {filteredEvents.length} событий
          </span>
        </div>
      </div>

      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            {isMonitoring ? 'Ожидание событий...' : 'Мониторинг приостановлен'}
          </div>
        ) : (
          filteredEvents.map((eventLog) => (
            <div
              key={eventLog.id}
              className="event-item"
              style={{ borderLeftColor: getEventColor(eventLog.event) }}
            >
              <div className="event-header">
                <span className="event-icon">{getEventIcon(eventLog.event)}</span>
                <span className="event-name" style={{ color: getEventColor(eventLog.event) }}>
                  {eventLog.event}
                </span>
                <span className="event-time">
                  {eventLog.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="event-data">
                {eventLog.data !== undefined && eventLog.data !== null ? (
                  typeof eventLog.data === 'object' ? (
                    <pre>{JSON.stringify(eventLog.data, null, 2)}</pre>
                  ) : (
                    <span>{String(eventLog.data)}</span>
                  )
                ) : (
                  <span className="no-data">без данных</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="monitor-legend">
        <h4>Легенда событий:</h4>
        <div className="legend-items">
          <span className="legend-item">
            <span style={{ color: '#4CAF50' }}>📊 chart:*</span> - События графика
          </span>
          <span className="legend-item">
            <span style={{ color: '#9c27b0' }}>🔢 counter:*</span> - События счетчика
          </span>
          <span className="legend-item">
            <span style={{ color: '#42b983' }}>📝 form:*</span> - События формы
          </span>
          <span className="legend-item">
            <span style={{ color: '#ff9800' }}>🔔 notification:*</span> - Уведомления
          </span>
          <span className="legend-item">
            <span style={{ color: '#2196F3' }}>🎯 microfrontend:*</span> - Жизненный цикл
          </span>
          <span className="legend-item">
            <span style={{ color: '#00bcd4' }}>🔄 data:*</span> - Обновление данных
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventBusMonitor;


