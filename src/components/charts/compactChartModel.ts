/**
 * Piezas comunes de los gráficos compactos (Sparkline, TrendLine, Gauge, Donut): modo del tema,
 * colores literales por tema (ApexCharts no lee variables CSS) y descripción textual de la serie.
 * Módulo sin componentes.
 */
import { useCallback, useRef } from 'react'
import type * as React from 'react'
import { designTokens } from '../../tokens'
import { assignRef } from '../../utils/assignRef'
import { log } from '../../utils/log'
import { isFiniteNumber, isFunction } from '../../utils/typeGuards'
import { formatIndicatorNumber } from '../ui/internal/indicator'
import { useChartTheme } from './chartTheme'
import type { ChartTheme, CompactChartTone } from '../../public/chart-types'

export type CompactMode = 'light' | 'dark' | 'navy'

const TONES = /* @__PURE__ */ new Set<string>(['primary', 'success', 'warning', 'danger', 'info', 'indigo', 'teal', 'secondary'] satisfies CompactChartTone[])

/** Colores del tema que necesitan los gráficos compactos, como literales. */
export function compactColors(mode: CompactMode) {
  const colors = designTokens.themes[mode].colors as Record<string, string>
  return {
    tone: (tone: CompactChartTone) => colors[`status-${tone}`],
    text: colors.text,
    muted: colors.muted,
    surface: colors.surface,
    track: colors['surface-sunken'],
    onColor: designTokens.palette.slate['50'],
  }
}

export function resolveCompactTone(component: string, tone: string | undefined): CompactChartTone {
  if (tone === undefined) return 'primary'
  if (TONES.has(tone)) return tone as CompactChartTone
  log.warn(`${component}: tono desconocido "${String(tone)}"; se usa "primary".`)
  return 'primary'
}

/** Formato de las cifras: el del consumidor o es-CL. */
export function numberFormatter(formatValue: ((value: number) => string) | undefined): (value: number) => string {
  return isFunction(formatValue) ? formatValue : (value: number) => formatIndicatorNumber(value)
}

/** Resumen textual de una serie: «De 78 a 85 en 6 puntos; mínimo 78, máximo 86.» */
export function describeSeries(data: ReadonlyArray<number | null>, format: (value: number) => string): string {
  const values = data.filter((value): value is number => isFiniteNumber(value))
  if (values.length === 0) return 'Sin datos.'
  const first = values[0]
  const last = values[values.length - 1]
  let min = first
  let max = first
  for (const value of values) {
    if (value < min) min = value
    if (value > max) max = value
  }
  return `De ${format(first)} a ${format(last)} en ${values.length} puntos; mínimo ${format(min)}, máximo ${format(max)}.`
}

/**
 * Modo del tema del gráfico (sigue al ThemeScope más cercano) y un ref combinado: el interno
 * (para leer el ámbito) y el reenviado por el consumidor.
 */
export function useCompactChart(theme: ChartTheme | undefined, forwardedRef: React.ForwardedRef<HTMLElement>) {
  const scopeRef = useRef<HTMLElement | null>(null)
  const mode = useChartTheme(theme, scopeRef) as CompactMode
  const setRef = useCallback((node: HTMLElement | null) => {
    scopeRef.current = node
    assignRef(forwardedRef, node)
  }, [forwardedRef])
  return { mode, setRef }
}
