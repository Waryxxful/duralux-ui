import type { ChartSeries } from '../../public/chart-types'
import { isFiniteNumber } from '../../utils/typeGuards'

// Piezas comunes de los widgets Recharts (Area, Bar, Line, Pie).

/** Margen del lienzo: el eje Y tiene su propio ancho (`Y_AXIS_WIDTH`), sin aire muerto extra. */
export const CARTESIAN_MARGIN = Object.freeze({ top: 8, right: 8, left: 0, bottom: 0 })

/** Ancho del eje Y: cabe una cifra es-CL de hasta 7 caracteres («120.000»). */
export const Y_AXIS_WIDTH = 48

const AXIS_NUMBER = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 })

/** Etiqueta del eje Y con miles en punto y coma decimal (formato es-CL). */
export function formatAxisTick(value: number | string): string {
  return isFiniteNumber(value) ? AXIS_NUMBER.format(value) : String(value)
}

/** La leyenda conserva el orden de las series (Recharts la ordena alfabéticamente por defecto). */
export function keepSeriesOrder(): number {
  return 0
}

/** Entrada de las marcas: crece desde el eje en 600 ms; con reduced-motion no se anima. */
export const ENTER_ANIMATION_MS = 600

/** Tamaño de las etiquetas de los ejes (el color y el tamaño fino salen de chart.css). */
export const AXIS_TICK_FONT_SIZE = 11

export function normalizeSeries(series: ReadonlyArray<ChartSeries> | undefined): ChartSeries[] {
  return Array.isArray(series) ? series.filter(Boolean) : []
}
