import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { isArray, isFiniteNumber, isNonEmptyString, isObject, isString } from '../../utils/typeGuards'
import { readChartDataValue } from './chartA11yModel'

/** Forma de la marca de cada serie: la serie se reconoce por forma + texto, nunca solo por color. */
export type ChartMarkKind = 'line' | 'square' | 'circle'

/** Entrada que Recharts entrega al contenido de `<Legend>`. */
export interface ChartLegendEntry {
  value?: string | number
  color?: string
  dataKey?: string | number
  type?: string
  payload?: { strokeDasharray?: string | number }
}

export interface ChartLegendProps {
  payload?: ReadonlyArray<ChartLegendEntry>
  /** Forma de la marca. Por defecto se deduce del tipo de leyenda que entrega Recharts. */
  mark?: ChartMarkKind
  /** Tema resuelto (se conserva por compatibilidad: el color del texto sale de `--gcu-text`). */
  theme?: { text?: string }
  className?: string
}

function entryIdentity(entry: ChartLegendEntry): string {
  const candidate = entry.dataKey ?? entry.value
  return isString(candidate) || isFiniteNumber(candidate) ? String(candidate) : 'serie'
}

function markFor(entry: ChartLegendEntry, mark: ChartMarkKind | undefined): ChartMarkKind {
  if (mark) return mark
  if (entry.type === 'line' || entry.type === 'plainline') return 'line'
  if (entry.type === 'circle') return 'circle'
  return 'square'
}

function isDashed(entry: ChartLegendEntry): boolean {
  const payload = isObject(entry.payload) ? entry.payload : undefined
  const dash = readChartDataValue(payload, 'strokeDasharray')
  return (isNonEmptyString(dash) && dash.trim() !== '0') || (isFiniteNumber(dash) && dash > 0)
}

/**
 * Leyenda de los gráficos Recharts: marca con forma (línea, línea punteada,
 * cuadrado o círculo) más el nombre de la serie en `--gcu-text`. El color va
 * solo en la marca; el texto siempre es legible (DX de color con significado).
 */
export const ChartLegend = /* @__PURE__ */ forwardRef<HTMLUListElement, ChartLegendProps>(function ChartLegend(
  { payload, mark, className },
  ref,
) {
  const entries = isArray(payload) ? payload.filter((entry) => entry && isObject(entry)) : []
  if (entries.length === 0) return null

  const occurrences = new Map<string, number>()
  return (
    <ul ref={ref} className={cx('gcu-chart-legend', className)}>
      {entries.map((entry) => {
        const identity = entryIdentity(entry)
        const occurrence = (occurrences.get(identity) ?? 0) + 1
        occurrences.set(identity, occurrence)
        const kind = markFor(entry, mark)
        return (
          <li key={`${identity}~${occurrence}`} className="gcu-chart-legend__item">
            <span
              aria-hidden="true"
              className={cx('gcu-chart-legend__mark', `gcu-chart-legend__mark--${kind}`, kind === 'line' && isDashed(entry) && 'gcu-chart-legend__mark--dashed')}
              style={{ color: entry.color }}
            />
            <span className="gcu-chart-legend__label">{entry.value}</span>
          </li>
        )
      })}
    </ul>
  )
})
