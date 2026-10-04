import { forwardRef, useRef } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { ChartFrame, RechartsDataTable } from './chartA11y'
import { normalizeCartesianData, resolveChartAlternative } from './chartA11yModel'
import { usePrefersReducedMotion } from './chartMotion'
import { getChartTheme, getChartTooltipStyle, getChartColor } from './chartPalette'
import { useChartTheme } from './chartTheme'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { AXIS_TICK_FONT_SIZE, CARTESIAN_MARGIN, ENTER_ANIMATION_MS, normalizeSeries } from './rechartsShared'
import type { LineChartWidgetProps } from '../../public/chart-types'

/**
 * LineChartWidget — gráfico de líneas con el tema del sistema.
 *
 * - data: [{ name, ...series }]; series: [{ key, color?, label?, dashed? }]; height en px (260).
 * - Figura accesible (DX-004) con tabla de datos oculta; leyenda con forma + texto (línea punteada si `dashed`).
 * - Grilla horizontal sutil, ejes en `--gcu-muted`, tooltip elevado con cifras tabulares.
 * - Estados loading / empty / error; animación de entrada que respeta reduced-motion.
 */
export const LineChartWidget = /* @__PURE__ */ forwardRef<HTMLElement, LineChartWidgetProps>(function LineChartWidget({
  data,
  series = [],
  height = 260,
  theme,
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
      kind="line"
      themeScopeRef={themeScopeRef}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={normalizedData} margin={CARTESIAN_MARGIN}>
          <CartesianGrid vertical={false} stroke={resolvedTheme.border} />
          <XAxis dataKey="name" tick={{ fontSize: AXIS_TICK_FONT_SIZE, fill: resolvedTheme.muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: AXIS_TICK_FONT_SIZE, fill: resolvedTheme.muted }} axisLine={false} tickLine={false} />
          <Tooltip
            content={<ChartTooltip mark="line" />}
            contentStyle={getChartTooltipStyle(resolvedTheme)}
            cursor={{ stroke: resolvedTheme.border }}
            isAnimationActive={!reducedMotion}
          />
          {normalizedSeries.length > 1 && (
            <Legend wrapperStyle={{ color: resolvedTheme.text }} content={<ChartLegend mark="line" />} />
          )}
          {normalizedSeries.map((s, index) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label || s.key}
              stroke={getChartColor(s.color, index, resolvedTheme)}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 5' : undefined}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              isAnimationActive={!reducedMotion}
              animationDuration={ENTER_ANIMATION_MS}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
})
