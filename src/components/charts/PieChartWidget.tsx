import { forwardRef, useRef } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts'
import { ChartFrame, PieDataTable } from './chartA11y'
import { readChartDataValue, resolveChartAlternative } from './chartA11yModel'
import { usePrefersReducedMotion } from './chartMotion'
import { getChartTheme, getChartTooltipStyle, getChartColor } from './chartPalette'
import { useChartTheme } from './chartTheme'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { ENTER_ANIMATION_MS } from './rechartsShared'
import { isArray, isFiniteNumber, isObject, isString } from '../../utils/typeGuards'
import type { PieChartDatum, PieChartWidgetProps } from '../../public/chart-types'

function normalizePieEntry(entry: PieChartDatum): PieChartDatum {
  if (!entry || !isObject(entry) || isArray(entry)) return entry
  const value = readChartDataValue(entry, 'value')
  const y = readChartDataValue(entry, 'y')
  if (value !== undefined || y === undefined) return entry

  const normalized: PieChartDatum = {}
  try {
    Object.keys(entry).forEach((key) => {
      const candidate = readChartDataValue(entry, key)
      if (candidate !== undefined) normalized[key] = candidate
    })
  } catch {
    // La tabla y el lienzo igual pueden dibujar el punto x/y seguro de abajo.
  }
  normalized.name = readChartDataValue(entry, 'name') ?? readChartDataValue(entry, 'x')
  normalized.value = y
  return normalized
}

function pieEntryIdentity(entry: PieChartDatum): string {
  const candidate = readChartDataValue(entry, 'id')
    ?? readChartDataValue(entry, 'name')
    ?? readChartDataValue(entry, 'label')
    ?? readChartDataValue(entry, 'value')
  const tag = isString(candidate) ? 'string' : isFiniteNumber(candidate) ? 'number' : 'slice'
  return isString(candidate) || isFiniteNumber(candidate)
    ? `${tag}:${String(candidate)}`
    : 'slice'
}

function keyedPieEntries(entries: PieChartDatum[]) {
  const occurrences = new Map<string, number>()
  return entries.map((entry, colorIndex) => {
    const identity = pieEntryIdentity(entry)
    const occurrence = (occurrences.get(identity) ?? 0) + 1
    occurrences.set(identity, occurrence)
    return { entry, colorIndex, key: `${identity}~${occurrence}` }
  })
}

/**
 * PieChartWidget — gráfico de torta o anillo con el tema del sistema.
 *
 * - data: [{ name, value, color? }] (también acepta { x, y }); donut (true); height en px (260); legend (true).
 * - Figura accesible (DX-004) con tabla de datos oculta; leyenda con forma + texto.
 * - Tooltip elevado con cifras tabulares; estados loading / empty / error; entrada que respeta reduced-motion.
 */
export const PieChartWidget = /* @__PURE__ */ forwardRef<HTMLElement, PieChartWidgetProps>(function PieChartWidget({
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
}, ref) {
  const normalizedData = Array.isArray(data) ? data.map(normalizePieEntry) : []
  const keyedData = keyedPieEntries(normalizedData)
  const innerRadius = donut ? '58%' : '0%'
  const reducedMotion = usePrefersReducedMotion()
  const themeScopeRef = useRef<HTMLElement | null>(null)
  const resolvedTheme = getChartTheme(useChartTheme(theme, themeScopeRef))
  const shouldRenderEmpty = empty === undefined ? data !== undefined && normalizedData.length === 0 : empty
  const alternative = resolveChartAlternative(
    accessibleTable,
    <PieDataTable data={normalizedData} title={title ?? ariaLabel} />,
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
      kind="pie"
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
            paddingAngle={2}
            cornerRadius={donut ? 4 : 0}
            stroke={resolvedTheme.surface}
            strokeWidth={2}
            dataKey="value"
            isAnimationActive={!reducedMotion}
            animationDuration={ENTER_ANIMATION_MS}
            animationEasing="ease-out"
          >
            {keyedData.map(({ entry, colorIndex, key }) => (
              <Cell
                key={key}
                fill={getChartColor(readChartDataValue(entry, 'color'), colorIndex, resolvedTheme)}
              />
            ))}
          </Pie>
          <Tooltip
            content={<ChartTooltip mark="circle" />}
            contentStyle={getChartTooltipStyle(resolvedTheme)}
            isAnimationActive={!reducedMotion}
          />
          {legend && (
            <Legend wrapperStyle={{ color: resolvedTheme.text }} content={<ChartLegend mark="circle" />} />
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
})
