import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber, isString } from '../../utils/typeGuards'
import type { RankListItem, RankListProps } from '../../public/types'
import { formatIndicatorNumber, hasIndicatorContent, resolveTone } from '../ui/internal/indicator'

const SKELETON_ROWS = ['a', 'b', 'c', 'd']

function rankKey(item: RankListItem, seen: Map<string, number>): string {
  const base = item.id !== undefined ? `id:${String(item.id)}` : isString(item.label) ? `label:${item.label}` : 'rank'
  const count = (seen.get(base) ?? 0) + 1
  seen.set(base, count)
  return `${base}~${count}`
}

/**
 * RankList — ranking de 3 a 6 filas con barra proporcional (motivos de llamada, colas, agentes).
 *
 * - Cada fila: puesto, etiqueta, meta, cifra es-CL tabular (con `unit`) y barra decorativa:
 *   la cifra en texto es la información; la barra solo la acompaña.
 * - max: valor de la barra completa (por defecto el máximo de la lista). tone por fila.
 * - Para distribuciones de más de 6 categorías, esta lista reemplaza al Donut.
 * - loading: skeleton y `aria-busy`; vacío con `emptyText`.
 * Estilos: src/styles/components/rank-list.css.
 */
export const RankList = /* @__PURE__ */ forwardRef<HTMLDivElement, RankListProps>(function RankList({
  items,
  unit,
  max,
  label,
  loading = false,
  emptyText = 'Sin datos para este periodo.',
  className,
  ...rest
}, ref) {
  const list = isArray(items) ? items : []
  if (!loading && list.length > 6) log.warn(`RankList: muestra de 3 a 6 filas (recibidas: ${list.length}); resume el resto en «Otros».`)
  const top = isFiniteNumber(max) && max > 0 ? max : Math.max(1, ...list.map((item) => (isFiniteNumber(item.value) ? item.value : 0)))
  const seen = new Map<string, number>()

  return (
    <div {...rest} ref={ref} className={cx('gcu-rank-list', 'gcu-container', className)} aria-busy={loading || rest['aria-busy'] || undefined}>
      {loading ? (
        <>
          <ol className="gcu-rank-list__list" aria-hidden="true">
            {SKELETON_ROWS.map((row) => (
              <li key={`skeleton-${row}`} className="gcu-rank-list__item">
                <span className="gcu-skeleton gcu-skeleton--text gcu-rank-list__skeleton" />
              </li>
            ))}
          </ol>
          <span className="visually-hidden">Cargando</span>
        </>
      ) : list.length === 0 ? (
        <p className="gcu-rank-list__empty">{emptyText}</p>
      ) : (
        <ol className="gcu-rank-list__list" aria-label={label}>
          {list.map((item, index) => {
            const value = isFiniteNumber(item.value) ? item.value : 0
            const ratio = Math.max(0, Math.min(1, value / top))
            const tone = resolveTone('RankList', item.tone, undefined, 'primary')
            return (
              <li key={rankKey(item, seen)} className={cx('gcu-rank-list__item', `gcu-rank-list__item--${tone}`)}>
                <span className="gcu-rank-list__rank gcu-tabular" aria-hidden="true">{index + 1}</span>
                <span className="gcu-rank-list__label">
                  <span className="gcu-rank-list__name">{item.label}</span>
                  {hasIndicatorContent(item.meta) && <span className="gcu-rank-list__meta">{item.meta}</span>}
                </span>
                <span className="gcu-rank-list__value gcu-tabular">
                  {item.display ?? formatIndicatorNumber(value)}
                  {unit && <span className="gcu-rank-list__unit"> {unit}</span>}
                </span>
                <span className="gcu-rank-list__bar" aria-hidden="true">
                  <span className="gcu-rank-list__fill" style={{ width: `${Math.round(ratio * 1000) / 10}%` }} />
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
})
