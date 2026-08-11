import { useEffect, useMemo, useRef, useState } from 'react'
import { ApexDataTable, ChartFrame, readChartDataValue, resolveChartAlternative } from './chartA11y'
import { useClientReady, usePrefersReducedMotion } from './chartMotion'
import {
  buildApexOptions,
  getApexOptionThemeMode,
  useChartTheme,
} from './chartTheme'

let apexChartModulePromise
const EMPTY_OPTIONS = Object.freeze({})

function loadApexChartComponent() {
  apexChartModulePromise ??= import('react-apexcharts').then(({ default: component }) => component)
  return apexChartModulePromise
}

function hasApexData(series) {
  if (!Array.isArray(series)) return false

  const length = readChartDataValue(series, 'length')
  if (!Number.isSafeInteger(length) || length === 0) return false

  for (let index = 0; index < length; index += 1) {
    const item = readChartDataValue(series, index)
    if (item && typeof item === 'object') {
      const data = readChartDataValue(item, 'data')
      if (Array.isArray(data)) {
        const dataLength = readChartDataValue(data, 'length')
        if (Number.isSafeInteger(dataLength) && dataLength > 0) return true
      } else if (data !== null && data !== undefined) {
        return true
      }
    } else if (item !== null && item !== undefined) {
      return true
    }
  }

  return false
}

function ApexVisual({ type, options, series, height, width }) {
  // ReactApexChart and ApexCharts are browser-only at paint time. Keeping the
  // import and the initial snapshot client-only makes SSR and the first
  // hydrated render identical.
  const clientMounted = useClientReady()
  const [ApexChartComponent, setApexChartComponent] = useState(null)

  useEffect(() => {
    let cancelled = false

    loadApexChartComponent().then((component) => {
      if (!cancelled && typeof component === 'function') {
        setApexChartComponent(() => component)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  if (!clientMounted || !ApexChartComponent) {
    return (
      <div
        className="chart-frame__visual-placeholder"
        data-chart-ssr-placeholder="true"
        aria-hidden="true"
        style={{ height, width }}
      />
    )
  }

  return (
    <ApexChartComponent
      type={type}
      options={options}
      series={series}
      height={height}
      width={width}
    />
  )
}

/**
 * Small, theme-aware ApexCharts adapter.
 *
 * `options` remains the escape hatch used by existing consumers. Defaults are
 * merged into a fresh object and every explicit option from the caller wins.
 * `theme` accepts `light`/`dark` (or Apex's theme object); `ariaLabel`,
 * `title`, `description`, `fallback` and the state props are shared with the
 * Recharts widgets.
 */
export function ApexChart({
  type = 'line',
  options = EMPTY_OPTIONS,
  series,
  height = 350,
  width = '100%',
  theme,
  ariaLabel,
  title,
  description,
  accessibleTable,
  fallback,
  ssrFallback,
  loading = false,
  empty,
  error,
  onRetry,
  loadingMessage,
  emptyTitle,
  emptyMessage,
  errorTitle,
  errorMessage,
  className,
  style,
}) {
  const normalizedSeries = Array.isArray(series) ? series : []
  const reducedMotion = usePrefersReducedMotion()
  const themeScopeRef = useRef(null)
  const ambientTheme = useChartTheme(theme, themeScopeRef)
  const resolvedOptions = useMemo(
    () => buildApexOptions({
      options,
      type,
      height,
      width,
      mode: getApexOptionThemeMode(options) ?? ambientTheme,
      theme: typeof theme === 'object' ? theme : undefined,
      reducedMotion,
    }),
    [ambientTheme, height, options, reducedMotion, theme, type, width],
  )
  const hasData = hasApexData(normalizedSeries)
  // Preserve the legacy blank canvas when `series` is omitted. An explicitly
  // supplied empty series opts into the composable empty state.
  const shouldRenderEmpty = empty === undefined ? series !== undefined && !hasData : empty
  const alternative = resolveChartAlternative(
    accessibleTable,
    <ApexDataTable series={normalizedSeries} options={options} title={title ?? ariaLabel} />,
  )
  const resolvedSsrFallback = ssrFallback !== undefined
    ? ssrFallback
    : <p className="chart-frame__ssr-fallback">El gráfico se cargará en el navegador.</p>

  return (
    <ChartFrame
      ariaLabel={ariaLabel}
      title={title}
      description={description}
      alternative={alternative}
      fallback={fallback}
      ssrFallback={resolvedSsrFallback}
      loading={loading}
      empty={shouldRenderEmpty}
      error={error}
      onRetry={onRetry}
      loadingMessage={loadingMessage}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      errorTitle={errorTitle}
      errorMessage={errorMessage}
      className={className}
      style={style}
      themeScopeRef={themeScopeRef}
    >
      <ApexVisual
        type={type}
        options={resolvedOptions}
        series={normalizedSeries}
        height={height}
        width={width}
      />
    </ChartFrame>
  )
}
