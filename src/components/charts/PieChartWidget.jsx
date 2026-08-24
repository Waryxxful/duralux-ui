import { useRef } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts'
import { ChartFrame, PieDataTable } from './chartA11y'
import { readChartDataValue, resolveChartAlternative } from './chartA11yModel'
import { usePrefersReducedMotion } from './chartMotion'
import { getChartTheme, getChartTooltipStyle, getChartColor } from './chartPalette'
import { useChartTheme } from './chartTheme'
import { ChartLegend } from './ChartLegend'
import { isArray, isFiniteNumber, isObject, isString } from '../../utils/typeGuards'

function normalizePieEntry(entry) {
  if (!entry || !isObject(entry) || isArray(entry)) return entry
  const value = readChartDataValue(entry, 'value')
  const y = readChartDataValue(entry, 'y')
  if (value !== undefined || y === undefined) return entry

  const normalized = {}
  try {
    Object.keys(entry).forEach((key) => {
      const candidate = readChartDataValue(entry, key)
      if (candidate !== undefined) normalized[key] = candidate
    })
  } catch {
    // The table and visual can still render the safe x/y point below.
  }
  normalized.name = readChartDataValue(entry, 'name') ?? readChartDataValue(entry, 'x')
  normalized.value = y
  return normalized
}

function pieEntryIdentity(entry) {
  const candidate = readChartDataValue(entry, 'id')
    ?? readChartDataValue(entry, 'name')
    ?? readChartDataValue(entry, 'label')
    ?? readChartDataValue(entry, 'value')
  const tag = isString(candidate) ? 'string' : isFiniteNumber(candidate) ? 'number' : 'slice'
  return isString(candidate) || isFiniteNumber(candidate)
    ? `${tag}:${String(candidate)}`
    : 'slice'
}

function keyedPieEntries(entries) {
  const occurrences = new Map()
  return entries.map((entry, colorIndex) => {
    const identity = pieEntryIdentity(entry)
    const occurrence = (occurrences.get(identity) ?? 0) + 1
    occurrences.set(identity, occurrence)
    return { entry, colorIndex, key: `${identity}~${occurrence}` }
  })
}

/**
 * PieChartWidget — gráfico de torta/donut estilo Duralux.
 *
 * Props:
 *   data     — [{ name, value, color }]
 *   donut    — boolean (default true — anillo)
 *   height   — número de px (default 260)
 *   legend   — mostrar leyenda (default true)
 */
export function PieChartWidget({
  data,
  donut = true,
  height = 260,
  legend = true,
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
  const normalizedData = Array.isArray(data) ? data.map(normalizePieEntry) : []
  const keyedData = keyedPieEntries(normalizedData)
  const innerRadius = donut ? '55%' : '0%'
  const reducedMotion = usePrefersReducedMotion()
  const themeScopeRef = useRef(null)
  const resolvedTheme = getChartTheme(useChartTheme(theme, themeScopeRef))
  const shouldRenderEmpty = empty === undefined ? data !== undefined && normalizedData.length === 0 : empty
  const alternative = resolveChartAlternative(
    accessibleTable,
    <PieDataTable data={normalizedData} title={title ?? ariaLabel} />,
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
        <PieChart>
          <Pie
            data={normalizedData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="80%"
            paddingAngle={3}
            dataKey="value"
            isAnimationActive={!reducedMotion}
          >
            {keyedData.map(({ entry, colorIndex, key }) => (
              <Cell
                key={key}
                fill={getChartColor(readChartDataValue(entry, 'color'), colorIndex, resolvedTheme)}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={{ ...getChartTooltipStyle(resolvedTheme) }} isAnimationActive={!reducedMotion} />
          {legend && (
            <Legend wrapperStyle={{ fontSize: 12, color: resolvedTheme.text }} content={<ChartLegend theme={resolvedTheme} />} />
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
