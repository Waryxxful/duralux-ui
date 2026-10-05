import { forwardRef } from 'react'
import { cx } from '../../../utils/cx'
import { log } from '../../../utils/log'
import { isArray, isFiniteNumber } from '../../../utils/typeGuards'
import type { HeatmapProps } from '../../../public/types'
import { formatIndicatorNumber } from '../../ui/internal/indicator'
import { heatBounds, heatLevel } from './operationsModel'

const defaultFormat = (value: number) => formatIndicatorNumber(value)

/**
 * Heatmap — mapa de calor como tabla accesible (volumen por día y hora, abandono por franja).
 *
 * - `<table>` real con `<caption>`, encabezados de fila y columna (`scope`): se navega como tabla.
 * - Cada celda muestra su cifra (tabular); la intensidad es una escala de 5 niveles con leyenda
 *   que dice el rango de cada nivel. El máximo se marca con borde y «máximo» para lectores.
 * - Ancho: la tabla se desplaza dentro de su contenedor, nunca la página.
 * Estilos: src/styles/components/heatmap.css.
 */
export const Heatmap = /* @__PURE__ */ forwardRef<HTMLDivElement, HeatmapProps>(function Heatmap({
  rows,
  cols,
  values,
  label,
  format = defaultFormat,
  legend = true,
  hideLabel = false,
  className,
  ...rest
}, ref) {
  const rowList = isArray(rows) ? rows : []
  const colList = isArray(cols) ? cols : []
  const matrix = isArray(values) ? values : []
  if (matrix.length !== rowList.length) log.warn(`Heatmap: ${matrix.length} filas de valores para ${rowList.length} encabezados de fila.`)
  const numbers = matrix.flat().filter((value): value is number => isFiniteNumber(value))
  const min = numbers.length ? Math.min(0, ...numbers) : 0
  const max = numbers.length ? Math.max(...numbers) : 0
  const bounds = heatBounds(min, max)

  return (
    <div {...rest} ref={ref} className={cx('gcu-heatmap', className)}>
      {/* Desplazable en pantallas angostas: enfocable para moverse con el teclado (WCAG 2.1.1). */}
      <div className="gcu-heatmap__scroll gcu-scroll" tabIndex={0} role="region" aria-label={`${label} (desplazable)`}>
        <table className="gcu-heatmap__table">
          <caption className={cx('gcu-heatmap__caption', hideLabel && 'visually-hidden')}>{label}</caption>
          <thead>
            <tr>
              <td className="gcu-heatmap__corner" />
              {colList.map((col) => <th key={col} scope="col" className="gcu-heatmap__col">{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {rowList.map((row, rowIndex) => (
              <tr key={row}>
                <th scope="row" className="gcu-heatmap__row">{row}</th>
                {colList.map((col, colIndex) => {
                  const value = matrix[rowIndex]?.[colIndex]
                  if (!isFiniteNumber(value)) {
                    return (
                      <td key={col} className="gcu-heatmap__cell gcu-heatmap__cell--empty">
                        <span aria-hidden="true">—</span>
                        <span className="visually-hidden">Sin dato</span>
                      </td>
                    )
                  }
                  const isMax = numbers.length > 0 && value === max
                  return (
                    <td
                      key={col}
                      className={cx('gcu-heatmap__cell', `gcu-heatmap__cell--l${heatLevel(value, min, max)}`, isMax && 'gcu-heatmap__cell--max')}
                      title={`${row} ${col}: ${format(value)}`}
                    >
                      {format(value)}
                      {isMax && <span className="visually-hidden"> (máximo)</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {legend && numbers.length > 0 && (
        <ul className="gcu-heatmap__legend" aria-label={`Escala de ${label}`}>
          {bounds.map(([from, to], level) => (
            <li key={`l${level}-${from}`} className="gcu-heatmap__legend-item">
              <span className={cx('gcu-heatmap__swatch', `gcu-heatmap__cell--l${level}`)} aria-hidden="true" />
              <span className="gcu-tabular">{format(from)}–{format(to)}</span>
            </li>
          ))}
          <li className="gcu-heatmap__legend-item">
            <span className="gcu-heatmap__swatch gcu-heatmap__cell--max" aria-hidden="true" />
            Máximo
          </li>
        </ul>
      )}
    </div>
  )
})
