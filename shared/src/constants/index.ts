/**
 * @package @microfrontends/shared/constants
 * @description Общие константы приложения
 * 
 * ⚠️ ПРАВИЛА:
 * - Только неизменяемые значения
 * - Никакого состояния
 * - Никаких вычислений
 */

export * from './design-tokens';

// ============================================================================
// APP CONSTANTS
// ============================================================================

export const APP_NAME = 'Microfrontends Application';
export const APP_VERSION = '1.0.0';

// ============================================================================
// MICROFRONTEND NAMES
// ============================================================================

export const MicrofrontendNames = {
  HOST: 'host',
  CHART: 'react-app1-chart',
  COUNTER: 'react-app2-counter',
  FORM: 'vue-app-form',
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const Routes = {
  HOME: '/',
  CHART: '/chart',
  COUNTER: '/counter',
  FORM: '/form',
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const StorageKeys = {
  THEME: 'app-theme',
  LANGUAGE: 'app-language',
  USER_PREFERENCES: 'user-preferences',
} as const;

// ============================================================================
// EVENT BUS CONSTANTS
// ============================================================================

export const EventPrefixes = {
  CHART: 'chart:',
  COUNTER: 'counter:',
  FORM: 'form:',
  NOTIFICATION: 'notification:',
  MICROFRONTEND: 'microfrontend:',
  DATA: 'data:',
  NAVIGATION: 'navigation:',
  THEME: 'theme:',
} as const;

// ============================================================================
// API CONSTANTS
// ============================================================================

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
export const API_TIMEOUT = 30000; // 30 seconds

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ============================================================================
// VALIDATION
// ============================================================================

export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+$/,
  NUMBER: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;

export const ValidationLimits = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MIN_AGE: 18,
  MAX_AGE: 120,
} as const;

// ============================================================================
// DATE & TIME
// ============================================================================

export const DateFormats = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

export const TimeZones = {
  UTC: 'UTC',
  MOSCOW: 'Europe/Moscow',
  NEW_YORK: 'America/New_York',
  LONDON: 'Europe/London',
} as const;

// ============================================================================
// FEATURE FLAGS (примеры)
// ============================================================================

export const FeatureFlags = {
  ENABLE_DARK_MODE: true,
  ENABLE_ANALYTICS: false,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_BETA_FEATURES: false,
} as const;

// ============================================================================
// TIMEOUTS & DELAYS
// ============================================================================

export const Timeouts = {
  DEBOUNCE: 300,
  THROTTLE: 100,
  NOTIFICATION: 3000,
  TOOLTIP: 200,
} as const;


