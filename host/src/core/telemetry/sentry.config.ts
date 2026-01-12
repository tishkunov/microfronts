/**
 * Sentry configuration для Shell
 * Инициализируется один раз при старте приложения
 */

interface SentryConfig {
  dsn?: string;
  environment?: string;
  enabled: boolean;
}

export const initSentry = (config: SentryConfig) => {
  if (!config.enabled || !config.dsn) {
    return;
  }

  // TODO: Инициализация Sentry
  // import * as Sentry from '@sentry/react';
  // 
  // Sentry.init({
  //   dsn: config.dsn,
  //   environment: config.environment || 'development',
  //   integrations: [
  //     new Sentry.BrowserTracing(),
  //     new Sentry.Replay(),
  //   ],
  //   tracesSampleRate: 1.0,
  //   replaysSessionSampleRate: 0.1,
  //   replaysOnErrorSampleRate: 1.0,
  // });

  console.log('[Sentry] Initialized (mock)');
};

