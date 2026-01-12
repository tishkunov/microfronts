import { MicrofrontendMetadata } from './mf-registry';

/**
 * Конфигурация микрофронтов
 * Shell знает только URL и entry points, не детали реализации
 */
export const microfrontendConfig: MicrofrontendMetadata[] = [
  {
    name: 'react_app1',
    url: process.env.REACT_APP_REACT_APP1_URL || 'http://localhost:3001/remoteEntry.js',
    entryPoint: 'CatalogApp',
  },
  {
    name: 'react_app2',
    url: process.env.REACT_APP_REACT_APP2_URL || 'http://localhost:3002/remoteEntry.js',
    entryPoint: 'CartApp',
  },
  {
    name: 'vue_app',
    url: process.env.REACT_APP_VUE_APP_URL || 'http://localhost:3003/remoteEntry.js',
    entryPoint: 'AdminApp',
  },
];

/**
 * Проверка совместимости версий MF
 */
export const isCompatibleVersion = (
  mfVersion: string | undefined,
  requiredVersion: string | undefined
): boolean => {
  if (!mfVersion || !requiredVersion) {
    return true; // Если версии не указаны, считаем совместимыми
  }
  
  // Простая проверка (можно улучшить с semver)
  return mfVersion === requiredVersion;
};

