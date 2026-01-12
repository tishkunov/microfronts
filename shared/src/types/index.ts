/**
 * @package @microfrontends/shared/types
 * @description Общие типы для всех микрофронтов
 * 
 * ⚠️ ПРАВИЛА:
 * - Только типы и интерфейсы (никакого runtime кода)
 * - Никакого состояния
 * - Никаких side effects
 * - Никакой бизнес-логики
 */

// ============================================================================
// EVENT BUS TYPES
// ============================================================================

/**
 * Карта всех событий EventBus
 * Каждое событие должно иметь четкий тип payload
 */
export interface EventMap {
  // График
  'chart:dataSelected': ChartDataSelected;
  'chart:filterChanged': ChartFilterChanged;
  
  // Счетчик
  'counter:changed': CounterChanged;
  'counter:reset': void;
  'counter:increment': CounterCommand;
  'counter:decrement': CounterCommand;
  
  // Форма
  'form:submitted': FormSubmitted;
  'form:fieldChanged': FormFieldChanged;
  'form:validationError': FormValidationError;
  'form:reset': void;

  // Глобальные события
  'data:refresh': DataRefresh;
  'notification:show': NotificationPayload;
  'notification:clear': void;
  'microfrontend:loaded': MicrofrontendLoaded;
  'microfrontend:error': MicrofrontendError;
  
  // Навигация
  'navigation:change': NavigationChange;
  
  // Тема
  'theme:change': ThemeChange;
}

// ============================================================================
// PAYLOAD TYPES
// ============================================================================

export interface ChartDataSelected {
  chartId: string;
  value: number;
  label: string;
  timestamp: number;
}

export interface ChartFilterChanged {
  filter: string;
  range?: {
    from: number;
    to: number;
  };
}

export interface CounterChanged {
  value: number;
  source: string;
}

export interface CounterCommand {
  step?: number;
}

export interface FormSubmitted<T = Record<string, any>> {
  formId: string;
  data: T;
  isValid: boolean;
}

export interface FormFieldChanged {
  fieldName: string;
  value: any;
}

export interface FormValidationError {
  fieldName: string;
  error: string;
}

export interface DataRefresh {
  source?: string;
}

export interface NotificationPayload {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface MicrofrontendLoaded {
  name: string;
  timestamp: number;
}

export interface MicrofrontendError {
  name: string;
  error: string;
}

export interface NavigationChange {
  path: string;
  params?: Record<string, string>;
}

export interface ThemeChange {
  theme: 'light' | 'dark';
}

// ============================================================================
// COMMON TYPES
// ============================================================================

/**
 * Базовый тип для компонента
 */
export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Статус загрузки
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Результат операции
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Пагинация
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Опции сортировки
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// USER & AUTH TYPES (примеры для расширения)
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: UserRole;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token?: string;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormField<T = any> {
  name: string;
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Делает все поля опциональными, включая вложенные
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Делает все поля readonly, включая вложенные
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Извлекает тип Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Извлекает типы функции
 */
export type FunctionParams<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;
export type FunctionReturn<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never;


