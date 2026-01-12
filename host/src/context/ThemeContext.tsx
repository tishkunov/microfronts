import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sharedStore } from '../shared/store';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Подписываемся на изменения theme из store
    const unsubscribe = sharedStore.subscribe((state) => {
      setThemeState(state.theme);
    });

    // Инициализация
    const currentState = sharedStore.getState();
    setThemeState(currentState.theme);

    return unsubscribe;
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    sharedStore.setTheme(newTheme);
  };

  const toggleTheme = () => {
    sharedStore.toggleTheme();
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

