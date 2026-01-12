import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../core/auth/useAuth';
import { useTheme } from './ThemeContext';
import { useLocale } from './LocaleContext';
import { useFeatureFlags } from '../core/feature-flags/useFeatureFlags';
import { analytics } from '../core/telemetry/analytics';
import { logger } from '../core/telemetry/logger';

/**
 * Shell Context - публичный API для MF
 * Предоставляет только инфраструктурные данные (read-only)
 */
interface ShellContextType {
  // Auth (read-only)
  user: ReturnType<typeof useAuth>['user'];
  isAuthenticated: boolean;
  
  // Theme
  theme: ReturnType<typeof useTheme>['theme'];
  setTheme: ReturnType<typeof useTheme>['setTheme'];
  
  // Locale
  locale: ReturnType<typeof useLocale>['locale'];
  setLocale: ReturnType<typeof useLocale>['setLocale'];
  
  // Feature flags (read-only)
  featureFlags: ReturnType<typeof useFeatureFlags>['flags'];
  isFeatureEnabled: (flag: string) => boolean;
  
  // Analytics functions (не данные!)
  trackEvent: (event: string, data?: any) => void;
  trackError: (error: Error) => void;
  
  // Environment
  environment: 'development' | 'production';
  apiBaseUrl?: string;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

interface ShellContextProviderProps {
  children: ReactNode;
  apiBaseUrl?: string;
}

export const ShellContextProvider: React.FC<ShellContextProviderProps> = ({
  children,
  apiBaseUrl,
}) => {
  const auth = useAuth();
  const theme = useTheme();
  const locale = useLocale();
  const featureFlags = useFeatureFlags();

  const trackEvent = (event: string, data?: any) => {
    analytics.trackEvent(event, data);
  };

  const trackError = (error: Error) => {
    logger.error('Error tracked from MF', error);
  };

  const value: ShellContextType = {
    // Auth (read-only)
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    
    // Theme
    theme: theme.theme,
    setTheme: theme.setTheme,
    
    // Locale
    locale: locale.locale,
    setLocale: locale.setLocale,
    
    // Feature flags (read-only)
    featureFlags: featureFlags.flags,
    isFeatureEnabled: featureFlags.isEnabled,
    
    // Analytics
    trackEvent,
    trackError,
    
    // Environment
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    apiBaseUrl,
  };

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
};

export const useShellContext = (): ShellContextType => {
  const context = useContext(ShellContext);
  if (context === undefined) {
    throw new Error('useShellContext must be used within a ShellContextProvider');
  }
  return context;
};

