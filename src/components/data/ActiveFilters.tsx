import { forwardRef, useEffect, useId, useRef } from 'react'
import { cx } from '../../utils/cx'
import { isArray, isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'
import type { ActiveFilter, ActiveFiltersProps } from '../../public/types'
import { formatIndicatorNumber } from '../ui/internal/indicator'

function filterText(filter: ActiveFilter): string {
  if (isString(filter.textValue)) return filter.textValue
  const label = isString(filter.label) ? filter.label : filter.key
  return isString(filter.value) ? `${label}: ${filter.value}` : label
}

/**
 * ActiveFilters — filtros aplicados como chips, con «Quitar» por chip y «Limpiar filtros».
 *
 * - Cada chip muestra «Nombre: valor»; su botón dice qué quita («Quitar filtro Estado: Vencido»).
 * - Al quitar un chip el foco pasa al siguiente (o a «Limpiar filtros»): nunca se pierde.
 * - resultCount: «128 resultados», anunciado con `aria-live` al cambiar.
 * - Sin filtros no se muestra nada.
 * Estilos: src/styles/components/active-filters.css.
 */
export const ActiveFilters = /* @__PURE__ */ forwardRef<HTMLDivElement, ActiveFiltersProps>(function ActiveFilters({
  filters,
  onRemove,
  onClear,
  label = 'Filtros activos',
  resultCount,
  className,
  ...rest
}, ref) {
  const list = isArray(filters) ? filters : []
  const labelId = `gcu-active-filters-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([])
  const clearRef = useRef<HTMLButtonElement | null>(null)
  const pendingFocus = useRef<number | null>(null)

  useEffect(() => {
    const index = pendingFocus.current
    if (index === null) return
    pendingFocus.current = null
    const target = chipRefs.current[Math.min(index, list.length - 1)] ?? clearRef.current
    target?.focus()
  }, [list.length])

  if (list.length === 0) return null

  return (
    <div {...rest} ref={ref} className={cx('gcu-active-filters', className)}>
      <span id={labelId} className="gcu-active-filters__label">{label}</span>
      <ul className="gcu-active-filters__list" aria-labelledby={labelId}>
        {list.map((filter, index) => (
          <li key={filter.key} className="gcu-active-filters__chip">
            <span className="gcu-active-filters__text">
              {filter.label}
              {filter.value !== undefined && filter.value !== null && filter.value !== '' && (
                <>: <span className="gcu-active-filters__value">{filter.value}</span></>
              )}
            </span>
            <button
              ref={(node) => { chipRefs.current[index] = node }}
              type="button"
              className="gcu-active-filters__remove"
              aria-label={`Quitar filtro ${filterText(filter)}`}
              title="Quitar filtro"
              onClick={() => {
                pendingFocus.current = index
                onRemove(filter.key)
              }}
            >
              <i className="feather-x" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {isFunction(onClear) && list.length > 1 && (
        <button ref={clearRef} type="button" className="btn btn-sm btn-light-brand gcu-active-filters__clear" onClick={onClear}>
          Limpiar filtros
        </button>
      )}
      {isFiniteNumber(resultCount) && (
        <span className="gcu-active-filters__count gcu-tabular" role="status">
          {formatIndicatorNumber(resultCount)} {resultCount === 1 ? 'resultado' : 'resultados'}
        </span>
      )}
    </div>
  )
})
