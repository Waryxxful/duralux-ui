import { cx } from '../../utils/cx'
import { isFiniteNumber, isNonEmptyString } from '../../utils/typeGuards'

function labelText(value, fallback = 'Cargando') {
  if (isNonEmptyString(value)) return value
  if (isFiniteNumber(value)) return String(value)
  return fallback
}

/**
 * CardLoader — the public, controlled overlay for a Duralux card.
 *
 * It deliberately owns the only spinner rendered by the overlay. Consumers
 * can use it directly, or Card can compose it with `loading`.
 */
export function CardLoader({
  loading = true,
  visible = undefined,
  label = 'Cargando',
  loadingLabel = undefined,
  className = '',
  'aria-label': ariaLabel = undefined,
  ...rest
}) {
  const isVisible = visible === undefined ? Boolean(loading) : Boolean(visible)
  if (!isVisible) return null

  const accessibleLabel = labelText(loadingLabel ?? label)

  return (
    <div
      {...rest}
      className={cx('card-loader', className)}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel ?? accessibleLabel}
    >
      <span className="spinner-border text-primary" aria-hidden="true"></span>
      <span className="visually-hidden">{accessibleLabel}</span>
    </div>
  )
}
