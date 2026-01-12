import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = string;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({
  children,
  defaultLocale = 'ru',
}) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Сохраняем в localStorage
    localStorage.setItem('locale', newLocale);
  };

  useEffect(() => {
    // Загружаем из localStorage при инициализации
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      setLocaleState(savedLocale);
    }
  }, []);

  const value: LocaleContextType = {
    locale,
    setLocale,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

