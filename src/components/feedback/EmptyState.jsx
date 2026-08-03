/**
 * EmptyState — estado vacío con icono, título, mensaje y acción opcional.
 *
 * Props:
 *   icon      — bare feather icon name (ej. "inbox"); class built as feather-${icon}
 *   title     — título principal
 *   message   — texto descriptivo secundario
 *   action    — ReactNode (ej. un Button)
 *   className — clases adicionales
 */
import { cx } from '../../utils/cx'

export function EmptyState({
  icon = 'inbox',
  title = 'Sin resultados',
  message,
  action,
  className,
}) {
  return (
    <div className={cx('d-flex flex-column align-items-center justify-content-center text-center py-5', className)}>
      {icon && (
        <i className={`feather-${icon} mb-3`} style={{ fontSize: '3rem', opacity: 0.4 }} aria-hidden="true" />
      )}
      {title && <p className="fw-semibold fs-5 mb-1">{title}</p>}
      {message && <p className="text-muted mb-3">{message}</p>}
      {action}
    </div>
  )
}
