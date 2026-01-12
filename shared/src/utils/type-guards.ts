/**
 * @package @microfrontends/shared/utils/type-guards
 * @description Type guards для проверки типов в runtime
 */

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isNull = (value: unknown): value is null => {
  return value === null;
};

export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

export const isNullish = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

// ============================================================================
// COMPLEX TYPES
// ============================================================================

export const isObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = <T = any>(value: unknown): value is T[] => {
  return Array.isArray(value);
};

export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function';
};

export const isPromise = <T = any>(value: unknown): value is Promise<T> => {
  return value instanceof Promise;
};

export const isDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

// ============================================================================
// EMPTY CHECKS
// ============================================================================

export const isEmpty = (value: unknown): boolean => {
  if (isNullish(value)) return true;
  if (isString(value)) return value.trim().length === 0;
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

export const isNotEmpty = (value: unknown): boolean => {
  return !isEmpty(value);
};

// ============================================================================
// SPECIFIC CHECKS
// ============================================================================

export const isEmail = (value: unknown): value is string => {
  return isString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isUrl = (value: unknown): value is string => {
  return isString(value) && /^https?:\/\/.+$/.test(value);
};

export const isUUID = (value: unknown): value is string => {
  return isString(value) && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

// ============================================================================
// HAS PROPERTY
// ============================================================================

export const hasProperty = <T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> => {
  return isObject(obj) && prop in obj;
};

export const hasProperties = <T extends string[]>(
  obj: unknown,
  ...props: T
): obj is Record<T[number], unknown> => {
  return isObject(obj) && props.every(prop => prop in obj);
};

// ============================================================================
// TYPE ASSERTIONS
// ============================================================================

export const assertIsDefined = <T>(value: T): asserts value is NonNullable<T> => {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined');
  }
};

export const assertIsString = (value: unknown): asserts value is string => {
  if (!isString(value)) {
    throw new Error('Value is not a string');
  }
};

export const assertIsNumber = (value: unknown): asserts value is number => {
  if (!isNumber(value)) {
    throw new Error('Value is not a number');
  }
};


