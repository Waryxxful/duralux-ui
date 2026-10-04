import { forwardRef, useCallback, useId } from 'react'
import type * as React from 'react'
import { useClientReady } from './chartMotion'
import { EmptyState } from '../feedback/EmptyState'
import { ErrorState } from '../feedback/ErrorState'
import {
  columnHeaderId,
  chartErrorMessage,
  chartErrorTitle,
  chartRetryHandler,
  firstDefinedValue,
  formatAlternativeValue,
  hasOwnDataValue,
  hasValue,
  readChartDataValue,
  safeArrayLength,
  safeIdPart,
  safeObjectKeys,
  tableCaption,
  useChartCardTitleId,
} from './chartA11yModel'
import { isArray, isFiniteNumber, isFunction, isNonEmptyString, isObject } from '../../utils/typeGuards'
import { cx } from '../../utils/cx'
import type { ApexChartOptions, ApexChartSeries, ChartDatum, ChartError, ChartSeries, PieChartDatum } from '../../public/chart-types'

type ChartStateName = 'loading' | 'error' | 'empty'

interface ChartStateProps {
  state: ChartStateName | null
  fallback?: React.ReactNode
  loadingMessage?: React.ReactNode
  emptyTitle?: React.ReactNode
  emptyMessage?: React.ReactNode
  error?: ChartError
  errorTitle?: React.ReactNode
  errorMessage?: React.ReactNode
  onRetry?: () => void
}

interface DataTableProps {
  title?: React.ReactNode
}

interface RechartsDataTableProps extends DataTableProps {
  data?: ReadonlyArray<ChartDatum | number | string>
  series?: ReadonlyArray<ChartSeries | string>
}

interface PieDataTableProps extends DataTableProps {
  data?: ReadonlyArray<PieChartDatum | number>
}

interface ApexDataTableProps extends DataTableProps {
  series?: ApexChartSeries | ReadonlyArray<unknown>
  options?: ApexChartOptions
}

export interface ChartFrameProps extends Omit<ChartStateProps, 'state'> {
  children?: React.ReactNode
  ariaLabel?: string
  title?: React.ReactNode
  description?: React.ReactNode
  /** Alternativa textual (tabla de datos); `false` la omite. */
  alternative?: React.ReactNode
  ssrFallback?: React.ReactNode
  loading?: boolean
  empty?: boolean
  className?: string
  style?: React.CSSProperties
  /** Alto del lienzo: los estados lo conservan (sin salto de layout). */
  height?: number | string
  /** Motor o tipo de gráfico, para estilos (`gcu-chart--line`, `--apex`…). */
  kind?: string
  themeScopeRef?: React.MutableRefObject<HTMLElement | null>
}

function useChartA11yIds() {
  const reactId = safeIdPart(useId())
  return {
    titleId: `chart-title-${reactId}`,
    descriptionId: `chart-description-${reactId}`,
  }
}

function useTableA11yIds(prefix) {
  const reactId = safeIdPart(useId())
  const tableId = `chart-${prefix}-table-${reactId}`
  return {
    tableId,
    categoryHeaderId: `${tableId}-category`,
  }
}

const SKELETON_BARS = [0.55, 0.8, 0.45, 0.7, 0.9, 0.6, 0.75]

/**
 * Esqueleto con la forma de un gráfico: barras de alturas fijas (posicionales,
 * nunca se reordenan) que ocupan el alto del lienzo para que no haya salto
 * de layout al llegar los datos. El shimmer respeta reduced-motion (tokens).
 */
function ChartSkeleton() {
  return (
    <div className="gcu-chart__skeleton" aria-hidden="true">
      {SKELETON_BARS.map((ratio) => (
        <span
          key={`chart-skeleton-${ratio}`}
          className="gcu-skeleton gcu-chart__skeleton-bar"
          style={{ height: `${Math.round(ratio * 100)}%` }}
        />
      ))}
    </div>
  )
}

/**
 * Estados compartidos (carga, error, vacío) con los componentes de feedback:
 * skeleton dentro de una región `status`, ErrorState (alerta + reintento) y
 * EmptyState. Viven dentro de la figura, nunca dentro de un `role="img"`.
 */
export function ChartState({
  state,
  fallback,
  loadingMessage,
  emptyTitle,
  emptyMessage,
  error,
  errorTitle,
  errorMessage,
  onRetry,
}: ChartStateProps) {
  if (state === 'loading') {
    const message = hasValue(loadingMessage) ? loadingMessage : 'Cargando...'
    return (
      <div className="chart-frame__state gcu-chart__state gcu-chart__state--loading" role="status" aria-live="polite">
        {fallback !== undefined ? fallback : (
          <>
            <ChartSkeleton />
            <span className="visually-hidden">{message}</span>
          </>
        )}
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="chart-frame__state gcu-chart__state gcu-chart__state--error">
        {fallback !== undefined ? (
          <div role="alert" aria-live="assertive" aria-atomic="true">{fallback}</div>
        ) : (
          <ErrorState
            title={chartErrorTitle(error, errorTitle)}
            message={chartErrorMessage(error, errorMessage)}
            onRetry={chartRetryHandler(error, onRetry)}
            compact
          />
        )}
      </div>
    )
  }

  if (state === 'empty') {
    return (
      <div className="chart-frame__state gcu-chart__state gcu-chart__state--empty" role="status" aria-live="polite">
        {fallback !== undefined ? fallback : (
          <EmptyState
            icon="bar-chart-2"
            title={hasValue(emptyTitle) ? emptyTitle : 'Sin datos para graficar'}
            message={hasValue(emptyMessage) ? emptyMessage : 'Cuando haya datos en el periodo, el gráfico aparecerá aquí.'}
            compact
          />
        )}
      </div>
    )
  }

  return null
}

function categoryValue(row, index) {
  if (!isObject(row)) return index + 1
  return firstDefinedValue(row, ['name', 'label', 'category', 'x']) ?? index + 1
}

function valueAt(row, key, columnCount = 1) {
  if (!isObject(row)) {
    return columnCount === 1 || key === 'value' || key === 'y' ? row : undefined
  }
  if (hasOwnDataValue(row, key)) return readChartDataValue(row, key)
  if (key === 'value' && hasOwnDataValue(row, 'y')) return readChartDataValue(row, 'y')
  if (key === 'y' && hasOwnDataValue(row, 'value')) return readChartDataValue(row, 'value')
  return undefined
}

function normalizeRechartsDefinition(item, index) {
  if (isObject(item)) {
    const key = firstDefinedValue(item, ['key', 'dataKey', 'name'])
    if (key === undefined || key === null || key === '') return null
    const label = firstDefinedValue(item, ['label', 'name'])
      ?? (key === 'y' || key === 'value' ? 'Valor' : key)
    return { key, label, index }
  }

  if (item === undefined || item === null || item === '') return null
  return { key: item, label: item, index }
}

function rechartsColumns(rows, series) {
  if (rows.every((row) => !isObject(row))) {
    return [{ key: 'value', label: 'Valor', index: 0 }]
  }

  const definitions = (isArray(series) ? series : [])
    .flatMap((item, index) => {
      const definition = normalizeRechartsDefinition(item, index)
      return definition ? [definition] : []
    })
  if (definitions.length) return definitions

  const categoryKeys = new Set(['name', 'label', 'category', 'x'])
  const keys = []
  const seenKeys = new Set()
  rows.forEach((row) => {
    safeObjectKeys(row).forEach((key) => {
      if (categoryKeys.has(key) || seenKeys.has(key)) return
      seenKeys.add(key)
      keys.push(key)
    })
  })
  return keys.map((key, index) => ({
    key,
    label: key === 'y' || key === 'value' ? 'Valor' : key,
    index,
  }))
}

export function RechartsDataTable({ data = [], series = [], title = 'Datos del gráfico' }: RechartsDataTableProps) {
  const rows = isArray(data) ? data : []
  const { tableId, categoryHeaderId } = useTableA11yIds('recharts')
  if (!rows.length) return null

  const columns = rechartsColumns(rows, series)
  const headers = columns.map((column) => columnHeaderId(tableId, column.key, column.index))

  return (
    <table id={tableId}>
      <caption>{tableCaption(title, 'Datos del gráfico')}</caption>
      <thead>
        <tr>
          <th id={categoryHeaderId} scope="col">Categoría</th>
          {columns.map((column, index) => (
            <th id={headers[index]} scope="col" key={headers[index]}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`chart-row-${rowIndex}`}>
            <th scope="row" id={`${tableId}-row-${rowIndex}`}>{formatAlternativeValue(categoryValue(row, rowIndex))}</th>
            {columns.map((column, columnIndex) => (
              <td
                key={`${tableId}-cell-${rowIndex}-${columnIndex}`}
                headers={`${categoryHeaderId} ${headers[columnIndex]}`}
              >
                {formatAlternativeValue(valueAt(row, column.key, columns.length))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function pieLabel(row, index) {
  return categoryValue(row, index)
}

function pieValue(row) {
  if (!isObject(row)) return row
  return firstDefinedValue(row, ['value', 'y', 'data'])
}

function pieTableRows(rows) {
  const occurrences = new Map()
  return rows.map((row, index) => {
    const identity = `${formatAlternativeValue(pieLabel(row, index))}:${formatAlternativeValue(pieValue(row))}`
    const occurrence = (occurrences.get(identity) ?? 0) + 1
    occurrences.set(identity, occurrence)
    return { row, index, key: `chart-pie-row-${identity}-${occurrence}` }
  })
}

export function PieDataTable({ data = [], title = 'Datos del gráfico' }: PieDataTableProps) {
  const rows = isArray(data) ? data : []
  const { tableId, categoryHeaderId } = useTableA11yIds('pie')
  if (!rows.length) return null

  const valueHeaderId = `${tableId}-value`

  return (
    <table id={tableId}>
      <caption>{tableCaption(title, 'Datos del gráfico')}</caption>
      <thead>
        <tr>
          <th id={categoryHeaderId} scope="col">Categoría</th>
          <th id={valueHeaderId} scope="col">Valor</th>
        </tr>
      </thead>
      <tbody>
        {pieTableRows(rows).map(({ row, index, key }) => (
          <tr key={key}>
            <th scope="row" id={`${tableId}-row-header-${index}`}>{formatAlternativeValue(pieLabel(row, index))}</th>
            <td headers={`${categoryHeaderId} ${valueHeaderId}`}>{formatAlternativeValue(pieValue(row))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function copyArrayData(value) {
  if (!isArray(value)) return value === undefined || value === null ? [] : [value]
  const result = []
  for (let index = 0; index < safeArrayLength(value); index += 1) {
    result.push(readChartDataValue(value, index))
  }
  return result
}

function isApexNamedSeries(item) {
  return isObject(item) && hasOwnDataValue(item, 'data')
}

function apexSeriesName(item, index) {
  const name = readChartDataValue(item, 'name')
  return hasValue(name) ? name : `Serie ${index + 1}`
}

function normalizeApexSeries(series) {
  const items = isArray(series) ? series : []
  const itemCount = safeArrayLength(items)
  if (!itemCount) return []

  let hasSeriesContainers = false
  for (let index = 0; index < itemCount; index += 1) {
    const item = readChartDataValue(items, index)
    if (isApexNamedSeries(item) || isArray(item)) {
      hasSeriesContainers = true
      break
    }
  }
  if (!hasSeriesContainers) return [{ name: 'Valor', data: copyArrayData(items) }]

  return Array.from({ length: itemCount }, (_, index) => {
    const item = readChartDataValue(items, index)
    if (isApexNamedSeries(item)) {
      return {
        name: apexSeriesName(item, index),
        data: copyArrayData(readChartDataValue(item, 'data')),
      }
    }
    if (isArray(item)) return { name: `Serie ${index + 1}`, data: copyArrayData(item) }
    return { name: `Serie ${index + 1}`, data: [item] }
  })
}

function apexPointLabel(point, index, categories) {
  if (isObject(point)) {
    return firstDefinedValue(point, ['x', 'name', 'label']) ?? categories[index] ?? index + 1
  }
  return categories[index] ?? index + 1
}

function apexPointValue(point) {
  if (!isObject(point)) return point
  return firstDefinedValue(point, ['y', 'value', 'data'])
}

function apexCategories(options) {
  const xaxis = readChartDataValue(options, 'xaxis')
  const xaxisCategories = readChartDataValue(xaxis, 'categories')
  if (isArray(xaxisCategories)) return copyArrayData(xaxisCategories)
  const labels = readChartDataValue(options, 'labels')
  return isArray(labels) ? copyArrayData(labels) : []
}

function apexRows(series, options) {
  const datasets = normalizeApexSeries(series)
  const categories = apexCategories(options)
  const longest = datasets.reduce((length, dataset) => Math.max(length, safeArrayLength(dataset.data)), 0)

  return Array.from({ length: longest }, (_, index) => {
    const firstPoint = datasets
      .map((dataset) => dataset.data[index])
      .find((point) => point !== undefined)
    return {
      label: apexPointLabel(firstPoint, index, categories),
      values: datasets.map((dataset) => apexPointValue(dataset.data[index])),
    }
  })
}

function uniqueColumnLabels(datasets) {
  const counts = new Map()
  return datasets.map((dataset) => {
    const base = formatAlternativeValue(dataset.name)
    const count = (counts.get(base) ?? 0) + 1
    counts.set(base, count)
    return count === 1 ? base : `${base} (${count})`
  })
}

export function ApexDataTable({ series = [], options = {}, title = 'Datos del gráfico' }: ApexDataTableProps) {
  const datasets = normalizeApexSeries(series)
  const rows = apexRows(series, options)
  const { tableId, categoryHeaderId } = useTableA11yIds('apex')
  if (!rows.length || !datasets.length) return null

  const columns = uniqueColumnLabels(datasets)
  const headers = columns.map((column, index) => columnHeaderId(tableId, column, index))

  return (
    <table id={tableId}>
      <caption>{tableCaption(title, 'Datos del gráfico')}</caption>
      <thead>
        <tr>
          <th id={categoryHeaderId} scope="col">Categoría</th>
          {columns.map((column, index) => (
            <th id={headers[index]} scope="col" key={headers[index]}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`${tableId}-row-${rowIndex}`}>
            <th scope="row" id={`${tableId}-row-header-${rowIndex}`}>{formatAlternativeValue(row.label)}</th>
            {row.values.map((value, valueIndex) => (
              <td
                key={`${tableId}-value-${rowIndex}-${valueIndex}`}
                headers={`${categoryHeaderId} ${headers[valueIndex]}`}
              >
                {formatAlternativeValue(value)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Marco semántico común de todos los gráficos (DX-004).
 *
 * `<figure>` con nombre (aria-label, título propio o el título del ChartCard)
 * y descripción. El lienzo de Apex/Recharts ya no vive dentro de un
 * `role="img"`: sus controles enfocables (leyenda, barra de herramientas,
 * capa de teclado de Recharts) quedan operables y no hay interactivo anidado.
 * La alternativa textual (tabla de datos) va en la misma figura, oculta a la
 * vista y disponible para lectores de pantalla; los estados de carga, vacío y
 * error reemplazan al lienzo con su mismo alto (sin salto de layout).
 */
export const ChartFrame = /* @__PURE__ */ forwardRef<HTMLElement, ChartFrameProps>(function ChartFrame({
  children,
  ariaLabel,
  title,
  description,
  alternative,
  fallback,
  ssrFallback,
  loading = false,
  empty = false,
  error,
  onRetry,
  loadingMessage,
  emptyTitle,
  emptyMessage,
  errorTitle,
  errorMessage,
  className,
  style,
  height,
  kind,
  themeScopeRef,
}, ref) {
  const ids = useChartA11yIds()
  const cardTitleId = useChartCardTitleId()
  const clientMounted = useClientReady()
  const hasTitle = hasValue(title)
  const hasAriaLabel = hasValue(ariaLabel)
  const ownTitleId = hasTitle ? ids.titleId : undefined
  const labelledBy = hasAriaLabel ? undefined : ownTitleId || cardTitleId || undefined
  const describedBy = hasValue(description) ? ids.descriptionId : undefined
  const state: ChartStateName | null = loading ? 'loading' : error ? 'error' : empty ? 'empty' : null
  const useSsrFallback = !state && ssrFallback !== undefined && !clientMounted
  const hasAlternative = alternative !== undefined && alternative !== null && alternative !== false
  const setRefs = useCallback((node: HTMLElement | null) => {
    if (themeScopeRef) themeScopeRef.current = node
    if (isFunction<typeof ref, (value: HTMLElement | null) => void>(ref)) ref(node)
    else if (ref) ref.current = node
  }, [ref, themeScopeRef])

  const visualHeight = isFiniteNumber(height) ? `${height}px` : (isNonEmptyString(height) ? height : undefined)

  return (
    <figure
      ref={setRefs}
      className={cx('gcu-chart', 'gcu-container', kind && `gcu-chart--${kind}`, className)}
      // SAFETY: CSSProperties no declara custom properties; `--gcu-chart-height` es una cadena CSS válida.
      style={visualHeight ? ({ '--gcu-chart-height': visualHeight, ...style } as React.CSSProperties) : style}
      data-chart-frame="true"
      data-chart-state={state ?? undefined}
      aria-label={hasAriaLabel ? ariaLabel : (labelledBy ? undefined : 'Gráfico')}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-busy={loading || undefined}
    >
      <div className="chart-frame__visual">
        {state ? (
          <ChartState
            state={state}
            fallback={fallback}
            loadingMessage={loadingMessage}
            emptyTitle={emptyTitle}
            emptyMessage={emptyMessage}
            error={error}
            errorTitle={errorTitle}
            errorMessage={errorMessage}
            onRetry={onRetry}
          />
        ) : useSsrFallback ? (
          <span
            className="chart-frame__visual-placeholder gcu-chart__placeholder"
            data-chart-ssr-placeholder="true"
            aria-hidden="true"
          />
        ) : children}
      </div>

      {!state && useSsrFallback && (
        <div className="chart-frame__fallback gcu-chart__fallback">{ssrFallback}</div>
      )}

      {(hasTitle || hasValue(description)) && (
        <figcaption className="visually-hidden">
          {hasTitle && <span id={ownTitleId}>{title}</span>}
          {hasTitle && hasValue(description) && ' '}
          {hasValue(description) && <span id={ids.descriptionId}>{description}</span>}
        </figcaption>
      )}

      {!state && hasAlternative && (
        <div className="visually-hidden" data-chart-alternative="true">
          {alternative}
        </div>
      )}
    </figure>
  )
})
