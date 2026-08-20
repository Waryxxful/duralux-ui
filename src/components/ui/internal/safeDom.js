import { isBoolean, isFiniteNumber, isString } from '../../../utils/typeGuards'

function safeString(value, fallback = '') {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

/**
 * Turns a value into an HTML-id/key segment without URI encoding. Encoding
 * code points also makes lone UTF-16 surrogates harmless and preserves the
 * distinction between numeric and string keys.
 */
export function toSafeDomSegment(value) {
  const tag = isString(value) ? 'string' : isFiniteNumber(value) ? 'number' : isBoolean(value) ? 'boolean' : 'object'
  const source = `${tag}:${safeString(value)}`
  return Array.from(source)
    .map((character) => character.codePointAt(0).toString(16))
    .join('-') || 'empty'
}

export function safeRead(target, property, fallback) {
  try {
    return target == null ? fallback : target[property]
  } catch {
    return fallback
  }
}
