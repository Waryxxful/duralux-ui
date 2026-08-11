import React, { useEffect, useMemo, useRef } from 'react'

const DEFAULT_ROW_KEY = 'id'
const EMPTY_ARRAY = Object.freeze([])

function isDevelopment() {
  return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
}

function safeString(value, fallback = '[valor no convertible]') {
  try {
    return String(value)
  } catch {
    return fallback
  }
}

function readProperty(target, property) {
  if (target === null || target === undefined) return undefined

  try {
    return target[property]
  } catch {
    return undefined
  }
}

function isObjectLike(value) {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}

export function resolveRowKey(rowKey, row, index) {
  try {
    if (typeof rowKey === 'function') return rowKey(row, index)
    if (typeof rowKey === 'string' && row != null) return row[rowKey]
  } catch {
    // The validation pass reports the invalid identity in development. A
    // missing identity is deliberately safe in production as well.
    return undefined
  }

  return undefined
}

export function isUsableRowKey(value) {
  return (
    (typeof value === 'string' && value.trim().length > 0) ||
    (typeof value === 'number' && Number.isFinite(value))
  )
}

/**
 * Encodes every code point so a row identity can safely be used in an HTML id.
 * The type prefix also keeps numeric `1` distinct from string `"1"`.
 */
export function toSafeDomSegment(value) {
  const source = `${typeof value}:${safeString(value)}`
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

function fallbackIdentity(rawKey, index) {
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
    const rawKeyText = isUsableRowKey(rawKey)
      ? `${typeof rawKey}:${safeString(rawKey)}`
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

function warnOnce(warningsRef, key, message) {
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
    } else {
      const token = `${typeof value}:${safeString(value)}`
      if (seen.has(token)) {
        warnOnce(
          warningsRef,
          `duplicate-${token}`,
          `${componentName}: rowKey debe ser único; las filas ${seen.get(token) + 1} ` +
            `y ${index + 1} comparten "${valueText}".`,
        )
      } else {
        seen.set(token, index)
      }
    }

    if (isObjectLike(row)) {
      const previous = historyRef.current.get(row)
      if (previous && !Object.is(previous.value, value)) {
        warnOnce(
          warningsRef,
          `unstable-${previous.index}-${index}`,
          `${componentName}: rowKey debe ser estable para la misma fila; ` +
            `cambió de "${safeString(previous.value)}" a "${valueText}".`,
        )
      }
      historyRef.current.set(row, { value, index })
    }
  })
}

function normalizeClassName(value) {
  return typeof value === 'string' ? value : ''
}

function columnKey(column) {
  return readProperty(column, 'key')
}

function columnReactKey(column, index) {
  const key = columnKey(column)
  return `duralux-column-${index}-${toSafeDomSegment(key ?? index)}`
}

function columnValue(row, key) {
  if (key === null || key === undefined) return undefined
  return readProperty(row, key)
}

function invokeSlot(slot, fallback, context) {
  return typeof slot === 'function' ? slot(context) : slot ?? fallback
}

function LoadingContent() {
  return (
    <>
      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
      <span role="status" aria-live="polite">Cargando...</span>
    </>
  )
}

export function Table({
  columns = EMPTY_ARRAY,
  rows = EMPTY_ARRAY,
  rowKey = DEFAULT_ROW_KEY,
  emptyMessage = 'Sin registros.',
  loading = false,
  caption,
  ariaLabel,
  className,
  // Duralux uses table-hover as the canonical table treatment.
  striped: _striped = false,
  hover = true,
  responsive = true,
  wrapperClassName,
  head,
  body,
  header,
  renderHeader,
  renderBody,
  children,
  'aria-label': ariaLabelProp,
  'aria-labelledby': ariaLabelledBy,
  'aria-busy': ariaBusy,
  ...tableProps
}) {
  void _striped

  const normalizedColumns = Array.isArray(columns) ? columns : EMPTY_ARRAY
  const normalizedRows = Array.isArray(rows) ? rows : EMPTY_ARRAY
  const rowKeyHistoryRef = useRef(new WeakMap())
  const warningsRef = useRef(new Set())
  const rowEntries = useMemo(
    () => createRowEntries(normalizedRows, rowKey),
    [normalizedRows, rowKey],
  )

  useEffect(() => {
    validateRowEntries(
      rowEntries,
      'Table',
      rowKeyHistoryRef,
      warningsRef,
    )
  }, [rowEntries])

  const tableCls = [
    'table',
    hover ? 'table-hover' : '',
    normalizeClassName(className),
  ]
    .filter(Boolean)
    .join(' ')
  const emptyColSpan = Math.max(normalizedColumns.length, 1)
  const slotContext = useMemo(() => ({
    columns: normalizedColumns,
    rows: normalizedRows,
    rowEntries,
    loading,
    emptyMessage,
  }), [emptyMessage, loading, normalizedColumns, normalizedRows, rowEntries])

  const headerSlot = head !== undefined
    ? head
    : header !== undefined
      ? header
      : renderHeader
  const bodySlot = body !== undefined
    ? body
    : renderBody
  const hasChildren = children !== undefined

  const defaultHeader = useMemo(() => {
    if (hasChildren || headerSlot !== undefined) return null

    return (
      <tr>
        {normalizedColumns.map((column, columnIndex) => {
          const headerValue = readProperty(column, 'header') ?? readProperty(column, 'label')
          const headerClassName = normalizeClassName(readProperty(column, 'headerClassName'))
          const width = readProperty(column, 'width')
          const safeWidth = typeof width === 'number'
            ? (Number.isFinite(width) ? width : undefined)
            : typeof width === 'string'
              ? width
              : undefined

          return (
            <th
              key={columnReactKey(column, columnIndex)}
              scope="col"
              className={headerClassName || undefined}
              style={safeWidth !== undefined ? { width: safeWidth } : undefined}
            >
              {headerValue}
            </th>
          )
        })}
      </tr>
    )
  }, [hasChildren, headerSlot, normalizedColumns])

  const defaultBody = useMemo(() => {
    if (hasChildren || bodySlot !== undefined) return null
    if (loading) {
      return (
        <tr>
          <td colSpan={emptyColSpan} className="text-center py-3">
            <LoadingContent />
          </td>
        </tr>
      )
    }
    if (normalizedRows.length === 0) {
      return (
        <tr>
          <td colSpan={emptyColSpan} className="text-center py-3 text-muted">
            {emptyMessage}
          </td>
        </tr>
      )
    }

    return rowEntries.map(entry => (
      <tr key={entry.reactKey}>
        {normalizedColumns.map((column, columnIndex) => {
          const key = columnKey(column)
          const render = readProperty(column, 'render')
          const cellClassName = normalizeClassName(readProperty(column, 'cellClassName'))

          return (
            <td
              key={columnReactKey(column, columnIndex)}
              className={cellClassName || undefined}
            >
              {typeof render === 'function'
                ? render(entry.row, entry.index)
                : columnValue(entry.row, key)}
            </td>
          )
        })}
      </tr>
    ))
  }, [
    bodySlot,
    emptyColSpan,
    emptyMessage,
    hasChildren,
    loading,
    normalizedColumns,
    normalizedRows.length,
    rowEntries,
  ])

  const content = children !== undefined ? invokeSlot(children, null, slotContext) : (
    <>
      <thead>{invokeSlot(headerSlot, defaultHeader, slotContext)}</thead>
      <tbody>{invokeSlot(bodySlot, defaultBody, slotContext)}</tbody>
    </>
  )

  const table = (
    <table
      {...tableProps}
      className={tableCls}
      aria-label={ariaLabelProp ?? ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-busy={loading ? 'true' : ariaBusy}
    >
      {caption !== undefined && caption !== null ? <caption>{caption}</caption> : null}
      {content}
    </table>
  )

  // Table owns the responsive surface. `responsive={false}` is the explicit
  // escape hatch for callers that provide their own overflow container.
  return responsive ? (
    <div className={['table-responsive', normalizeClassName(wrapperClassName)]
      .filter(Boolean)
      .join(' ')}>
      {table}
    </div>
  ) : table
}
