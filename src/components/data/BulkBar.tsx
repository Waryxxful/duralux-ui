import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFiniteNumber, isFunction } from '../../utils/typeGuards'
import type { BulkBarProps } from '../../public/types'
import { IconButton } from '../ui/Button'
import { formatIndicatorNumber } from '../ui/internal/indicator'

function defaultCount(count: number, total?: number): string {
  const word = count === 1 ? 'seleccionado' : 'seleccionados'
  const amount = formatIndicatorNumber(count)
  return isFiniteNumber(total) ? `${amount} de ${formatIndicatorNumber(total)} ${word}` : `${amount} ${word}`
}

/**
 * BulkBar — barra de selección masiva: «3 seleccionados» + acciones + quitar selección.
 *
 * - La raíz siempre está montada: su región `status` anuncia cada cambio de cantidad (también
 *   el primero) y con 0 la barra se oculta y anuncia «Selección vacía».
 * - Aparece con opacidad + 4 px (`--gcu-ease-enter`); con reduced-motion no se anima.
 * - onClear: botón «Quitar selección». formatCount: texto propio de la cantidad.
 * Estilos: src/styles/components/bulk-bar.css.
 */
export const BulkBar = /* @__PURE__ */ forwardRef<HTMLDivElement, BulkBarProps>(function BulkBar({
  count,
  actions,
  onClear,
  total,
  formatCount,
  className,
  ...rest
}, ref) {
  const safeCount = isFiniteNumber(count) && count > 0 ? Math.floor(count) : 0
  if (!isFiniteNumber(count) || count < 0) log.warn(`BulkBar: count debe ser un número ≥ 0 (recibido: ${String(count)}).`)
  const text = safeCount > 0 ? (isFunction(formatCount) ? formatCount(safeCount, total) : defaultCount(safeCount, total)) : ''

  return (
    <div {...rest} ref={ref} className={cx('gcu-bulk-bar-host', className)} data-state={safeCount > 0 ? 'open' : 'closed'}>
      <span className="visually-hidden" role="status" aria-live="polite">
        {safeCount > 0 ? text : 'Selección vacía'}
      </span>
      {safeCount > 0 && (
        <section className="gcu-bulk-bar gcu-container" aria-label="Acciones sobre la selección">
          <div className="gcu-bulk-bar__inner">
            <p className="gcu-bulk-bar__count gcu-tabular" aria-hidden="true">{text}</p>
            {actions && <div className="gcu-bulk-bar__actions">{actions}</div>}
            {isFunction(onClear) && (
              <IconButton icon="x" label="Quitar selección" size="sm" variant="light-brand" className="gcu-bulk-bar__clear" onClick={onClear} />
            )}
          </div>
        </section>
      )}
    </div>
  )
})
