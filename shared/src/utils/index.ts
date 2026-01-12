/**
 * @package @microfrontends/shared/utils
 * @description Pure функции без состояния
 * 
 * ⚠️ ПРАВИЛА:
 * - Только pure функции
 * - Никакого состояния
 * - Никаких side effects
 * - Детерминированные (одинаковый input → одинаковый output)
 * - Без DOM манипуляций
 * - Без API вызовов
 * 
 * ✅ МОЖНО:
 * - Форматирование данных
 * - Валидация
 * - Математические операции
 * - Работа со строками
 * - Работа с массивами/объектами
 * 
 * ❌ НЕЛЬЗЯ:
 * - localStorage/sessionStorage
 * - fetch/axios
 * - setTimeout/setInterval
 * - console.log (только в dev mode)
 * - window/document манипуляции
 */

export * from './validation';
export * from './formatters';
export * from './helpers';
export * from './type-guards';


