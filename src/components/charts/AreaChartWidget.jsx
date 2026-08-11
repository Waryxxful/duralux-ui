import { useId, useRef } from 'react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { ChartFrame, normalizeCartesianData, RechartsDataTable, resolveChartAlternative } from './chartA11y'
import { usePrefersReducedMotion } from './chartMotion'
import { getChartTheme, getChartTooltipStyle, getChartColor } from './chartPalette'
import { useChartTheme } from './chartTheme'

function sanitizeIdPart(value) {
  return String(value).replace(/[^A-Za-z0-9_-]+/g, '-')
}

/**
 * AreaChartWidget — gráfico de área con gradiente estilo Duralux.
 *
 * Props:
 *   data     — [{ name, ...series }]
 *   series   — [{ key, color, label }]
 *   height   — número de px (default 260)
 *   grid     — mostrar grilla (default true)
 *   color, ariaLabel, title, description, fallback and state props are optional
 */
export function AreaChartWidget({
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
}) {
  const normalizedData = normalizeCartesianData(data)
  const normalizedSeries = Array.isArray(series) ? series.filter(Boolean) : []
  const gradientIdPrefix = `area-gradient-${sanitizeIdPart(useId())}`
  const reducedMotion = usePrefersReducedMotion()
  const themeScopeRef = useRef(null)
  const resolvedTheme = getChartTheme(useChartTheme(theme, themeScopeRef))
  const gradientId = (key, index) => `${gradientIdPrefix}-${sanitizeIdPart(key)}-${index}`
  const hasData = normalizedData.length > 0 && normalizedSeries.length > 0
  // Keep the existing blank canvas when data is omitted; data={[]} is explicit.
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
        <AreaChart data={normalizedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {normalizedSeries.map((s, index) => {
              const color = getChartColor(s.color, index, resolvedTheme)
              return (
                <linearGradient key={s.key} id={gradientId(s.key, index)} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              )
            })}
          </defs>
          {grid && <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme.border} />}
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: resolvedTheme.muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: resolvedTheme.muted }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ ...getChartTooltipStyle(resolvedTheme) }} isAnimationActive={!reducedMotion} />
          {normalizedSeries.length > 1 && <Legend wrapperStyle={{ fontSize: 12, color: resolvedTheme.text }} />}
          {normalizedSeries.map((s, index) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label || s.key}
              stroke={getChartColor(s.color, index, resolvedTheme)}
              fill={`url(#${gradientId(s.key, index)})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              isAnimationActive={!reducedMotion}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
