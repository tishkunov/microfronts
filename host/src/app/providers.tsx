import React, { ReactNode } from 'react';
import { AuthProvider } from '../core/auth/AuthProvider';
import { ThemeProvider } from '../context/ThemeContext';
import { LocaleProvider } from '../context/LocaleContext';
import { FeatureFlagsProvider } from '../core/feature-flags/FeatureFlagsProvider';
import { ShellContextProvider } from '../context/ShellContext';
import { initSentry } from '../core/telemetry/sentry.config';
import { analytics } from '../core/telemetry/analytics';
// Инициализируем cartStore при загрузке приложения
import '../shared/cartStore';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Все провайдеры для Shell приложения
 * Инициализирует инфраструктуру (telemetry, feature flags, contexts)
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  // // Инициализация телеметрии
  // React.useEffect(() => {
  //   initSentry({
  //     dsn: process.env.REACT_APP_SENTRY_DSN,
  //     environment: process.env.NODE_ENV,
  //     enabled: process.env.NODE_ENV === 'production',
  //   });

  //   analytics.init({
  //     trackingId: process.env.REACT_APP_GA_TRACKING_ID,
  //     enabled: !!process.env.REACT_APP_GA_TRACKING_ID,
  //   });
  // }, []);

  // Инициализация обработчиков ошибок
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[Shell] Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('online', () => {
      console.log('[Shell] Connection restored');
    });
    window.addEventListener('offline', () => {
      console.log('[Shell] Connection lost');
    });

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <FeatureFlagsProvider initialFlags={{}}>
      <AuthProvider>
        <ThemeProvider>
          <LocaleProvider>
            <ShellContextProvider apiBaseUrl="">
              {children}
            </ShellContextProvider>
          </LocaleProvider>
        </ThemeProvider>
      </AuthProvider>
    </FeatureFlagsProvider>
  );
};

