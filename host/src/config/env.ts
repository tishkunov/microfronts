/**
 * Environment configuration для Shell
 * Только инфраструктурные переменные
 */

export const env = {
  // API
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || '',
  
  // Environment
  environment: (process.env.NODE_ENV || 'development') as 'development' | 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Telemetry
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  gaTrackingId: process.env.REACT_APP_GA_TRACKING_ID,
  
  // Microfrontends URLs
  reactApp1Url: process.env.REACT_APP_REACT_APP1_URL || 'http://localhost:3001/remoteEntry.js',
  reactApp2Url: process.env.REACT_APP_REACT_APP2_URL || 'http://localhost:3002/remoteEntry.js',
  vueAppUrl: process.env.REACT_APP_VUE_APP_URL || 'http://localhost:3003/remoteEntry.js',
} as const;

