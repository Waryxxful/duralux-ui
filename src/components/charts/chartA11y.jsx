import React, { createContext, useContext, useId } from 'react'
import { useClientReady } from './chartMotion'
import { EmptyState } from '../feedback/EmptyState'
import { ErrorState } from '../feedback/ErrorState'

export const ChartCardTitleContext = createContext(null)

export function useChartCardTitleId() {
  return useContext(ChartCardTitleContext)
}

function safeIdPart(value) {
  try {
    return String(value).replace(/[^A-Za-z0-9_-]+/g, '-')
  } catch {
    return 'chart'
  }
}

function hasValue(value) {
  if (typeof value === 'string') return value.trim() !== ''
  return value !== undefined && value !== null && value !== false
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function ownDescriptor(value, key) {
  if (value === null || value === undefined) return undefined
  if (typeof value !== 'object' && typeof value !== 'function') return undefined
  try {
    return Object.getOwnPropertyDescriptor(value, key)
  } catch {
    return undefined
  }
}

function hasOwnDataValue(value, key) {
  const descriptor = ownDescriptor(value, key)
  return Boolean(descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value'))
}

export function readChartDataValue(value, key) {
  const descriptor = ownDescriptor(value, key)
  return descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value')
    ? descriptor.value
    : undefined
}

function safeArrayLength(value) {
  const length = readChartDataValue(value, 'length')
  return Number.isSafeInteger(length) && length >= 0 ? length : 0
}

function safeObjectKeys(value) {
  if (value === null || value === undefined) return []
  try {
    return Object.keys(value)
  } catch {
    return []
  }
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

function columnHeaderId(tableId, key, index) {
  return `${tableId}-column-${safeIdPart(key)}-${index}`
}

function resolveErrorValue(error, key) {
  if (!error || typeof error !== 'object' || React.isValidElement(error)) return undefined
  return readChartDataValue(error, key)
}

export function chartErrorMessage(error, explicitMessage) {
  if (hasValue(explicitMessage)) return explicitMessage
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (React.isValidElement(error)) return error
  return resolveErrorValue(error, 'message')
}

export function chartErrorTitle(error, explicitTitle) {
  if (hasValue(explicitTitle)) return explicitTitle
  return resolveErrorValue(error, 'title')
}

export function chartRetryHandler(error, onRetry) {
  const errorRetry = resolveErrorValue(error, 'onRetry')
  if (typeof errorRetry === 'function') return errorRetry
  return typeof onRetry === 'function' ? onRetry : undefined
}

/** Resolve the shared accessible-table contract: false disables it, true uses the default table, and a node replaces it. */
export function resolveChartAlternative(value, fallback) {
  if (value === false) return false
  if (value === true || value === undefined) return fallback
  return value
}

/**
 * Shared state renderer. The wrapper is deliberately rendered outside the
 * visual role=img so live regions and retry controls stay operable.
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
}) {
  if (state === 'loading') {
    const message = hasValue(loadingMessage) ? loadingMessage : 'Cargando...'
    return (
      <div className="chart-frame__state chart-frame__state--loading" role="status" aria-live="polite">
        {fallback !== undefined ? fallback : (
          <>
            <div
              className="spinner-border text-primary mb-3"
              aria-hidden="true"
              style={{ width: '2.5rem', height: '2.5rem' }}
            />
            {message && <p className="text-muted">{message}</p>}
          </>
        )}
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="chart-frame__state chart-frame__state--error">
        {fallback !== undefined ? (
          <div role="alert" aria-live="assertive" aria-atomic="true">{fallback}</div>
        ) : (
          <ErrorState
            title={chartErrorTitle(error, errorTitle)}
            message={chartErrorMessage(error, errorMessage)}
            onRetry={chartRetryHandler(error, onRetry)}
          />
        )}
      </div>
    )
  }

  if (state === 'empty') {
    return (
      <div className="chart-frame__state chart-frame__state--empty" role="status" aria-live="polite">
        {fallback !== undefined ? fallback : (
          <EmptyState title={emptyTitle} message={emptyMessage} />
        )}
      </div>
    )
  }

  return null
}

function safeDisplayValue(value, seen = new WeakSet(), depth = 0) {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value !== 'object') {
    try {
      return String(value)
    } catch {
      return '[objeto]'
    }
  }
  if (depth >= 3 || seen.has(value)) return '[objeto]'
  seen.add(value)

  if (Array.isArray(value)) {
    const values = []
    for (let index = 0; index < safeArrayLength(value); index += 1) {
      values.push(safeDisplayValue(readChartDataValue(value, index), seen, depth + 1))
    }
    return `[${values.join(', ')}]`
  }

  const entries = {}
  safeObjectKeys(value).forEach((key) => {
    if (!hasOwnDataValue(value, key)) return
    entries[key] = safeDisplayValue(readChartDataValue(value, key), seen, depth + 1)
  })
  try {
    return JSON.stringify(entries)
  } catch {
    return '[objeto]'
  }
}

function formatAlternativeValue(value) {
  return safeDisplayValue(value)
}

function tableCaption(title, fallback) {
  return hasValue(title) ? title : fallback
}

export function normalizeCartesianData(data) {
  if (!Array.isArray(data)) return []
  return Array.from({ length: safeArrayLength(data) }, (_, index) => {
    const row = readChartDataValue(data, index)
    if (!isObject(row) || hasOwnDataValue(row, 'name') || !hasOwnDataValue(row, 'x')) return row

    const copy = {}
    safeObjectKeys(row).forEach((key) => {
      if (hasOwnDataValue(row, key)) copy[key] = readChartDataValue(row, key)
    })
    copy.name = readChartDataValue(row, 'x')
    return copy
  })
}

function firstDefinedValue(value, keys) {
  for (const key of keys) {
    if (!hasOwnDataValue(value, key)) continue
    const candidate = readChartDataValue(value, key)
    if (candidate !== undefined && candidate !== null && candidate !== '') return candidate
  }
  return undefined
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

  const definitions = (Array.isArray(series) ? series : [])
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

export function RechartsDataTable({ data = [], series = [], title = 'Datos del gráfico' }) {
  const rows = Array.isArray(data) ? data : []
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

export function PieDataTable({ data = [], title = 'Datos del gráfico' }) {
  const rows = Array.isArray(data) ? data : []
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
  if (!Array.isArray(value)) return value === undefined || value === null ? [] : [value]
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
  const items = Array.isArray(series) ? series : []
  const itemCount = safeArrayLength(items)
  if (!itemCount) return []

  let hasSeriesContainers = false
  for (let index = 0; index < itemCount; index += 1) {
    const item = readChartDataValue(items, index)
    if (isApexNamedSeries(item) || Array.isArray(item)) {
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
    if (Array.isArray(item)) return { name: `Serie ${index + 1}`, data: copyArrayData(item) }
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
  if (Array.isArray(xaxisCategories)) return copyArrayData(xaxisCategories)
  const labels = readChartDataValue(options, 'labels')
  return Array.isArray(labels) ? copyArrayData(labels) : []
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

export function ApexDataTable({ series = [], options = {}, title = 'Datos del gráfico' }) {
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
 * Common semantic frame for every chart implementation.
 *
 * Only the visual chart lives below role=img. Tables, live regions and retry
 * controls are siblings, because role=img flattens its descendants in the
 * accessibility tree.
 */
export function ChartFrame({
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
  themeScopeRef,
}) {
  const ids = useChartA11yIds()
  const cardTitleId = useChartCardTitleId()
  const clientMounted = useClientReady()
  const hasTitle = hasValue(title)
  const hasAriaLabel = hasValue(ariaLabel)
  const ownTitleId = hasTitle ? ids.titleId : undefined
  const labelledBy = hasAriaLabel ? undefined : ownTitleId || cardTitleId || undefined
  const describedBy = hasValue(description) ? ids.descriptionId : undefined
  const state = loading ? 'loading' : error ? 'error' : empty ? 'empty' : null
  const useSsrFallback = !state && ssrFallback !== undefined && !clientMounted
  const hasAlternative = alternative !== undefined && alternative !== null && alternative !== false

  return (
    <div
      ref={themeScopeRef}
      className={className}
      style={style}
      data-chart-frame="true"
      aria-busy={loading || undefined}
    >
      {hasTitle && !hasAriaLabel && (
        <span id={ownTitleId} className="visually-hidden">{title}</span>
      )}

      <div
        className="chart-frame__visual"
        role="img"
        aria-label={hasAriaLabel ? ariaLabel : (labelledBy ? undefined : 'Gráfico')}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
      >
        {state || useSsrFallback ? (
          <span
            className="chart-frame__visual-placeholder"
            data-chart-ssr-placeholder={useSsrFallback || undefined}
            aria-hidden="true"
          />
        ) : children}
      </div>

      {state && (
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
      )}

      {!state && useSsrFallback && (
        <div className="chart-frame__fallback">{ssrFallback}</div>
      )}

      {hasValue(description) && (
        <span id={ids.descriptionId} className="visually-hidden">{description}</span>
      )}

      {!state && hasAlternative && (
        <div className="visually-hidden" data-chart-alternative="true">
          {alternative}
        </div>
      )}
    </div>
  )
}
