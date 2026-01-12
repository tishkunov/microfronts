/**
 * @package @microfrontends/shared/config
 * @description Конфигурация приложения
 * 
 * ⚠️ ПРАВИЛА:
 * - Только константы конфигурации
 * - Можно использовать process.env
 * - Никакого состояния
 * - Никаких side effects
 * 
 * 💡 ВЛАДЕЛЕЦ: DevOps / Infrastructure Team
 */

// ============================================================================
// ENVIRONMENT
// ============================================================================

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// ============================================================================
// API CONFIG
// ============================================================================

export const apiConfig = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
  retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3', 10),
} as const;

// ============================================================================
// MICROFRONTENDS URLS
// ============================================================================

export const microfrontendUrls = {
  host: process.env.HOST_URL || 'http://localhost:3000',
  reactApp1: process.env.REACT_APP1_URL || 'http://localhost:3001',
  reactApp2: process.env.REACT_APP2_URL || 'http://localhost:3002',
  vueApp: process.env.VUE_APP_URL || 'http://localhost:3003',
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const featureFlags = {
  enableDarkMode: process.env.ENABLE_DARK_MODE === 'true',
  enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false', // Default true
  enableBetaFeatures: process.env.ENABLE_BETA_FEATURES === 'true',
} as const;

// ============================================================================
// LOGGING
// ============================================================================

export const loggingConfig = {
  enabled: !isProduction || process.env.ENABLE_LOGGING === 'true',
  level: process.env.LOG_LEVEL || 'info', // 'debug' | 'info' | 'warn' | 'error'
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Получить значение env переменной с fallback
 */
export const getEnv = (key: string, fallback: string = ''): string => {
  return process.env[key] || fallback;
};

/**
 * Проверить включен ли feature flag
 */
export const isFeatureEnabled = (feature: keyof typeof featureFlags): boolean => {
  return featureFlags[feature];
};


