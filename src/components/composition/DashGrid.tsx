import { Children, forwardRef, isValidElement } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray } from '../../utils/typeGuards'
import type { DashGridProps, DashGridRowProps } from '../../public/types'
import { dashGridRowName } from './dashGridModel'

/**
 * DashGrid.Row — una fila de la grilla de 12 columnas. `layout` dice cuántas columnas ocupa cada
 * hijo, en orden: 12 · 8+4 · 7+5 · 6+6 · 4+4+4 · 3+3+3+3 (y 4+8 / 5+7). Otra combinación se
 * muestra igual pero avisa por consola. Cada celda es un contenedor (`.gcu-container`): las cards
 * de adentro responden al ancho de su celda, no al viewport.
 */
const DashGridRow = /* @__PURE__ */ forwardRef<HTMLDivElement, DashGridRowProps>(function DashGridRow({
  layout,
  children,
  className,
  ...rest
}, ref) {
  const spans = isArray(layout) ? layout : []
  const name = dashGridRowName(spans)
  const cells = Children.toArray(children)
  if (!name) log.warn(`DashGrid.Row: la fila ${spans.join('+') || '(vacía)'} no está permitida; usa 12, 8+4, 7+5, 6+6, 4+4+4 o 3+3+3+3.`)
  if (cells.length !== spans.length) log.warn(`DashGrid.Row: hay ${cells.length} hijos para ${spans.length} columnas de layout.`)

  return (
    <div {...rest} ref={ref} className={cx('gcu-dash-grid__row', name && `gcu-dash-grid__row--${name}`, className)}>
      {cells.map((child, index) => {
        const span = spans[index] ?? 12
        // La key del hijo ya es única (Children.toArray la asigna); la celda solo la envuelve.
        const key = isValidElement(child) && child.key !== null ? child.key : `cell-${span}`
        return (
          <div key={key} className={cx('gcu-dash-grid__cell', 'gcu-container', `gcu-dash-grid__cell--${span}`)}>
            {child}
          </div>
        )
      })}
    </div>
  )
})

/**
 * DashGrid — grilla de tablero de 12 columnas con filas permitidas y colapso por contenedor.
 *
 * - La grilla es un contenedor: bajo 36rem todas las celdas ocupan la fila completa; entre 36rem y
 *   60rem 3+3+3+3 pasa a 6+6 y 8+4 / 7+5 / 4+4+4 se apilan; desde 60rem se ve la fila pedida.
 *   El layout de la página (sidebar, header) puede usar viewport; el contenido, no.
 * - Uso: `<DashGrid><DashGrid.Row layout={[8, 4]}>…</DashGrid.Row></DashGrid>`.
 * Estilos: src/styles/components/dash-grid.css.
 */
const DashGridBase = /* @__PURE__ */ forwardRef<HTMLDivElement, DashGridProps>(function DashGrid({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} className={cx('gcu-dash-grid', 'gcu-container', className)} />
})

export const DashGrid = /* @__PURE__ */ Object.assign(DashGridBase, { Row: DashGridRow })
