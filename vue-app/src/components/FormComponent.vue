<template>
  <div class="form-container">
    <div class="header-section">
      <h2>📝 Форма (Vue App)</h2>
      <div :class="['status', isEventBusReady ? 'connected' : 'disconnected']">
        {{ isEventBusReady ? '🟢 EventBus подключен' : '🔴 EventBus не подключен' }}
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="vue-form">
      <div class="form-group">
        <label for="name">Имя:</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          @input="handleFieldChange('name', formData.name)"
          :class="{ error: errors.name }"
          placeholder="Введите имя"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          @input="handleFieldChange('email', formData.email)"
          :class="{ error: errors.email }"
          placeholder="email@example.com"
        />
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="age">Возраст:</label>
        <input
          id="age"
          v-model.number="formData.age"
          type="number"
          @input="handleFieldChange('age', formData.age)"
          :class="{ error: errors.age }"
          placeholder="18+"
        />
        <span v-if="errors.age" class="error-message">{{ errors.age }}</span>
      </div>

      <div class="form-group">
        <label for="message">Сообщение:</label>
        <textarea
          id="message"
          v-model="formData.message"
          @input="handleFieldChange('message', formData.message)"
          rows="3"
          :class="{ error: errors.message }"
          placeholder="Ваше сообщение..."
        ></textarea>
        <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
      </div>

      <div class="form-group checkbox-group">
        <label>
          <input type="checkbox" v-model="formData.subscribe" />
          Подписаться на рассылку
        </label>
      </div>

      <div class="button-group">
        <button type="submit" class="btn-submit">
          📤 Отправить
        </button>
        <button type="button" @click="handleReset" class="btn-reset">
          🔄 Сбросить
        </button>
        <button type="button" @click="handleSyncWithCounter" class="btn-sync" :disabled="!isEventBusReady || counterValue === null">
          🔢 Возраст = Счетчик ({{ counterValue || '?' }})
        </button>
        <button type="button" @click="handleRequestRefresh" class="btn-refresh" :disabled="!isEventBusReady">
          🔄 Обновить все
        </button>
      </div>
    </form>

    <!-- Данные от других микрофронтов -->
    <div class="shared-data">
      <h3>📥 Данные от других микрофронтов:</h3>
      <div class="data-grid">
        <div v-if="counterValue !== null" class="data-item">
          <strong>Счетчик (App 2):</strong>
          <span class="value">{{ counterValue }}</span>
        </div>

        <div v-if="chartData" class="data-item">
          <strong>График (App 1):</strong>
          <div>📊 {{ chartData.label }}: {{ chartData.value }}</div>
        </div>
      </div>
    </div>

    <!-- Лог уведомлений -->
    <div class="notifications-log">
      <h4>📝 Лог событий (последние 10):</h4>
      <div v-if="notifications.length === 0" class="no-notifications">
        Нет событий
      </div>
      <ul v-else>
        <li v-for="(notification, index) in notifications" :key="index">
          {{ notification }}
        </li>
      </ul>
    </div>

    <!-- Информационный блок -->
    <div class="info-box">
      <div class="info-section">
        <h4>📤 Отправляет события:</h4>
        <ul>
          <li><code>form:submitted</code> - отправка формы</li>
          <li><code>form:fieldChanged</code> - изменение поля</li>
          <li><code>form:validationError</code> - ошибки</li>
        </ul>
      </div>
      
      <div class="info-section">
        <h4>📥 Слушает события:</h4>
        <ul>
          <li><code>counter:changed</code> - счетчик</li>
          <li><code>chart:dataSelected</code> - график</li>
          <li><code>data:refresh</code> - обновление</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, onUnmounted } from 'vue';

// EventBus из host через Module Federation
let eventBus: any = null;

const loadEventBus = async () => {
  try {
    // @ts-ignore - Module Federation dynamic import
    const shared = await import('host/shared');
    return shared.eventBus;
  } catch (error) {
    console.warn('[FormComponent] EventBus не доступен');
    return null;
  }
};

interface FormData {
  name: string;
  email: string;
  age: number | null;
  message: string;
  subscribe: boolean;
}

interface Errors {
  name?: string;
  email?: string;
  age?: string;
  message?: string;
}

export default defineComponent({
  name: 'FormComponent',
  setup() {
    const formData = reactive<FormData>({
      name: '',
      email: '',
      age: null,
      message: '',
      subscribe: false,
    });

    const errors = reactive<Errors>({});
    const counterValue = ref<number | null>(null);
    const chartData = ref<any>(null);
    const notifications = ref<string[]>([]);
    const unsubscribeFunctions = ref<Array<() => void>>([]);
    const isEventBusReady = ref(false);

    const addNotification = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      notifications.value = [`[${timestamp}] ${message}`, ...notifications.value.slice(0, 9)];
    };

    const validateForm = (): boolean => {
      const newErrors: Errors = {};

      if (!formData.name.trim()) {
        newErrors.name = 'Имя обязательно';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Минимум 2 символа';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email обязателен';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Неверный формат';
      }

      if (formData.age === null || formData.age < 0) {
        newErrors.age = 'Укажите возраст';
      } else if (formData.age < 18) {
        newErrors.age = 'Должно быть 18+';
      } else if (formData.age > 120) {
        newErrors.age = 'Макс 120';
      }

      if (!formData.message.trim()) {
        newErrors.message = 'Сообщение обязательно';
      }

      Object.assign(errors, newErrors);
      
      // Отправляем ошибки через EventBus
      if (Object.keys(newErrors).length > 0 && eventBus) {
        Object.entries(newErrors).forEach(([field, error]) => {
          eventBus.emit('form:validationError', { fieldName: field, error });
        });
      }

      return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (fieldName: string, value: any) => {
      delete errors[fieldName as keyof Errors];

      if (eventBus) {
        eventBus.emit('form:fieldChanged', { fieldName, value });
      }
    };

    const handleSubmit = () => {
      if (validateForm()) {
        const formDataToSend = { ...formData };
        
        if (eventBus) {
          eventBus.emit('form:submitted', {
            formId: 'vue-form-main',
            data: formDataToSend,
            isValid: true,
          });

          eventBus.emit('notification:show', {
            type: 'success',
            message: 'Форма отправлена!',
          });

          addNotification('📤 Форма отправлена успешно');
        }
      } else {
        addNotification('❌ Форма содержит ошибки');
        
        if (eventBus) {
          eventBus.emit('notification:show', {
            type: 'error',
            message: 'Исправьте ошибки',
          });
        }
      }
    };

    const handleReset = () => {
      formData.name = '';
      formData.email = '';
      formData.age = null;
      formData.message = '';
      formData.subscribe = false;
      Object.keys(errors).forEach(key => delete errors[key as keyof Errors]);

      if (eventBus) {
        eventBus.emit('form:reset');
        addNotification('📤 Форма сброшена');
      }
    };

    const handleSyncWithCounter = () => {
      if (counterValue.value !== null) {
        formData.age = counterValue.value;
        handleFieldChange('age', counterValue.value);
        addNotification(`📥 Возраст = ${counterValue.value} (из счетчика)`);
      }
    };

    const handleRequestRefresh = () => {
      if (eventBus) {
        eventBus.emit('data:refresh', { source: 'vue-app-form' });
        addNotification('📤 Запрос обновления всем');
      }
    };

    onMounted(async () => {
      // Загружаем EventBus
      const bus = await loadEventBus();
      if (bus) {
        eventBus = bus;
        isEventBusReady.value = true;

        eventBus.emit('microfrontend:loaded', {
          name: 'vue-app-form',
          timestamp: Date.now(),
        });

        addNotification('EventBus подключен! 🎉');

        // Подписываемся на события

        // Счетчик
        const unsubCounter = eventBus.on('counter:changed', (data: any) => {
          counterValue.value = data.value;
          addNotification(`📥 Счетчик: ${data.value}`);
        });
        unsubscribeFunctions.value.push(unsubCounter);

        const unsubReset = eventBus.on('counter:reset', () => {
          counterValue.value = 0;
          addNotification('📥 Счетчик сброшен');
        });
        unsubscribeFunctions.value.push(unsubReset);

        // График
        const unsubChart = eventBus.on('chart:dataSelected', (data: any) => {
          chartData.value = data;
          addNotification(`📥 График: ${data.label} = ${data.value}`);
          
          // Авто-заполнение возраста
          if (data.value >= 18 && data.value <= 120) {
            formData.age = data.value;
            handleFieldChange('age', data.value);
            addNotification(`📥 Возраст авто-установлен: ${data.value}`);
          }
        });
        unsubscribeFunctions.value.push(unsubChart);

        const unsubFilter = eventBus.on('chart:filterChanged', (data: any) => {
          addNotification(`📥 Фильтр графика: ${data.filter}`);
        });
        unsubscribeFunctions.value.push(unsubFilter);

        // Обновление данных
        const unsubRefresh = eventBus.on('data:refresh', (data: any) => {
          const source = data.source || 'unknown';
          if (source !== 'vue-app-form') {
            addNotification(`📥 Запрос обновления от ${source}`);
          }
        });
        unsubscribeFunctions.value.push(unsubRefresh);
      }
    });

    onUnmounted(() => {
      unsubscribeFunctions.value.forEach(unsubscribe => unsubscribe());
    });

    return {
      formData,
      errors,
      counterValue,
      chartData,
      notifications,
      isEventBusReady,
      handleSubmit,
      handleReset,
      handleFieldChange,
      handleSyncWithCounter,
      handleRequestRefresh,
    };
  },
});
</script>

<style scoped>
.form-container {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.header-section h2 {
  margin: 0;
  color: #333;
  font-size: 22px;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status.connected {
  background: #e8f5e9;
  color: #2e7d32;
}

.status.disconnected {
  background: #ffebee;
  color: #c62828;
}

.vue-form {
  max-width: 600px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
}

.form-group input.error,
.form-group textarea.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  background: #42b983;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #35a372;
}

.btn-reset {
  background: #ff9800;
  color: white;
}

.btn-reset:hover {
  background: #e68900;
}

.btn-sync {
  background: #2196f3;
  color: white;
}

.btn-sync:hover:not(:disabled) {
  background: #0b7dda;
}

.btn-refresh {
  background: #9c27b0;
  color: white;
}

.btn-refresh:hover:not(:disabled) {
  background: #7b1fa2;
}

.shared-data {
  margin-top: 30px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.shared-data h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.data-grid {
  display: grid;
  gap: 15px;
}

.data-item {
  padding: 12px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #42b983;
}

.data-item strong {
  display: block;
  margin-bottom: 8px;
  color: #42b983;
}

.data-item .value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.notifications-log {
  margin-top: 30px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.notifications-log h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 14px;
}

.notifications-log ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notifications-log li {
  padding: 5px 0;
  font-size: 13px;
  color: #666;
  border-bottom: 1px solid #eee;
}

.notifications-log li:last-child {
  border-bottom: none;
}

.no-notifications {
  color: #999;
  font-style: italic;
  font-size: 13px;
}

.info-box {
  margin-top: 30px;
  padding: 15px;
  background: #e3f2fd;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-section h4 {
  margin: 0 0 10px 0;
  color: #1976d2;
  font-size: 14px;
}

.info-section ul {
  margin: 0;
  padding-left: 20px;
}

.info-section li {
  margin-bottom: 5px;
  font-size: 13px;
  color: #555;
}

.info-section code {
  background: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #d32f2f;
}

@media (max-width: 768px) {
  .info-box {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .button-group button {
    width: 100%;
  }
}
</style>
