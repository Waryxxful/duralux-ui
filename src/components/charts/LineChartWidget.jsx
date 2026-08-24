import { useRef } from 'react'
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

/**
 * LineChartWidget — gráfico de líneas estilo Duralux.
 *
 * Props:
 *   data    — [{ name, ...series }]
 *   series  — [{ key, color, label, dashed }]
 *   height  — número de px (default 260)
 */
export function LineChartWidget({
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
}) {
  const normalizedData = normalizeCartesianData(data)
  const normalizedSeries = Array.isArray(series) ? series.filter(Boolean) : []
  const reducedMotion = usePrefersReducedMotion()
  const themeScopeRef = useRef(null)
  const resolvedTheme = getChartTheme(useChartTheme(theme, themeScopeRef))
  const hasData = normalizedData.length > 0 && normalizedSeries.length > 0
  const shouldRenderEmpty = empty === undefined ? data !== undefined && !hasData : empty
  const alternative = resolveChartAlternative(
    accessibleTable,
    <RechartsDataTable data={normalizedData} series={normalizedSeries} title={title ?? ariaLabel} />,
  )

  return (
    <ChartFrame
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
      themeScopeRef={themeScopeRef}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={normalizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme.border} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: resolvedTheme.muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: resolvedTheme.muted }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ ...getChartTooltipStyle(resolvedTheme) }} isAnimationActive={!reducedMotion} />
          {normalizedSeries.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: resolvedTheme.text }} content={<ChartLegend theme={resolvedTheme} />} />}
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
              activeDot={{ r: 5 }}
              isAnimationActive={!reducedMotion}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
