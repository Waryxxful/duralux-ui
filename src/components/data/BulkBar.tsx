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
 * - La cantidad visible es la propia región `status`: siempre está montada, así anuncia cada
 *   cambio (también el primero) sin duplicar el texto; con 0 queda oculta y anuncia «Selección vacía».
 * - Abierta, la barra es una región «Acciones sobre la selección»; cerrada, no ocupa espacio.
 * - Aparece con opacidad + 4 px (`--gcu-ease-enter`); con reduced-motion no se anima.
 * - onClear: botón «Quitar selección» (`clearLabel` cambia su nombre). formatCount: texto propio.
 * Estilos: src/styles/components/bulk-bar.css.
 */
export const BulkBar = /* @__PURE__ */ forwardRef<HTMLDivElement, BulkBarProps>(function BulkBar({
  count,
  actions,
  onClear,
  clearLabel = 'Quitar selección',
  total,
  formatCount,
  className,
  ...rest
}, ref) {
  const safeCount = isFiniteNumber(count) && count > 0 ? Math.floor(count) : 0
  if (!isFiniteNumber(count) || count < 0) log.warn(`BulkBar: count debe ser un número ≥ 0 (recibido: ${String(count)}).`)
  const open = safeCount > 0
  const text = open ? (isFunction(formatCount) ? formatCount(safeCount, total) : defaultCount(safeCount, total)) : ''

  return (
    <div {...rest} ref={ref} className={cx('gcu-bulk-bar-host', className)} data-state={open ? 'open' : 'closed'}>
      <div
        className={open ? 'gcu-bulk-bar gcu-container' : undefined}
        role={open ? 'region' : undefined}
        aria-label={open ? 'Acciones sobre la selección' : undefined}
      >
        <div className={open ? 'gcu-bulk-bar__inner' : undefined}>
          <p className={open ? 'gcu-bulk-bar__count gcu-tabular' : 'visually-hidden'} role="status" aria-live="polite">
            {open ? text : 'Selección vacía'}
          </p>
          {open && actions && <div className="gcu-bulk-bar__actions">{actions}</div>}
          {open && isFunction(onClear) && (
            <IconButton icon="x" label={clearLabel} size="sm" variant="light-brand" className="gcu-bulk-bar__clear" onClick={onClear} />
          )}
        </div>
      </div>
    </div>
  )
})
