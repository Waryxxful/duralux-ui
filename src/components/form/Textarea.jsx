/**
 * Textarea — textarea con ícono opcional.
 *
 * Props:
 *   icon    — feather class string
 *   invalid — estado de error
 *   rows    — número de filas (default 4)
 *   Todos los props nativos de <textarea> son válidos.
 */
export function Textarea({ icon, invalid, rows = 4, className = '', ...props }) {
  if (!icon) {
    return (
      <textarea
        className={`form-control${invalid ? ' is-invalid' : ''} ${className}`}
        rows={rows}
        {...props}
      />
    )
  }

  return (
    <div className="input-group align-items-start">
      <div className="input-group-text"><i className={icon}></i></div>
      <textarea
        className={`form-control${invalid ? ' is-invalid' : ''} ${className}`}
        rows={rows}
        {...props}
      />
    </div>
  )
}
