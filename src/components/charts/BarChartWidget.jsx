import { useRef } from 'react'
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { ChartFrame, RechartsDataTable } from './chartA11y'
import { normalizeCartesianData, resolveChartAlternative } from './chartA11yModel'
import { usePrefersReducedMotion } from './chartMotion'
import { getChartTheme, getChartTooltipStyle, getChartColor } from './chartPalette'
import { useChartTheme } from './chartTheme'
import { ChartLegend } from './ChartLegend'

const CustomTooltip = ({ active, payload, label, theme }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: theme.shadow,
      fontSize: 12,
      color: theme.text,
    }}>
      <p style={{ margin: '0 0 6px', fontWeight: 600, color: theme.text }}>{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey ?? p.name ?? p.fill ?? 'series')} style={{ margin: '2px 0', color: theme.text }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export function BarChartWidget({
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
        <BarChart
          data={normalizedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={3}
          barCategoryGap="35%"
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: resolvedTheme.muted }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: resolvedTheme.muted }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            content={<CustomTooltip theme={resolvedTheme} />}
            contentStyle={{ ...getChartTooltipStyle(resolvedTheme) }}
            cursor={{ fill: resolvedTheme.surfaceSubtle }}
            isAnimationActive={!reducedMotion}
          />
          {normalizedSeries.length > 1 && (
            <Legend wrapperStyle={{ fontSize: 11, color: resolvedTheme.text }} content={<ChartLegend theme={resolvedTheme} />} />
          )}
          {normalizedSeries.map((s, index) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label || s.key}
              fill={getChartColor(s.color, index, resolvedTheme)}
              stackId={stacked ? 'stack' : undefined}
              radius={rounded ? [rounded, rounded, 0, 0] : undefined}
              maxBarSize={barSize || 40}
              isAnimationActive={!reducedMotion}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
