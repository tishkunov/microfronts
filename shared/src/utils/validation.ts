/**
 * @package @microfrontends/shared/utils/validation
 * @description Pure функции для валидации
 */

import { ValidationPatterns, ValidationLimits } from '../constants';

// ============================================================================
// EMAIL
// ============================================================================

export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return ValidationPatterns.EMAIL.test(email.trim());
};

// ============================================================================
// PASSWORD
// ============================================================================

export const isValidPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  const length = password.length;
  return length >= ValidationLimits.MIN_PASSWORD_LENGTH && 
         length <= ValidationLimits.MAX_PASSWORD_LENGTH;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password) return 'weak';
  
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const length = password.length;

  const score = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, length >= 12]
    .filter(Boolean).length;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

// ============================================================================
// USERNAME
// ============================================================================

export const isValidUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') return false;
  const length = username.length;
  return length >= ValidationLimits.MIN_USERNAME_LENGTH && 
         length <= ValidationLimits.MAX_USERNAME_LENGTH;
};

// ============================================================================
// AGE
// ============================================================================

export const isValidAge = (age: number): boolean => {
  if (typeof age !== 'number' || isNaN(age)) return false;
  return age >= ValidationLimits.MIN_AGE && age <= ValidationLimits.MAX_AGE;
};

// ============================================================================
// URL
// ============================================================================

export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return ValidationPatterns.URL.test(url);
};

// ============================================================================
// PHONE
// ============================================================================

export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  return ValidationPatterns.PHONE.test(phone);
};

// ============================================================================
// GENERIC
// ============================================================================

export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const minLength = (value: string, min: number): boolean => {
  return typeof value === 'string' && value.length >= min;
};

export const maxLength = (value: string, max: number): boolean => {
  return typeof value === 'string' && value.length <= max;
};

export const matchesPattern = (value: string, pattern: RegExp): boolean => {
  return typeof value === 'string' && pattern.test(value);
};

// ============================================================================
// FORM VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateField = (
  value: any,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  }
): string | null => {
  if (rules.required && !isRequired(value)) {
    return 'Это поле обязательно';
  }

  if (value && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Минимальная длина: ${rules.minLength} символов`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Максимальная длина: ${rules.maxLength} символов`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Неверный формат';
    }
  }

  if (rules.custom) {
    const result = rules.custom(value);
    if (typeof result === 'string') return result;
    if (result === false) return 'Неверное значение';
  }

  return null;
};


