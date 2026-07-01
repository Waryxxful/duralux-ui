/**
 * Textarea — textarea con ícono opcional.
 *
 * Props:
 *   icon    — feather class string
 *   error   — estado de error → is-invalid (alias legacy: invalid)
 *   rows    — número de filas (default 4)
 *   Todos los props nativos de <textarea> son válidos.
 */
export function Textarea({ icon, invalid, error, rows = 4, className = '', ...props }) {
  const isInvalid = invalid || error
  if (!icon) {
    return (
      <textarea
        className={`form-control${isInvalid ? ' is-invalid' : ''} ${className}`}
        rows={rows}
        {...props}
      />
    )
  }

  return (
    <div className="input-group align-items-start">
      <div className="input-group-text"><i className={icon}></i></div>
      <textarea
        className={`form-control${isInvalid ? ' is-invalid' : ''} ${className}`}
        rows={rows}
        {...props}
      />
    </div>
  )
}
