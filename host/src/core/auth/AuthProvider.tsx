import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../shared/types';
import { sharedStore } from '../../shared/store';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Подписываемся на изменения user из store
    const unsubscribe = sharedStore.subscribe((state) => {
      setUser(state.user);
    });

    // Инициализация: получаем текущее состояние
    const currentState = sharedStore.getState();
    setUser(currentState.user);
    setIsLoading(false);

    return unsubscribe;
  }, []);

  const login = (userData: User) => {
    sharedStore.setUser(userData);
  };

  const logout = () => {
    sharedStore.setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

