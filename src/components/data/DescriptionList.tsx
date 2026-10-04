import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber, isString } from '../../utils/typeGuards'
import type { DescriptionListItem, DescriptionListProps } from '../../public/types'
import { formatIndicatorValue, isEmptyIndicatorValue } from '../ui/internal/indicator'

const SKELETON_ROWS = ['a', 'b', 'c', 'd']

function itemKey(item: DescriptionListItem, seen: Map<string, number>): string {
  const base = item.id !== undefined ? `id:${String(item.id)}` : isString(item.label) ? `label:${item.label}` : 'item'
  const count = (seen.get(base) ?? 0) + 1
  seen.set(base, count)
  return `${base}~${count}`
}

function resolveColumns(columns: number | undefined): 1 | 2 | 3 {
  if (columns === undefined) return 1
  if (columns === 1 || columns === 2 || columns === 3) return columns
  log.warn(`DescriptionList: columns debe ser 1, 2 o 3 (recibido: ${String(columns)}); se usa 1.`)
  return 1
}

/**
 * DescriptionList — pares etiqueta/valor (detalle de una cuenta, metadatos de una llamada).
 *
 * - columns: 1–3. Responde a su contenedor: 1 columna en angosto, 2 desde 28rem y 3 desde 42rem.
 * - Valores vacíos (`null`, `undefined`, '') muestran «—» con «Sin dato» para lectores de pantalla.
 * - Números en es-CL con cifras tabulares; `mono` para IDs y URLs; `span` para pares largos.
 * - loading: filas skeleton y `aria-busy`.
 * Estilos: src/styles/components/description-list.css.
 */
export const DescriptionList = /* @__PURE__ */ forwardRef<HTMLDivElement, DescriptionListProps>(function DescriptionList({
  items,
  columns,
  emptyValue,
  loading = false,
  className,
  ...rest
}, ref) {
  const resolvedColumns = resolveColumns(columns)
  const list = isArray(items) ? items : []
  const seen = new Map<string, number>()

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('gcu-description-list', 'gcu-container', className)}
      aria-busy={loading || rest['aria-busy'] || undefined}
    >
      <dl className={cx('gcu-description-list__grid', `gcu-description-list__grid--cols-${resolvedColumns}`)}>
        {loading
          ? SKELETON_ROWS.map((row) => (
            <div key={`skeleton-${row}`} className="gcu-description-list__item" aria-hidden="true">
              <dt><span className="gcu-skeleton gcu-skeleton--text gcu-description-list__skeleton" /></dt>
              <dd><span className="gcu-skeleton gcu-skeleton--text" /></dd>
            </div>
          ))
          : list.map((item) => {
            const empty = isEmptyIndicatorValue(item.value)
            let value: React.ReactNode
            if (!empty) value = formatIndicatorValue(item.value)
            else if (emptyValue !== undefined) value = emptyValue
            else value = <><span aria-hidden="true">—</span><span className="visually-hidden">Sin dato</span></>
            const span = item.span && item.span > 1 ? Math.min(item.span, resolvedColumns) : 1
            return (
              <div
                key={itemKey(item, seen)}
                className={cx('gcu-description-list__item', span > 1 && `gcu-description-list__item--span-${span}`)}
              >
                <dt className="gcu-description-list__label">{item.label}</dt>
                <dd
                  className={cx(
                    'gcu-description-list__value',
                    empty && 'gcu-description-list__value--empty',
                    item.mono && 'gcu-description-list__value--mono',
                    isFiniteNumber(item.value) && 'gcu-tabular',
                  )}
                >
                  {value}
                </dd>
              </div>
            )
          })}
      </dl>
      {loading && <span className="visually-hidden">Cargando</span>}
    </div>
  )
})
