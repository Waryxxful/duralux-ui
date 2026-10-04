import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isArray, isFiniteNumber, isObject, isString } from '../../utils/typeGuards'
import type { ChartMarkKind } from './ChartLegend'

// Un solo formateador por módulo (no se reconstruye en cada render): miles con punto y coma decimal.
const NUMBER_FORMAT = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 })

/** Entrada que Recharts entrega al contenido de `<Tooltip>`. */
export interface ChartTooltipEntry {
  name?: string | number
  value?: string | number | ReadonlyArray<string | number>
  color?: string
  fill?: string
  stroke?: string
  dataKey?: string | number
  payload?: { fill?: string }
}

export interface ChartTooltipProps {
  active?: boolean
  label?: React.ReactNode
  payload?: ReadonlyArray<ChartTooltipEntry>
  /** Forma de la marca de cada serie (la misma de la leyenda). */
  mark?: ChartMarkKind
  className?: string
}

function formatValue(value: ChartTooltipEntry['value']): string {
  if (isFiniteNumber(value)) return NUMBER_FORMAT.format(value)
  if (isArray(value)) return value.map((item) => formatValue(item)).join(' – ')
  if (isString(value)) return value
  return '—'
}

function entryColor(entry: ChartTooltipEntry): string | undefined {
  const payloadFill = isObject(entry.payload) ? entry.payload.fill : undefined
  return entry.color ?? entry.stroke ?? entry.fill ?? payloadFill
}

/**
 * Tooltip de los gráficos Recharts: superficie elevada (`--gcu-surface-raised`,
 * `--gcu-shadow-3`), cifras tabulares alineadas a la derecha y cada serie con
 * su marca de forma + nombre. Estilos en `src/styles/components/chart.css`.
 */
export const ChartTooltip = /* @__PURE__ */ forwardRef<HTMLDivElement, ChartTooltipProps>(function ChartTooltip(
  { active, label, payload, mark = 'square', className },
  ref,
) {
  const entries = isArray(payload) ? payload.filter((entry) => entry && isObject(entry)) : []
  if (!active || entries.length === 0) return null

  const occurrences = new Map<string, number>()
  return (
    <div ref={ref} className={cx('gcu-chart-tooltip', className)}>
      {label !== undefined && label !== null && label !== '' && (
        <p className="gcu-chart-tooltip__label">{label}</p>
      )}
      <ul className="gcu-chart-tooltip__list">
        {entries.map((entry) => {
          const identity = String(entry.dataKey ?? entry.name ?? 'serie')
          const occurrence = (occurrences.get(identity) ?? 0) + 1
          occurrences.set(identity, occurrence)
          return (
            <li key={`${identity}~${occurrence}`} className="gcu-chart-tooltip__row">
              <span
                aria-hidden="true"
                className={cx('gcu-chart-legend__mark', `gcu-chart-legend__mark--${mark}`)}
                style={{ color: entryColor(entry) }}
              />
              <span className="gcu-chart-tooltip__name">{entry.name}</span>
              <span className="gcu-chart-tooltip__value">{formatValue(entry.value)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
})
