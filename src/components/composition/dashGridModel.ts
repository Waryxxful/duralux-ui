/** Filas permitidas de DashGrid (módulo sin componentes). */
import type { DashGridSpan } from '../../public/types'

export const DASH_GRID_ROWS: ReadonlyArray<ReadonlyArray<DashGridSpan>> = [
  [12], [8, 4], [4, 8], [7, 5], [5, 7], [6, 6], [4, 4, 4], [3, 3, 3, 3],
]

/** Nombre de la fila permitida («8-4») o `null` si la combinación no está en el sistema. */
export function dashGridRowName(layout: ReadonlyArray<number>): string | null {
  const match = DASH_GRID_ROWS.find((row) => row.length === layout.length && row.every((span, index) => span === layout[index]))
  return match ? match.join('-') : null
}
