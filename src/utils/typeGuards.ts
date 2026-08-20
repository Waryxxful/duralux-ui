/**
 * Strict domain type guards for Duralux UI.
 * Pure predicate functions for narrowing and boundary validation.
 */

export function isString<T>(value: T): value is T & string {
  return typeof value === 'string';
}

export function isNonEmptyString<T>(value: T): value is T & string {
  return typeof value === 'string' && value.trim() !== '';
}

export function isNumber<T>(value: T): value is T & number {
  return typeof value === 'number';
}

export function isFiniteNumber<T>(value: T): value is T & number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isBoolean<T>(value: T): value is T & boolean {
  return typeof value === 'boolean';
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction<T, F extends Function = (...args: never[]) => any>(value: T): value is T & F {
  return typeof value === 'function';
}

export function isObject<T>(value: T): value is T & object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray<T, E = any>(value: T): value is T & E[] {
  return Array.isArray(value);
}

export function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== false;
}
