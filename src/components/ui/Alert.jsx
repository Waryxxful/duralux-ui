import { useState } from 'react'
import { cx } from '../../utils/cx'

const ALERT_VARIANTS = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info',
  'light', 'dark', 'teal', 'indigo',
])
const BOOTSTRAP_SOLID_VARIANTS = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark',
])

function resolveAlertVariant(variant) {
  const candidate = String(variant || 'primary')
  return ALERT_VARIANTS.has(candidate) ? candidate : 'primary'
}

/**
 * Alert — alerta con variantes de color, modo soft y opción dismissible.
 *
 * Props:
 *   variant     — "primary" | "secondary" | "success" | "danger" | "warning" | "info" |
 *                 "light" | "dark" | "teal" | "indigo"
 *                 (solid styling is provided by .gcu-alert--{variant}; standard Bootstrap
 *                 alert-* aliases remain only where that CSS exists)
 *   soft        — usa clase "alert-soft-{variant}-message" en vez de "alert-{variant}"
 *                 (link queda fuera del contrato de variantes)
 *   icon        — feather class string
 *   dismissible — muestra botón de cierre
 *   onDismiss   — callback al cerrar (también muestra el botón de cierre)
 *   title       — bold prefix text
 */
export function Alert({
  variant = 'primary',
  soft = false,
  icon,
  dismissible,
  onDismiss,
  title: titleContent,
  children,
  className = '',
  role,
  ...rest
}) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  const resolvedVariant = resolveAlertVariant(variant)
  const canDismiss = typeof onDismiss === 'function'
  const closable = Boolean(dismissible || canDismiss)
  const toneClass = soft
    ? `alert-soft-${resolvedVariant}-message`
    : BOOTSTRAP_SOLID_VARIANTS.has(resolvedVariant) ? `alert-${resolvedVariant}` : ''
  return (
    <div
      {...rest}
      className={cx('alert', 'gcu-alert', `gcu-alert--${resolvedVariant}`, toneClass, 'd-flex align-items-center gap-3', closable && 'alert-dismissible', closable && 'gcu-alert--dismissible', className)}
      role={role ?? 'alert'}
    >
      {icon && (
        <div className={cx('gcu-alert__icon', 'avatar-text avatar-sm rounded flex-shrink-0')}>
          <i className={icon} aria-hidden="true"></i>
        </div>
      )}
      <div>
        {titleContent !== undefined && titleContent !== null && titleContent !== false && (
          <strong>{titleContent} </strong>
        )}
        {children}
      </div>
      {closable && (
        <button
          type="button"
          className="btn-close ms-auto"
          aria-label="Cerrar"
          onClick={() => { setVisible(false); if (canDismiss) onDismiss() }}
        ></button>
      )}
    </div>
  )
}
