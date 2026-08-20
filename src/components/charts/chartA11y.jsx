import React, { useId } from 'react'
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
import { isArray, isObject } from '../../utils/typeGuards'

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

export function RechartsDataTable({ data = [], series = [], title = 'Datos del gráfico' }) {
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

export function PieDataTable({ data = [], title = 'Datos del gráfico' }) {
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
