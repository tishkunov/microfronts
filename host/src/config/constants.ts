/**
 * Infrastructure constants для Shell
 * НЕ содержит бизнес-константы
 */

// Routing
export const ROUTES = {
  HOME: '/',
  CART: '/cart',
  ADMIN: '/admin',
  LOGIN: '/login',
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/404',
} as const;

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Locale
export const DEFAULT_LOCALE = 'ru';
export const SUPPORTED_LOCALES = ['ru', 'en'] as const;

// Feature flags keys (только ключи, значения загружаются динамически)
export const FEATURE_FLAGS = {
  // Примеры (реальные флаги загружаются с сервера)
  NEW_CHECKOUT: 'newCheckout',
  AI_SEARCH: 'aiSearch',
} as const;

