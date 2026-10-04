import type { ChartSeries } from '../../public/chart-types'

// Piezas comunes de los widgets Recharts (Area, Bar, Line, Pie).

/** Margen del lienzo: el eje Y pegado al borde, sin aire muerto a la izquierda. */
export const CARTESIAN_MARGIN = Object.freeze({ top: 8, right: 8, left: -16, bottom: 0 })

/** Entrada de las marcas: crece desde el eje en 600 ms; con reduced-motion no se anima. */
export const ENTER_ANIMATION_MS = 600

/** Tamaño de las etiquetas de los ejes (el color y el tamaño fino salen de chart.css). */
export const AXIS_TICK_FONT_SIZE = 11

export function normalizeSeries(series: ReadonlyArray<ChartSeries> | undefined): ChartSeries[] {
  return Array.isArray(series) ? series.filter(Boolean) : []
}
