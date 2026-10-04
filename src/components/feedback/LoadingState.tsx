import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { LoadingStateProps } from '../../public/types'

const DEFAULT_MESSAGE = 'Cargando…'

/**
 * LoadingState — una sola región `status` ocupada (`aria-busy`).
 *
 * - variant="spinner" (por defecto): spinner + mensaje visible.
 * - variant="skeleton": `rows` líneas con shimmer (respeta reduced-motion); el mensaje queda
 *   como nombre accesible. Preferible en listas y cards: no hay salto al llegar los datos.
 */
export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(function LoadingState({
  message = DEFAULT_MESSAGE,
  variant = 'spinner',
  rows = 3,
  compact = false,
  className,
  ...rest
}, ref) {
  const label = typeof message === 'string' && message.trim() !== '' ? message : DEFAULT_MESSAGE
  if (variant === 'skeleton') {
    const count = Math.max(1, Math.floor(Number(rows) || 1))
    return (
      <div {...rest} ref={ref} className={cx('gcu-state-skeleton', className)} role="status" aria-busy="true" aria-label={label}>
        {Array.from({ length: count }, (_, index) => (
          <span key={index} className="gcu-skeleton gcu-skeleton--text" aria-hidden="true" />
        ))}
      </div>
    )
  }

  return (
    <div {...rest} ref={ref} className={cx('gcu-state', 'gcu-state--loading', compact && 'gcu-state--compact', className)} role="status" aria-busy="true">
      <span className="spinner-border gcu-state__spinner" aria-hidden="true" />
      {message ? <p className="gcu-state__message">{message}</p> : <span className="visually-hidden">{DEFAULT_MESSAGE}</span>}
    </div>
  )
})
