/**
 * ESLint конфигурация для @microfrontends/shared
 * 
 * ЦЕЛЬ: Предотвратить архитектурные ошибки
 * - Никакого глобального состояния
 * - Никаких side effects в утилитах
 * - Никакой бизнес-логики
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // ========================================================================
    // ЗАПРЕТЫ ДЛЯ ПРЕДОТВРАЩЕНИЯ SHARED STATE
    // ========================================================================

    // Запретить глобальные переменные (кроме разрешенных)
    'no-restricted-globals': [
      'error',
      {
        name: 'event',
        message: 'Use local parameter instead.',
      },
    ],

    // Запретить определенные импорты
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/node_modules/**'],
            message: 'Direct node_modules imports are not allowed.',
          },
        ],
        paths: [
          {
            name: 'redux',
            message: 'Redux не должен использоваться в shared библиотеке!',
          },
          {
            name: 'zustand',
            message: 'Zustand не должен использоваться в shared библиотеке!',
          },
          {
            name: 'mobx',
            message: 'MobX не должен использоваться в shared библиотеке!',
          },
          {
            name: 'axios',
            message: 'API вызовы не должны быть в shared библиотеке!',
          },
          {
            name: 'react-query',
            message: 'React Query не должен использоваться в shared библиотеке!',
          },
        ],
      },
    ],

    // ========================================================================
    // TYPESCRIPT
    // ========================================================================

    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // ========================================================================
    // REACT
    // ========================================================================

    'react/react-in-jsx-scope': 'off', // React 17+
    'react/prop-types': 'off', // TypeScript handles this
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ========================================================================
    // GENERAL
    // ========================================================================

    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};


