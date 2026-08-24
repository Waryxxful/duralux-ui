import React, { useEffect, useMemo, useRef } from 'react'
import {
  createRowEntries,
  DEFAULT_ROW_KEY,
  EMPTY_ARRAY,
  readProperty,
  toSafeDomSegment,
  validateRowEntries,
} from './tableModel'
import { isArray, isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'

function normalizeClassName(value) {
  return isString(value) ? value : ''
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
  return isFunction(slot) ? slot(context) : slot ?? fallback
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
  // Duralux uses table-hover as the canonical table treatment. Consume the
  // old JS-only prop without forwarding an invalid attribute to <table>.
  striped: _striped = undefined,
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
  const normalizedColumns = isArray(columns) ? columns : EMPTY_ARRAY
  const normalizedRows = isArray(rows) ? rows : EMPTY_ARRAY
  const rowKeyHistoryRef = useRef(new Map())
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
          const safeWidth = isFiniteNumber(width)
            ? width
            : isString(width)
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
              {isFunction(render)
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
