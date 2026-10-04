import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import {
  createRowEntries,
  DEFAULT_ROW_KEY,
  EMPTY_ARRAY,
  readProperty,
  toSafeDomSegment,
  validateRowEntries,
} from './tableModel'
import { EmptyState } from '../feedback/EmptyState'
import { cx } from '../../utils/cx'
import { deprecate, log } from '../../utils/log'
import { isArray, isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'
import type { TableColumn, TableProps, TableRowEntry, TableSlot, TableSlotContext } from '../../public/types'

const DEFAULT_LOADING_ROWS = 5
const MAX_LOADING_ROWS = 20
// Anchos del skeleton por columna: variados para que la carga no parezca una grilla rígida.
const SKELETON_WIDTHS = ['72%', '48%', '60%', '36%', '54%']

function normalizeClassName(value: unknown): string {
  return isString(value) ? value : ''
}

function columnKey(column: unknown) {
  return readProperty(column, 'key')
}

function columnReactKey(column: unknown, index: number) {
  const key = columnKey(column)
  return `duralux-column-${index}-${toSafeDomSegment(key ?? index)}`
}

function columnValue(row: unknown, key: unknown) {
  if (key === null || key === undefined) return undefined
  return readProperty(row, key)
}

function isNumericColumn(column: unknown) {
  return readProperty(column, 'numeric') === true
}

function invokeSlot<T>(slot: TableSlot<T> | undefined, fallback: React.ReactNode, context: TableSlotContext<T>) {
  return isFunction(slot) ? slot(context) : slot ?? fallback
}

function normalizeLoadingRows(value: unknown) {
  if (!isFiniteNumber(value)) return DEFAULT_LOADING_ROWS
  return Math.min(Math.max(1, Math.floor(value)), MAX_LOADING_ROWS)
}

function cssLength(value: unknown): string | undefined {
  if (isFiniteNumber(value)) return `${value}px`
  return isString(value) && value.trim() ? value : undefined
}

interface LoadingBodyProps {
  columns: ReadonlyArray<unknown>
  colSpan: number
  rows: number
}

/** Carga: un estado anunciado (sin altura) y un skeleton por fila con la forma de las columnas. */
function LoadingBody({ columns, colSpan, rows }: LoadingBodyProps) {
  const cells = columns.length > 0 ? columns : [null]
  return (
    <>
      <tr className="gcu-table__status-row">
        <td colSpan={colSpan}>
          <span role="status" aria-live="polite" className="visually-hidden">Cargando...</span>
        </td>
      </tr>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`} className="gcu-table__skeleton-row" aria-hidden="true">
          {cells.map((column, columnIndex) => (
            <td key={columnReactKey(column, columnIndex)} className={isNumericColumn(column) ? 'text-end' : undefined}>
              <span
                className="gcu-skeleton gcu-skeleton--text gcu-table__skeleton"
                style={{ width: SKELETON_WIDTHS[(rowIndex + columnIndex) % SKELETON_WIDTHS.length] }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/**
 * Table — tabla canónica Duralux (`.table-responsive > table.table.table-hover`) con columnas
 * declarativas o slots `head` / `body` / `children`.
 *
 * - columns[].numeric: alinea a la derecha con números tabulares (encabezado y celdas).
 * - density: `compact` (40 px) o `comfortable` (56 px); sin valor, 48 px.
 * - loading: skeleton por fila (`loadingRows`) y `aria-busy`; vacío: EmptyState o `emptyState`.
 * - stickyHeader: encabezado fijo dentro del contenedor (alto `maxHeight`), con sombra solo al hacer scroll.
 * - responsive: el contenedor desplaza en horizontal dentro de sí; `false` si quien llama ya tiene uno.
 */
const TableBase = forwardRef<HTMLTableElement, TableProps<unknown>>(function Table({
  columns = EMPTY_ARRAY,
  rows = EMPTY_ARRAY,
  rowKey = DEFAULT_ROW_KEY,
  emptyMessage = 'Sin registros.',
  emptyState,
  loading = false,
  loadingRows,
  caption,
  ariaLabel,
  className,
  striped,
  hover = true,
  responsive = true,
  wrapperClassName,
  density,
  stickyHeader = false,
  maxHeight,
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
}, ref) {
  // Duralux usa table-hover como tratamiento canónico: `striped` se consume sin llegar al DOM.
  if (striped !== undefined) deprecate('table-striped', 'la prop `striped` de Table se ignora; las tablas Duralux usan solo `table-hover`.')
  if (header !== undefined) deprecate('table-header', 'la prop `header` de Table se renombró a `head`.')
  if (renderHeader !== undefined) deprecate('table-render-header', 'la prop `renderHeader` de Table se renombró a `head`.')
  if (renderBody !== undefined) deprecate('table-render-body', 'la prop `renderBody` de Table se renombró a `body`.')
  if (ariaLabel !== undefined) deprecate('table-arialabel', 'la prop `ariaLabel` de Table se renombró a `aria-label`.')

  const normalizedColumns: ReadonlyArray<TableColumn<unknown>> = isArray(columns) ? columns : EMPTY_ARRAY
  const normalizedRows: ReadonlyArray<unknown> = isArray(rows) ? rows : EMPTY_ARRAY
  const rowKeyHistoryRef = useRef(new Map())
  const warningsRef = useRef(new Set())
  const [scrolled, setScrolled] = useState(false)
  const rowEntries: ReadonlyArray<TableRowEntry<unknown>> = useMemo(
    () => createRowEntries(normalizedRows, rowKey),
    [normalizedRows, rowKey],
  )

  useEffect(() => {
    validateRowEntries(rowEntries, 'Table', rowKeyHistoryRef, warningsRef)
  }, [rowEntries])

  const hasStickyContainer = stickyHeader && responsive
  useEffect(() => {
    if (stickyHeader && !responsive) {
      log.warn('Table: `stickyHeader` necesita el contenedor propio de la tabla; con responsive={false} el encabezado no se fija.')
    }
  }, [responsive, stickyHeader])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrolled(event.currentTarget.scrollTop > 0)
  }, [])

  const tableCls = cx(
    'table',
    'gcu-table',
    hover && 'table-hover',
    density === 'compact' && 'gcu-table--compact',
    density === 'comfortable' && 'gcu-table--comfortable',
    normalizeClassName(className),
  )
  const emptyColSpan = Math.max(normalizedColumns.length, 1)
  const slotContext: TableSlotContext<unknown> = useMemo(() => ({
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
  const bodySlot = body !== undefined ? body : renderBody
  const hasChildren = children !== undefined

  const defaultHeader = useMemo(() => {
    if (hasChildren || headerSlot !== undefined) return null

    return (
      <tr>
        {normalizedColumns.map((column, columnIndex) => {
          const headerValue = readProperty(column, 'header') ?? readProperty(column, 'label')
          const headerClassName = normalizeClassName(readProperty(column, 'headerClassName'))
          const width = readProperty(column, 'width')
          const safeWidth = isFiniteNumber(width) || isString(width) ? width : undefined

          return (
            <th
              key={columnReactKey(column, columnIndex)}
              scope="col"
              className={cx(isNumericColumn(column) && 'text-end', headerClassName) || undefined}
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
      return <LoadingBody columns={normalizedColumns} colSpan={emptyColSpan} rows={normalizeLoadingRows(loadingRows)} />
    }
    if (normalizedRows.length === 0) {
      return (
        <tr className="gcu-table__state-row">
          <td colSpan={emptyColSpan}>
            {emptyState ?? <EmptyState compact icon="inbox" title={emptyMessage} message={null} />}
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
              className={cx(isNumericColumn(column) && 'text-end', cellClassName) || undefined}
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
    emptyState,
    hasChildren,
    loading,
    loadingRows,
    normalizedColumns,
    normalizedRows.length,
    rowEntries,
  ])

  const content = hasChildren ? invokeSlot(children, null, slotContext) : (
    <>
      <thead>{invokeSlot(headerSlot, defaultHeader, slotContext)}</thead>
      <tbody>{invokeSlot(bodySlot, defaultBody, slotContext)}</tbody>
    </>
  )

  const table = (
    <table
      {...tableProps}
      ref={ref}
      className={tableCls}
      aria-label={ariaLabelProp ?? ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-busy={loading ? 'true' : ariaBusy}
    >
      {caption !== undefined && caption !== null ? <caption>{caption}</caption> : null}
      {content}
    </table>
  )

  // Table es dueña de la superficie de scroll. `responsive={false}` es la salida explícita para
  // quien ya provee su propio contenedor con overflow.
  if (!responsive) return table

  return (
    <div
      className={cx(
        'table-responsive',
        'gcu-table-scroll',
        hasStickyContainer && 'gcu-table-scroll--sticky gcu-scroll',
        normalizeClassName(wrapperClassName),
      )}
      style={hasStickyContainer && cssLength(maxHeight) ? { maxHeight: cssLength(maxHeight) } : undefined}
      data-scrolled={hasStickyContainer && scrolled ? 'true' : undefined}
      onScroll={hasStickyContainer ? handleScroll : undefined}
    >
      {table}
    </div>
  )
})

type TableComponent = (<T = unknown>(
  props: TableProps<T> & React.RefAttributes<HTMLTableElement>,
) => React.ReactElement | null) & { displayName?: string }

// SAFETY: forwardRef borra el genérico T; la implementación trata filas y columnas como datos opacos.
export const Table = TableBase as TableComponent
