/**
 * Input — input con ícono opcional al inicio.
 *
 * Props:
 *   icon    — feather class string, e.g. "feather-user"
 *   prefix  — texto fijo delante del input (e.g. "https://")
 *   invalid — estado de error (agrega is-invalid)
 *   Todos los props nativos de <input> son válidos.
 */
export function Input({ icon, prefix, invalid, className = '', ...props }) {
  if (!icon && !prefix) {
    return (
      <input
        className={`form-control${invalid ? ' is-invalid' : ''} ${className}`}
        {...props}
      />
    )
  }

  return (
    <div className="input-group">
      {icon && <div className="input-group-text"><i className={icon}></i></div>}
      {prefix && <div className="input-group-text">{prefix}</div>}
      <input
        className={`form-control${invalid ? ' is-invalid' : ''} ${className}`}
        {...props}
      />
    </div>
  )
}
