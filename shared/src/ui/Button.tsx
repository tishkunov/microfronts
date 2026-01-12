/**
 * @package @microfrontends/shared/ui
 * @description Переиспользуемая кнопка
 * 
 * ⚠️ ПРАВИЛА ДЛЯ UI КОМПОНЕНТОВ:
 * - Должны быть stateless (управляемые компоненты)
 * - Никакого глобального состояния
 * - Никаких side effects (API, localStorage и т.д.)
 * - Только UI логика
 * - Все props должны быть типизированы
 */

import React from 'react';
import { classNames } from '../utils/helpers';
import { Colors } from '../constants/design-tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Вариант отображения кнопки
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  
  /**
   * Размер кнопки
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Кнопка на всю ширину
   */
  fullWidth?: boolean;
  
  /**
   * Состояние загрузки
   */
  loading?: boolean;
  
  /**
   * Иконка слева
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Иконка справа
   */
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '14px' },
    md: { padding: '10px 20px', fontSize: '16px' },
    lg: { padding: '14px 28px', fontSize: '18px' },
  };

  const variantStyles = {
    primary: {
      backgroundColor: Colors.primary[500],
      color: Colors.white,
    },
    secondary: {
      backgroundColor: Colors.secondary[500],
      color: Colors.white,
    },
    success: {
      backgroundColor: Colors.success[500],
      color: Colors.white,
    },
    warning: {
      backgroundColor: Colors.warning[500],
      color: Colors.white,
    },
    error: {
      backgroundColor: Colors.error[500],
      color: Colors.white,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: Colors.primary[500],
      border: `2px solid ${Colors.primary[500]}`,
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };

  return (
    <button
      style={combinedStyles}
      className={classNames('shared-button', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span>⏳</span>}
      {!loading && leftIcon && <span>{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};


