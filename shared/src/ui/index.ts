/**
 * @package @microfrontends/shared/ui
 * @description Переиспользуемые UI компоненты
 * 
 * ⚠️ АРХИТЕКТУРНЫЕ ПРАВИЛА:
 * 
 * ✅ МОЖНО:
 * - Презентационные компоненты
 * - Controlled components
 * - Pure UI логика
 * - Типизированные props
 * 
 * ❌ НЕЛЬЗЯ:
 * - Глобальное состояние (Redux, Zustand и т.д.)
 * - API вызовы
 * - localStorage/sessionStorage
 * - Бизнес-логика
 * - Side effects (кроме useState, useEffect для UI)
 * 
 * 💡 ВЛАДЕЛЕЦ: Design System Team
 */

export * from './Button';
export * from './Input';


