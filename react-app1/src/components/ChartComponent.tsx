import React, { useEffect, useState } from 'react';
import './ChartComponent.css';

// Импортируем EventBus из host через Module Federation
let eventBus: any = null;

// Динамический импорт EventBus
const loadEventBus = async () => {
  try {
    // @ts-ignore - Module Federation dynamic import
    const shared = await import('host/shared');
    return shared.eventBus;
  } catch (error) {
    console.warn('[ChartComponent] EventBus не доступен, работаем в standalone режиме');
    return null;
  }
};

interface ChartData {
  label: string;
  value: number;
}

export const ChartComponent: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData[]>([
    { label: 'Янв', value: 65 },
    { label: 'Фев', value: 59 },
    { label: 'Мар', value: 80 },
    { label: 'Апр', value: 81 },
    { label: 'Май', value: 56 },
    { label: 'Июн', value: 55 },
  ]);

  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [counterValue, setCounterValue] = useState<number>(0);
  const [formData, setFormData] = useState<any>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isEventBusReady, setIsEventBusReady] = useState(false);

  useEffect(() => {
    // Загружаем EventBus
    loadEventBus().then((bus) => {
      if (bus) {
        eventBus = bus;
        setIsEventBusReady(true);
        
        // Уведомляем о загрузке
        eventBus.emit('microfrontend:loaded', {
          name: 'react-app1-chart',
          timestamp: Date.now(),
        });
        
        addNotification('EventBus подключен! 🎉');
      }
    });
  }, []);

  useEffect(() => {
    if (!eventBus) return;

    // Подписываемся на события от других микрофронтов
    
    // Слушаем изменения счетчика из React App 2
    const unsubscribeCounter = eventBus.on('counter:changed', (data: any) => {
      setCounterValue(data.value);
      addNotification(`📥 Счетчик: ${data.value} (от ${data.source})`);
    });

    // Слушаем сброс счетчика
    const unsubscribeReset = eventBus.on('counter:reset', () => {
      setCounterValue(0);
      addNotification('📥 Счетчик сброшен');
    });

    // Слушаем данные формы из Vue App
    const unsubscribeForm = eventBus.on('form:submitted', (data: any) => {
      setFormData(data.data);
      addNotification(`📥 Форма: ${data.formId} (валидная: ${data.isValid})`);
    });

    // Слушаем ошибки валидации формы
    const unsubscribeFormError = eventBus.on('form:validationError', (data: any) => {
      addNotification(`📥 Ошибка формы: ${data.fieldName} - ${data.error}`);
    });

    // Слушаем запрос на обновление данных
    const unsubscribeRefresh = eventBus.on('data:refresh', (data: any) => {
      const source = data.source || 'unknown';
      if (source !== 'react-app1-chart') {
        addNotification(`📥 Запрос обновления от ${source}`);
        refreshChartData();
      }
    });

    // Очистка подписок
    return () => {
      unsubscribeCounter();
      unsubscribeReset();
      unsubscribeForm();
      unsubscribeFormError();
      unsubscribeRefresh();
    };
  }, [isEventBusReady]);

  const addNotification = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setNotifications(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const refreshChartData = () => {
    setChartData(prev =>
      prev.map(item => ({
        ...item,
        value: Math.floor(Math.random() * 100),
      }))
    );
    addNotification('📊 График обновлен');
  };

  const handleBarClick = (index: number) => {
    setSelectedBar(index);
    const data = chartData[index];

    addNotification(`📤 Выбран: ${data.label} (${data.value})`);

    // Отправляем событие о выборе данных на графике
    if (eventBus) {
      eventBus.emit('chart:dataSelected', {
        chartId: 'main-chart',
        value: data.value,
        label: data.label,
        timestamp: Date.now(),
      });

      // Показываем уведомление
      eventBus.emit('notification:show', {
        type: 'info',
        message: `График: ${data.label} = ${data.value}`,
      });
    }
  };

  const handleFilterChange = (filter: string) => {
    if (eventBus) {
      eventBus.emit('chart:filterChanged', {
        filter,
        range: filter === 'custom' ? { from: 0, to: 100 } : undefined,
      });
      addNotification(`📤 Фильтр: ${filter}`);
    }
  };

  const handleRequestData = () => {
    if (eventBus) {
      eventBus.emit('data:refresh', { source: 'react-app1-chart' });
      refreshChartData();
      addNotification('📤 Запрос обновления всем микрофронтам');
    }
  };

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="chart-container">
      <div className="header-section">
        <h2>📊 График (React App 1)</h2>
        <div className={`status ${isEventBusReady ? 'connected' : 'disconnected'}`}>
          {isEventBusReady ? '🟢 EventBus подключен' : '🔴 EventBus не подключен'}
        </div>
      </div>

      <div className="chart-controls">
        <button onClick={() => handleFilterChange('all')}>Все</button>
        <button onClick={() => handleFilterChange('last3')}>Последние 3</button>
        <button onClick={() => handleFilterChange('custom')}>Кастом</button>
        <button onClick={handleRequestData} className="btn-refresh">
          🔄 Обновить все
        </button>
      </div>

      <div className="chart">
        {chartData.map((data, index) => (
          <div
            key={index}
            className={`chart-bar ${selectedBar === index ? 'selected' : ''}`}
            onClick={() => handleBarClick(index)}
            title={`Кликните, чтобы отправить значение другим микрофронтам`}
          >
            <div
              className="bar"
              style={{
                height: `${(data.value / maxValue) * 180}px`,
                backgroundColor: selectedBar === index ? '#2196F3' : '#4CAF50',
              }}
            >
              <span className="bar-value">{data.value}</span>
            </div>
            <div className="bar-label">{data.label}</div>
          </div>
        ))}
      </div>

      {/* Данные от других микрофронтов */}
      <div className="shared-data">
        <h3>📥 Данные от других микрофронтов:</h3>
        <div className="data-grid">
          <div className="data-item">
            <strong>Счетчик (App 2):</strong>
            <span className="value">{counterValue}</span>
          </div>
          {formData && (
            <div className="data-item">
              <strong>Форма (Vue App):</strong>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
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
            <li><code>chart:dataSelected</code> - клик на столбец</li>
            <li><code>chart:filterChanged</code> - смена фильтра</li>
            <li><code>data:refresh</code> - запрос обновления</li>
          </ul>
        </div>
        
        <div className="info-section">
          <h4>📥 Слушает события:</h4>
          <ul>
            <li><code>counter:changed</code> - счетчик изменен</li>
            <li><code>form:submitted</code> - форма отправлена</li>
            <li><code>data:refresh</code> - запрос обновления</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
