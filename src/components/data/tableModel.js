import { isFiniteNumber, isFunction, isNonEmptyString, isObject, isString } from '../../utils/typeGuards'

export const DEFAULT_ROW_KEY = 'id'
export const EMPTY_ARRAY = Object.freeze([])

export function isDevelopment() {
  return globalThis.process?.env?.NODE_ENV !== 'production'
}

export function safeString(value, fallback = '[valor no convertible]') {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

export function readProperty(target, property) {
  if (target === null || target === undefined) return undefined

  try {
    return target[property]
  } catch {
    return undefined
  }
}

export function isObjectLike(value) {
  return value !== null && (isObject(value) || isFunction(value))
}

export function resolveRowKey(rowKey, row, index) {
  try {
    if (isFunction(rowKey)) return rowKey(row, index)
    if (isString(rowKey) && row != null) return row[rowKey]
  } catch {
    return undefined
  }

  return undefined
}

export function isUsableRowKey(value) {
  return isNonEmptyString(value) || isFiniteNumber(value)
}

/**
 * Encodes every code point so a row identity can safely be used in an HTML id.
 * The type prefix also keeps numeric `1` distinct from string `"1"`.
 */
export function toSafeDomSegment(value) {
  const tag = isString(value) ? 'string' : isFiniteNumber(value) ? 'number' : 'object'
  const source = `${tag}:${safeString(value)}`
  return Array.from(source)
    .map(character => character.codePointAt(0).toString(16))
    .join('-') || 'empty'
}

export function createSafeDomId(prefix, value) {
  const safePrefix = safeString(prefix, 'id')
    .replace(/[^A-Za-z0-9_-]/g, '-')
    .replace(/-+/g, '-') || 'id'
  const normalizedPrefix = /^[A-Za-z]/.test(safePrefix)
    ? safePrefix
    : `id-${safePrefix}`

  return `${normalizedPrefix}-${toSafeDomSegment(value)}`
}

export function fallbackIdentity(rawKey, index) {
  return `__duralux_row_${index}_${toSafeDomSegment(rawKey)}`
}

/**
 * Adds a production-safe identity to every row. Invalid/duplicate identities
 * are still rendered, while validation below explains the contract violation
 * during development.
 */
export function createRowEntries(rows, rowKey) {
  const entries = []
  const seenReactKeys = new Set()
  const occurrences = new Map()

  rows.forEach((row, index) => {
    const rawKey = resolveRowKey(rowKey, row, index)
    const rawKeyTag = isString(rawKey) ? 'string' : isFiniteNumber(rawKey) ? 'number' : 'invalid'
    const rawKeyText = isUsableRowKey(rawKey)
      ? `${rawKeyTag}:${safeString(rawKey)}`
      : `invalid:${index}`
    const occurrence = occurrences.get(rawKeyText) || 0
    occurrences.set(rawKeyText, occurrence + 1)

    const baseIdentity = isUsableRowKey(rawKey) && occurrence === 0
      ? rawKey
      : fallbackIdentity(rawKey, index)
    let identity = baseIdentity
    let reactKey = `duralux-row-${toSafeDomSegment(identity)}`
    let disambiguator = 0

    while (seenReactKeys.has(reactKey)) {
      disambiguator += 1
      identity = `${safeString(baseIdentity)}-${index}-${disambiguator}`
      reactKey = `duralux-row-${toSafeDomSegment(identity)}`
    }

    seenReactKeys.add(reactKey)
    entries.push({ row, index, rawKey, identity, reactKey })
  })

  return entries
}

export function warnOnce(warningsRef, key, message) {
  if (!isDevelopment() || warningsRef.current.has(key)) return
  warningsRef.current.add(key)
  console.warn(`[duralux/ui] ${message}`)
}

/**
 * Dev-only diagnostics for the identity contract. Production keeps rendering
 * with the safe fallback entries produced above instead of throwing.
 */
export function validateRowEntries(entries, componentName, historyRef, warningsRef) {
  if (!isDevelopment()) return

  const seen = new Map()
  entries.forEach(entry => {
    const { row, index, rawKey: value } = entry
    const valueText = safeString(value)

    if (!isUsableRowKey(value)) {
      warnOnce(
        warningsRef,
        `invalid-${index}-${valueText}`,
        `${componentName}: rowKey debe devolver un string no vacío o un número finito; ` +
          `la fila ${index + 1} usará una identidad de fallback.`,
      )
      return
    }

    const previousIndex = seen.get(value)
    if (previousIndex !== undefined) {
      warnOnce(
        warningsRef,
        `duplicate-${valueText}`,
        `${componentName}: clave de fila duplicada ${valueText} en las filas ${previousIndex + 1} y ${index + 1}. ` +
          'Las claves deben ser un valor único entre filas.',
      )
      return
    }
    seen.set(value, index)

    if (!isObjectLike(row)) {
      warnOnce(
        warningsRef,
        `non-object-${index}`,
        `${componentName}: cada elemento de data debe ser un objeto o función; ` +
          `la fila ${index + 1} recibió ${valueText}.`,
      )
      return
    }

    const history = historyRef.current.get(value)
    if (history && history.row !== row && !history.reported) {
      history.reported = true
      warnOnce(
        warningsRef,
        `unstable-${valueText}`,
        `${componentName}: la fila con clave ${valueText} cambió de referencia de objeto. ` +
          'Mantenga referencias estables para evitar renders innecesarios.',
      )
    } else if (!history) {
      historyRef.current.set(value, { row, reported: false })
    }
  })
}
