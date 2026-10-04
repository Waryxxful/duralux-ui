import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { SpinnerProps } from '../../public/types'

const DEFAULT_LABEL = 'Cargando…'

/**
 * Spinner — espera puntual y breve (una acción, un panel chico). Para contenido que se está
 * cargando usa Skeleton; los botones usan `loading`.
 *
 * - Anillo `spinner-border` (canon de la plantilla, mismo que el botón en carga).
 * - label: texto para lectores de pantalla dentro de `role="status"`. `label={null}` lo vuelve
 *   decorativo (`aria-hidden`) cuando otro elemento ya anuncia la carga.
 * - Con reduced-motion el giro se desacelera (lo resuelve Bootstrap) y sigue indicando actividad.
 */
export const Spinner = /* @__PURE__ */ forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label = DEFAULT_LABEL, tone = 'primary', className, ...rest },
  ref,
) {
  const decorative = label === null || label === ''
  const ring = (
    <span
      className={cx('spinner-border', 'gcu-spinner-ring', `gcu-spinner-ring--${size}`, `gcu-spinner-ring--${tone}`)}
      aria-hidden="true"
    />
  )
  if (decorative) {
    return <span {...rest} ref={ref} className={cx('gcu-loading-spinner', className)} aria-hidden="true">{ring}</span>
  }
  return (
    <span {...rest} ref={ref} className={cx('gcu-loading-spinner', className)} role="status">
      {ring}
      <span className="visually-hidden">{label}</span>
    </span>
  )
})
