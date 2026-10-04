import { forwardRef, isValidElement, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isFunction } from '../../utils/typeGuards'
import { renderIconSlot } from '../../utils/iconSlot'
import { log } from '../../utils/log'
import type { AlertProps } from '../../public/types'

const ALERT_VARIANTS = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info',
  'light', 'dark', 'teal', 'indigo',
])
const BOOTSTRAP_SOLID_VARIANTS = new Set([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark',
])

function resolveAlertVariant(variant: unknown): string {
  const candidate = String(variant || 'primary')
  if (ALERT_VARIANTS.has(candidate)) return candidate
  log.warn(`Alert: la variante "${candidate}" no existe; se usa "primary".`)
  return 'primary'
}

function hasTitle(value: React.ReactNode): boolean {
  return value !== undefined && value !== null && value !== false
}

/**
 * Alert — mensaje en línea con superficie suave del tono, ícono sólido y cierre opcional.
 *
 * - variant: tono semántico; el color nunca va solo (usa `title` o `icon`).
 * - soft: borde punteado canónico Duralux (`alert-soft-{tono}-message`).
 * - icon: clase Feather completa (`"feather-info"`) o icono Tabler (`<IconInfoCircle />`).
 * - announce: anuncia feedback dinámico en una región `status` educada.
 * - dismissible / onDismiss: muestra el botón «Cerrar».
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert({
  variant = 'primary',
  soft = false,
  icon,
  dismissible,
  onDismiss,
  title: titleContent,
  children,
  className = '',
  role,
  announce = false,
  ...rest
}, ref) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  const resolvedVariant = resolveAlertVariant(variant)
  const canDismiss = isFunction(onDismiss)
  const closable = Boolean(dismissible || canDismiss)
  const toneClass = soft
    ? `alert-soft-${resolvedVariant}-message`
    : BOOTSTRAP_SOLID_VARIANTS.has(resolvedVariant) ? `alert-${resolvedVariant}` : ''
  const iconNode = isValidElement(icon)
    ? renderIconSlot(icon)
    : icon ? <i className={icon} aria-hidden="true"></i> : null

  const dismiss = () => {
    setVisible(false)
    if (canDismiss) onDismiss()
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('alert', 'gcu-alert', `gcu-alert--${resolvedVariant}`, toneClass, closable && 'alert-dismissible', closable && 'gcu-alert--dismissible', className)}
      role={role ?? (announce ? 'status' : undefined)}
    >
      {iconNode && <span className="gcu-alert__icon">{iconNode}</span>}
      <div className="gcu-alert__body">
        {hasTitle(titleContent) && <strong className="gcu-alert__title">{titleContent} </strong>}
        {children}
      </div>
      {closable && (
        <button type="button" className="btn-close" aria-label="Cerrar" onClick={dismiss}></button>
      )}
    </div>
  )
})
