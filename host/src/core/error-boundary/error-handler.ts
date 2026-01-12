import React from 'react';

/**
 * Global error handler для Shell
 * Логирует ошибки в телеметрию
 */

export const handleError = (error: Error, errorInfo?: React.ErrorInfo) => {
  // Логируем в консоль (в production будет Sentry)
  console.error('[Shell] Error caught:', error, errorInfo);
  
  // TODO: Отправка в Sentry/DataDog
  // if (window.Sentry) {
  //   window.Sentry.captureException(error, { contexts: { react: errorInfo } });
  // }
};

export const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('[Shell] Unhandled promise rejection:', event.reason);
  
  // TODO: Отправка в Sentry
  // if (window.Sentry) {
  //   window.Sentry.captureException(event.reason);
  // }
  
  // Предотвращаем вывод в консоль браузера
  event.preventDefault();
};

