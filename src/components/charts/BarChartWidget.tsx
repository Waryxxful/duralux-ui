import { forwardRef, useRef } from 'react'
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { ChartFrame, RechartsDataTable } from './chartA11y'
import { normalizeCartesianData, resolveChartAlternative } from './chartA11yModel'
import { usePrefersReducedMotion } from './chartMotion'
import { getChartTheme, getChartTooltipStyle, getChartColor } from './chartPalette'
import { useChartTheme } from './chartTheme'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { CARTESIAN_MARGIN, ENTER_ANIMATION_MS, normalizeSeries } from './rechartsShared'
import type { BarChartWidgetProps } from '../../public/chart-types'

const BAR_TICK_FONT_SIZE = 10

/**
 * BarChartWidget — gráfico de barras (agrupadas o apiladas) con el tema del sistema.
 *
 * - data: [{ name, ...series }]; series: [{ key, color?, label? }]; height en px (260).
 * - stacked: apila las series; rounded: radio superior de la barra (6); barSize: ancho máximo (40).
 * - Figura accesible (DX-004) con tabla de datos oculta; leyenda con forma + texto.
 * - Grilla horizontal sutil, ejes en `--gcu-muted`, tooltip elevado con cifras tabulares.
 * - Estados loading / empty / error; animación de entrada que respeta reduced-motion.
 */
export const BarChartWidget = /* @__PURE__ */ forwardRef<HTMLElement, BarChartWidgetProps>(function BarChartWidget({
  data,
  series = [],
  height = 260,
  theme,
  stacked,
  rounded = 6,
  barSize,
  ariaLabel,
  title,
  description,
  accessibleTable,
  fallback,
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
  const normalizedData = normalizeCartesianData(data)
  const normalizedSeries = normalizeSeries(series)
  const reducedMotion = usePrefersReducedMotion()
  const themeScopeRef = useRef<HTMLElement | null>(null)
  const resolvedTheme = getChartTheme(useChartTheme(theme, themeScopeRef))
  const hasData = normalizedData.length > 0 && normalizedSeries.length > 0
  // Sin `data` se conserva el lienzo en blanco histórico; data={[]} pide el estado vacío.
  const shouldRenderEmpty = empty === undefined ? data !== undefined && !hasData : empty
  const alternative = resolveChartAlternative(
    accessibleTable,
    <RechartsDataTable data={normalizedData} series={normalizedSeries} title={title ?? ariaLabel} />,
  )
  // En una pila solo la barra superior lleva el radio; en grupos, cada barra.
  const lastIndex = normalizedSeries.length - 1
  const radiusFor = (index: number): [number, number, number, number] | undefined => {
    if (!rounded || (stacked && index !== lastIndex)) return undefined
    return [rounded, rounded, 0, 0]
  }

  return (
    <ChartFrame
      ref={ref}
      ariaLabel={ariaLabel}
      title={title}
      description={description}
      alternative={alternative}
      fallback={fallback}
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
      height={height}
      kind="bar"
      themeScopeRef={themeScopeRef}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={normalizedData}
          margin={CARTESIAN_MARGIN}
          barGap={3}
          barCategoryGap="35%"
        >
          <CartesianGrid vertical={false} stroke={resolvedTheme.border} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: BAR_TICK_FONT_SIZE, fill: resolvedTheme.muted }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: BAR_TICK_FONT_SIZE, fill: resolvedTheme.muted }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            content={<ChartTooltip mark="square" />}
            contentStyle={getChartTooltipStyle(resolvedTheme)}
            cursor={{ fill: resolvedTheme.surfaceSubtle }}
            isAnimationActive={!reducedMotion}
          />
          {normalizedSeries.length > 1 && (
            <Legend wrapperStyle={{ color: resolvedTheme.text }} content={<ChartLegend mark="square" />} />
          )}
          {normalizedSeries.map((s, index) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label || s.key}
              fill={getChartColor(s.color, index, resolvedTheme)}
              stackId={stacked ? 'stack' : undefined}
              radius={radiusFor(index)}
              maxBarSize={barSize || 40}
              isAnimationActive={!reducedMotion}
              animationDuration={ENTER_ANIMATION_MS}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
})
