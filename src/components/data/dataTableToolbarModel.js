import { isArray, isFiniteNumber, isString } from '../../utils/typeGuards'

export const EMPTY_ARRAY = Object.freeze([])
export const MAX_PAGE_SIZE_OPTIONS = 20

export function safeString(value, fallback = '') {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

export function normalizeText(value) {
  if (value === null || value === undefined) return ''
  return safeString(value).trim()
}

export function normalizePageSize(value) {
  if (!isFiniteNumber(value) || value <= 0) return null
  return Math.max(1, Math.floor(value))
}

/**
 * Page-size options are deliberately bounded: a hostile or accidentally
 * generated list cannot create an unbounded select. Values are finite,
 * positive integers, sorted, and unique; at most twenty are rendered.
 */
export function normalizePageSizeOptions(options, includeValue) {
  const values = []
  const source = isArray(options) ? options : EMPTY_ARRAY

  source.forEach(value => {
    const normalized = normalizePageSize(value)
    if (normalized !== null) values.push(normalized)
  })

  const included = normalizePageSize(includeValue)
  if (included !== null) values.push(included)

  const unique = Array.from(new Set(values)).sort((left, right) => left - right)
  if (unique.length <= MAX_PAGE_SIZE_OPTIONS) return unique

  const limited = unique.slice(0, MAX_PAGE_SIZE_OPTIONS)
  if (included !== null && !limited.includes(included)) {
    limited[limited.length - 1] = included
    limited.sort((left, right) => left - right)
  }
  return limited
}
