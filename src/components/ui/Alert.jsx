import { useState } from 'react'

/**
 * Alert — alerta con variantes de color y opción dismissible.
 *
 * Props:
 *   variant     — "primary" | "success" | "warning" | "danger" | "info"
 *   icon        — feather class string
 *   dismissible — muestra botón de cierre
 *   title       — bold prefix text
 */
export function Alert({ variant = 'primary', icon, dismissible, title, children }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className={`alert alert-${variant} d-flex align-items-center gap-3${dismissible ? ' alert-dismissible' : ''}`} role="alert">
      {icon && (
        <div className={`avatar-text avatar-sm rounded bg-${variant} text-white flex-shrink-0`}>
          <i className={icon}></i>
        </div>
      )}
      <div>
        {title && <strong>{title} </strong>}
        {children}
      </div>
      {dismissible && (
        <button
          type="button"
          className="btn-close ms-auto"
          onClick={() => setVisible(false)}
        ></button>
      )}
    </div>
  )
}
