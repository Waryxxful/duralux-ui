import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { isFiniteNumber, isNonEmptyString } from '../../utils/typeGuards'
import type { CardLoaderProps } from '../../public/types'

function labelText(value: CardLoaderProps['label'], fallback = 'Cargando'): string {
  if (isNonEmptyString(value)) return value
  if (isFiniteNumber(value)) return String(value)
  return fallback
}

/**
 * CardLoader — overlay controlado de carga de una card Duralux (region `status` ocupada).
 *
 * Es el único spinner del overlay. Se usa directo o vía `Card loading`.
 * Estilo en src/styles/components/card-loader.css (superficie del tema, sin override oscuro).
 */
export const CardLoader = /* @__PURE__ */ forwardRef<HTMLDivElement, CardLoaderProps>(function CardLoader({
  loading = true,
  visible = undefined,
  label = 'Cargando',
  loadingLabel = undefined,
  className = '',
  'aria-label': ariaLabel = undefined,
  ...rest
}, ref) {
  const isVisible = visible === undefined ? Boolean(loading) : Boolean(visible)
  if (!isVisible) return null

  const accessibleLabel = labelText(loadingLabel ?? label)

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('card-loader', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel ?? accessibleLabel}
    >
      <span className="spinner-border text-primary" aria-hidden="true"></span>
      <span className="visually-hidden">{accessibleLabel}</span>
    </div>
  )
})
