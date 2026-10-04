import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { ApexDataTable, ChartFrame } from './chartA11y'
import { readChartDataValue, resolveChartAlternative } from './chartA11yModel'
import { useClientReady, usePrefersReducedMotion } from './chartMotion'
import { loadApexChartComponent } from './apexLoader'
import {
  buildApexOptions,
  getApexOptionThemeMode,
  useChartTheme,
} from './chartTheme'
import { log } from '../../utils/log'
import { isArray, isFunction, isObject } from '../../utils/typeGuards'
import type { ApexChartOptions, ApexChartProps, ApexChartSeries } from '../../public/chart-types'

/** Props que recibe el componente de react-apexcharts. */
interface ApexEngineProps {
  type: string
  options: ApexChartOptions
  series: ApexChartSeries
  height: number | string
  width: number | string
}
type ApexEngine = React.ComponentType<ApexEngineProps>

const EMPTY_OPTIONS: ApexChartOptions = Object.freeze({})
const LOAD_ERROR = 'No se pudo cargar el gráfico'

function hasApexData(series: ApexChartSeries): boolean {
  if (!isArray(series)) return false

  const length = readChartDataValue(series, 'length')
  if (!Number.isSafeInteger(length) || length === 0) return false

  for (let index = 0; index < length; index += 1) {
    const item = readChartDataValue(series, index)
    if (item && isObject(item)) {
      const data = readChartDataValue(item, 'data')
      if (isArray(data)) {
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

interface ApexVisualProps extends ApexEngineProps {
  onLoadError: (error: Error) => void
}

function ApexVisual({ type, options, series, height, width, onLoadError }: ApexVisualProps) {
  // ReactApexChart y ApexCharts solo pintan en el navegador. La importación y
  // el primer cuadro quedan del lado cliente: SSR e hidratación coinciden.
  const clientMounted = useClientReady()
  const [ApexChartComponent, setApexChartComponent] = useState<ApexEngine | null>(null)

  useEffect(() => {
    let cancelled = false

    loadApexChartComponent().then((component) => {
      if (cancelled) return
      if (isFunction(component) || isObject(component)) setApexChartComponent(() => component)
      else onLoadError(new Error('react-apexcharts no exporta un componente'))
    }, (cause) => {
      if (!cancelled) onLoadError(cause instanceof Error ? cause : new Error(String(cause)))
    })

    return () => {
      cancelled = true
    }
  }, [onLoadError])

  if (!clientMounted || !ApexChartComponent) {
    return (
      <div
        className="chart-frame__visual-placeholder gcu-chart__placeholder"
        data-chart-ssr-placeholder="true"
        aria-hidden="true"
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
 * ApexChart — adaptador de ApexCharts con el tema del sistema.
 *
 * - options: escape hatch hacia Apex; se fusiona sobre los valores del tema y lo explícito gana.
 * - theme: `light` / `dark` / `navy` u objeto de tema de Apex; si se omite, sigue al ámbito más cercano.
 * - Figura accesible (DX-004): nombre por `ariaLabel`, `title` o el título del ChartCard; tabla de datos oculta.
 * - Estados: loading (skeleton), empty (EmptyState), error (ErrorState con reintento); si el motor no carga,
 *   muestra el error y lo registra con `log.error`.
 * Estilos: src/styles/components/chart.css.
 */
export const ApexChart = /* @__PURE__ */ forwardRef<HTMLElement, ApexChartProps>(function ApexChart({
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
}, ref) {
  const normalizedSeries: ApexChartSeries = Array.isArray(series) ? series : []
  const reducedMotion = usePrefersReducedMotion()
  const themeScopeRef = useRef<HTMLElement | null>(null)
  const ambientTheme = useChartTheme(theme, themeScopeRef)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const handleLoadError = useCallback((cause: Error) => {
    log.error('ApexChart: no se pudo cargar react-apexcharts (¿falta el peer opcional?).', cause)
    setLoadError(cause)
  }, [])
  const resolvedOptions = useMemo(
    () => buildApexOptions({
      options,
      type,
      height,
      width,
      mode: getApexOptionThemeMode(options) ?? ambientTheme,
      theme: isObject(theme) ? theme : undefined,
      reducedMotion,
    }),
    [ambientTheme, height, options, reducedMotion, theme, type, width],
  )
  const hasData = hasApexData(normalizedSeries)
  // Sin `series` se conserva el lienzo en blanco histórico; una serie vacía explícita pide el estado vacío.
  const shouldRenderEmpty = empty === undefined ? series !== undefined && !hasData : empty
  const alternative = resolveChartAlternative(
    accessibleTable,
    <ApexDataTable series={normalizedSeries} options={options} title={title ?? ariaLabel} />,
  )
  const resolvedSsrFallback = ssrFallback !== undefined
    ? ssrFallback
    : <p className="chart-frame__ssr-fallback">El gráfico se cargará en el navegador.</p>
  const retryLoad = () => setLoadError(null)

  return (
    <ChartFrame
      ref={ref}
      ariaLabel={ariaLabel}
      title={title}
      description={description}
      alternative={alternative}
      fallback={fallback}
      ssrFallback={resolvedSsrFallback}
      loading={loading}
      empty={shouldRenderEmpty}
      error={error ?? (loadError ? { title: LOAD_ERROR, message: loadError.message, onRetry: retryLoad } : undefined)}
      onRetry={onRetry}
      loadingMessage={loadingMessage}
      emptyTitle={emptyTitle}
      emptyMessage={emptyMessage}
      errorTitle={errorTitle}
      errorMessage={errorMessage}
      className={className}
      style={style}
      height={height}
      kind="apex"
      themeScopeRef={themeScopeRef}
    >
      <ApexVisual
        type={type}
        options={resolvedOptions}
        series={normalizedSeries}
        height={height}
        width={width}
        onLoadError={handleLoadError}
      />
    </ChartFrame>
  )
})
