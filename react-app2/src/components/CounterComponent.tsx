import React, { useEffect, useState } from 'react';
import './CounterComponent.css';

// Импортируем EventBus из host через Module Federation
let eventBus: any = null;

const loadEventBus = async () => {
  try {
    // @ts-ignore - Module Federation dynamic import
    const shared = await import('host/shared');
    return shared.eventBus;
  } catch (error) {
    console.warn('[CounterComponent] EventBus не доступен, работаем в standalone режиме');
    return null;
  }
};

export const CounterComponent: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [chartData, setChartData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [autoIncrement, setAutoIncrement] = useState<boolean>(false);
  const [isEventBusReady, setIsEventBusReady] = useState(false);

  useEffect(() => {
    // Загружаем EventBus
    loadEventBus().then((bus) => {
      if (bus) {
        eventBus = bus;
        setIsEventBusReady(true);
        
        eventBus.emit('microfrontend:loaded', {
          name: 'react-app2-counter',
          timestamp: Date.now(),
        });
        
        addNotification('EventBus подключен! 🎉');
      }
    });
  }, []);

  useEffect(() => {
    if (!eventBus) return;

    // Подписываемся на события
    
    // Слушаем выбор данных на графике
    const unsubscribeChart = eventBus.on('chart:dataSelected', (data: any) => {
      setChartData(data);
      // Синхронизируем счетчик с графиком
      const newValue = data.value;
      setCount(newValue);
      emitCounterChange(newValue, 'chart-sync');
      addNotification(`📥 Синхронизация с графиком: ${data.label} = ${newValue}`);
    });

    // Слушаем изменение фильтра графика
    const unsubscribeFilter = eventBus.on('chart:filterChanged', (data: any) => {
      addNotification(`📥 Фильтр графика: ${data.filter}`);
    });

    // Слушаем данные формы
    const unsubscribeForm = eventBus.on('form:submitted', (data: any) => {
      setFormData(data.data);
      addNotification(`📥 Форма: ${data.formId}`);
      
      // Синхронизируем с числовым полем
      if (data.data.age && typeof data.data.age === 'number') {
        setCount(data.data.age);
        emitCounterChange(data.data.age, 'form-sync');
        addNotification(`📥 Синхронизация с возрастом: ${data.data.age}`);
      }
    });

    // Слушаем запросы на обновление
    const unsubscribeRefresh = eventBus.on('data:refresh', (data: any) => {
      const source = data.source || 'unknown';
      if (source !== 'react-app2-counter') {
        addNotification(`📥 Запрос обновления от ${source}`);
      }
    });

    // Слушаем команды увеличения/уменьшения
    const unsubscribeInc = eventBus.on('counter:increment', (data: any) => {
      const incrementStep = data.step || 1;
      setCount(prev => {
        const newValue = prev + incrementStep;
        emitCounterChange(newValue, 'external-command');
        return newValue;
      });
      addNotification(`📥 Команда +${incrementStep}`);
    });

    const unsubscribeDec = eventBus.on('counter:decrement', (data: any) => {
      const decrementStep = data.step || 1;
      setCount(prev => {
        const newValue = prev - decrementStep;
        emitCounterChange(newValue, 'external-command');
        return newValue;
      });
      addNotification(`📥 Команда -${decrementStep}`);
    });

    return () => {
      unsubscribeChart();
      unsubscribeFilter();
      unsubscribeForm();
      unsubscribeRefresh();
      unsubscribeInc();
      unsubscribeDec();
    };
  }, [isEventBusReady]);

  // Авто-инкремент
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoIncrement && eventBus) {
      interval = setInterval(() => {
        setCount(prev => {
          const newValue = prev + 1;
          emitCounterChange(newValue, 'auto-increment');
          return newValue;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoIncrement, isEventBusReady]);

  const addNotification = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setNotifications(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const emitCounterChange = (value: number, source: string) => {
    if (eventBus) {
      eventBus.emit('counter:changed', { value, source });
    }
  };

  const handleIncrement = () => {
    const newValue = count + step;
    setCount(newValue);
    emitCounterChange(newValue, 'react-app2-counter');
    addNotification(`📤 Увеличено: ${count} → ${newValue}`);

    if (eventBus) {
      eventBus.emit('notification:show', {
        type: 'success',
        message: `Счетчик: ${newValue}`,
      });
    }
  };

  const handleDecrement = () => {
    const newValue = count - step;
    setCount(newValue);
    emitCounterChange(newValue, 'react-app2-counter');
    addNotification(`📤 Уменьшено: ${count} → ${newValue}`);

    if (eventBus) {
      eventBus.emit('notification:show', {
        type: 'info',
        message: `Счетчик: ${newValue}`,
      });
    }
  };

  const handleReset = () => {
    setCount(0);
    emitCounterChange(0, 'react-app2-counter');
    addNotification('📤 Счетчик сброшен');

    if (eventBus) {
      eventBus.emit('counter:reset');
      eventBus.emit('notification:show', {
        type: 'warning',
        message: 'Счетчик сброшен',
      });
    }
  };

  const handleSendIncrement = () => {
    if (eventBus) {
      eventBus.emit('counter:increment', { step: 5 });
      addNotification('📤 Отправлена команда +5');
    }
  };

  const handleRequestRefresh = () => {
    if (eventBus) {
      eventBus.emit('data:refresh', { source: 'react-app2-counter' });
      addNotification('📤 Запрос обновления всем');
    }
  };

  return (
    <div className="counter-container">
      <div className="header-section">
        <h2>🔢 Счетчик (React App 2)</h2>
        <div className={`status ${isEventBusReady ? 'connected' : 'disconnected'}`}>
          {isEventBusReady ? '🟢 EventBus подключен' : '🔴 EventBus не подключен'}
        </div>
      </div>

      <div className="counter-display">
        <div className="counter-value">{count}</div>
        <div className="counter-label">Текущее значение</div>
      </div>

      <div className="counter-controls">
        <div className="control-group">
          <label>
            Шаг:
            <input
              type="number"
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              min="1"
              max="100"
            />
          </label>
        </div>

        <div className="button-group">
          <button onClick={handleDecrement} className="btn-decrement">
            ➖ Уменьшить
          </button>
          <button onClick={handleIncrement} className="btn-increment">
            ➕ Увеличить
          </button>
          <button onClick={handleReset} className="btn-reset">
            🔄 Сбросить
          </button>
        </div>

        <div className="button-group">
          <button
            onClick={() => setAutoIncrement(!autoIncrement)}
            className={autoIncrement ? 'btn-auto active' : 'btn-auto'}
            disabled={!isEventBusReady}
          >
            {autoIncrement ? '⏸ Стоп авто' : '▶️ Авто +1/сек'}
          </button>
        </div>

        <div className="button-group">
          <button onClick={handleSendIncrement} className="btn-command" disabled={!isEventBusReady}>
            📤 Команда +5
          </button>
          <button onClick={handleRequestRefresh} className="btn-refresh" disabled={!isEventBusReady}>
            🔄 Обновить все
          </button>
        </div>
      </div>

      {/* Данные от других микрофронтов */}
      <div className="shared-data">
        <h3>📥 Данные от других микрофронтов:</h3>
        <div className="data-grid">
          {chartData && (
            <div className="data-item">
              <strong>График (App 1):</strong>
              <div>📊 {chartData.label}: {chartData.value}</div>
              <small>{new Date(chartData.timestamp).toLocaleTimeString()}</small>
            </div>
          )}

          {formData && (
            <div className="data-item">
              <strong>Форма (Vue App):</strong>
              <div>👤 {formData.name}</div>
              <div>📧 {formData.email}</div>
              <div>🎂 {formData.age} лет</div>
            </div>
          )}
        </div>
      </div>

      {/* Лог уведомлений */}
      <div className="notifications-log">
        <h4>📝 Лог событий (последние 10):</h4>
        {notifications.length === 0 ? (
          <div className="no-notifications">Нет событий</div>
        ) : (
          <ul>
            {notifications.map((notification, index) => (
              <li key={index}>{notification}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="info-box">
        <div className="info-section">
          <h4>📤 Отправляет события:</h4>
          <ul>
            <li><code>counter:changed</code> - изменение счетчика</li>
            <li><code>counter:reset</code> - сброс</li>
            <li><code>counter:increment</code> - команда +</li>
          </ul>
        </div>
        
        <div className="info-section">
          <h4>📥 Слушает события:</h4>
          <ul>
            <li><code>chart:dataSelected</code> - данные графика</li>
            <li><code>form:submitted</code> - данные формы</li>
            <li><code>counter:increment/decrement</code> - команды</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CounterComponent;
