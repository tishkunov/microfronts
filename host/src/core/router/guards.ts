import { NavigateFunction } from 'react-router-dom';
import { sharedStore } from '../../shared/store';

/**
 * Проверка аутентификации для route guard
 * Shell проверяет только auth, не бизнес-условия
 */
export const requireAuth = (navigate: NavigateFunction, redirectTo: string = '/login'): boolean => {
  const state = sharedStore.getState();
  
  if (!state.user) {
    navigate(redirectTo);
    return false;
  }
  
  return true;
};

/**
 * Проверка роли для route guard
 * Shell проверяет только роли, не feature-specific permissions
 */
export const requireRole = (
  navigate: NavigateFunction,
  requiredRole: string,
  redirectTo: string = '/forbidden'
): boolean => {
  const state = sharedStore.getState();
  
  if (!state.user || !state.user.roles.includes(requiredRole)) {
    navigate(redirectTo);
    return false;
  }
  
  return true;
};

