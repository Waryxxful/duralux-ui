import { useState } from 'react'
import { cx } from '../../utils/cx'

/**
 * Alert — alerta con variantes de color, modo soft y opción dismissible.
 *
 * Props:
 *   variant     — "primary" | "success" | "warning" | "danger" | "info"
 *   soft        — usa clase "alert-soft-{variant}-message" en vez de "alert-{variant}"
 *                 (solo "success" | "warning" | "danger" | "teal" tienen estilo definido en el CSS)
 *   icon        — feather class string
 *   dismissible — muestra botón de cierre
 *   onDismiss   — callback al cerrar (también muestra el botón de cierre)
 *   title       — bold prefix text
 */
export function Alert({ variant = 'primary', soft = false, icon, dismissible, onDismiss, title, children }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  const closable = dismissible || onDismiss
  const toneClass = soft ? `alert-soft-${variant}-message` : `alert-${variant}`
  return (
    <div className={cx('alert', toneClass, 'd-flex align-items-center gap-3', closable && 'alert-dismissible')} role="alert">
      {icon && (
        <div className={cx('avatar-text avatar-sm rounded', `bg-${variant}`, 'text-white flex-shrink-0')}>
          <i className={icon}></i>
        </div>
      )}
      <div>
        {title && <strong>{title} </strong>}
        {children}
      </div>
      {closable && (
        <button
          type="button"
          className="btn-close ms-auto"
          onClick={() => { setVisible(false); onDismiss?.() }}
        ></button>
      )}
    </div>
  )
}
