import { forwardRef, useId, useRef } from 'react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { ChartFrame, RechartsDataTable } from './chartA11y'
import { normalizeCartesianData, resolveChartAlternative } from './chartA11yModel'
import { usePrefersReducedMotion } from './chartMotion'
import { getChartTheme, getChartTooltipStyle, getChartColor } from './chartPalette'
import { useChartTheme } from './chartTheme'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { AXIS_TICK_FONT_SIZE, CARTESIAN_MARGIN, ENTER_ANIMATION_MS, Y_AXIS_WIDTH, formatAxisTick, keepSeriesOrder, normalizeSeries } from './rechartsShared'
import type { AreaChartWidgetProps } from '../../public/chart-types'

function sanitizeIdPart(value: string | number): string {
  return String(value).replace(/[^A-Za-z0-9_-]+/g, '-')
}

/**
 * AreaChartWidget — gráfico de área con degradado suave.
 *
 * - data: [{ name, ...series }]; series: [{ key, color?, label?, dashed? }]; height en px (260); grid (true).
 * - Figura accesible (DX-004) con tabla de datos oculta; leyenda con forma + texto.
 * - Grilla horizontal sutil, ejes en `--gcu-muted`, tooltip elevado con cifras tabulares.
 * - Estados loading / empty / error; animación de entrada que respeta reduced-motion.
 */
export const AreaChartWidget = /* @__PURE__ */ forwardRef<HTMLElement, AreaChartWidgetProps>(function AreaChartWidget({
  data,
  series = [],
  height = 260,
  grid = true,
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
  const gradientIdPrefix = `area-gradient-${sanitizeIdPart(useId())}`
  const reducedMotion = usePrefersReducedMotion()
  const themeScopeRef = useRef<HTMLElement | null>(null)
  const resolvedTheme = getChartTheme(useChartTheme(theme, themeScopeRef))
  const gradientId = (key: string, index: number) => `${gradientIdPrefix}-${sanitizeIdPart(key)}-${index}`
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
      kind="area"
      themeScopeRef={themeScopeRef}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={normalizedData} margin={CARTESIAN_MARGIN}>
          <defs>
            {normalizedSeries.map((s, index) => {
              const color = getChartColor(s.color, index, resolvedTheme)
              return (
                <linearGradient key={s.key} id={gradientId(s.key, index)} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.24} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              )
            })}
          </defs>
          {grid && <CartesianGrid vertical={false} stroke={resolvedTheme.border} />}
          <XAxis dataKey="name" tick={{ fontSize: AXIS_TICK_FONT_SIZE, fill: resolvedTheme.muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: AXIS_TICK_FONT_SIZE, fill: resolvedTheme.muted }} axisLine={false} tickLine={false} width={Y_AXIS_WIDTH} tickFormatter={formatAxisTick} />
          <Tooltip
            content={<ChartTooltip mark="line" />}
            contentStyle={getChartTooltipStyle(resolvedTheme)}
            cursor={{ stroke: resolvedTheme.border }}
            isAnimationActive={!reducedMotion}
          />
          {normalizedSeries.length > 1 && (
            <Legend wrapperStyle={{ color: resolvedTheme.text }} itemSorter={keepSeriesOrder} content={<ChartLegend mark="line" />} />
          )}
          {normalizedSeries.map((s, index) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label || s.key}
              stroke={getChartColor(s.color, index, resolvedTheme)}
              strokeDasharray={s.dashed ? '5 5' : undefined}
              fill={`url(#${gradientId(s.key, index)})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              isAnimationActive={!reducedMotion}
              animationDuration={ENTER_ANIMATION_MS}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
})
