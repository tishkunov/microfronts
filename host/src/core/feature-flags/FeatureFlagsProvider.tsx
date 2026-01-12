import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FeatureFlags {
  [key: string]: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isLoading: boolean;
  isEnabled: (flag: string) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  initialFlags?: FeatureFlags;
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({
  children,
  initialFlags = {},
}) => {
  const [flags, setFlags] = useState<FeatureFlags>(initialFlags);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Загрузка feature flags
    // TODO: Загрузка с сервера или из конфига
    const loadFlags = async () => {
      try {
        // const response = await fetch('/api/feature-flags');
        // const data = await response.json();
        // setFlags(data);
        
        // Пока используем initialFlags
        setFlags(initialFlags);
      } catch (error) {
        console.error('[FeatureFlags] Failed to load flags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlags();
  }, [initialFlags]);

  const isEnabled = (flag: string): boolean => {
    return flags[flag] === true;
  };

  const value: FeatureFlagsContextType = {
    flags,
    isLoading,
    isEnabled,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

