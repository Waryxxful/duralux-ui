/**
 * Input — input con addon/ícono opcional.
 *
 * Props:
 *   icon      — feather class string, e.g. "feather-user" (alias legacy)
 *   prefix    — texto fijo delante del input (alias legacy)
 *   startAddon — nodo antes del input (input-group-text)
 *   endAddon   — nodo después del input
 *   error     — estado de error → is-invalid (alias legacy: invalid)
 *   Todos los props nativos de <input> son válidos.
 */
export function Input({ icon, prefix, startAddon, endAddon, invalid, error, className = '', ...props }) {
  const isInvalid = invalid || error
  const lead = startAddon ?? (icon ? <i className={icon}></i> : prefix != null ? prefix : null)
  const input = (
    <input className={`form-control${isInvalid ? ' is-invalid' : ''} ${className}`} {...props} />
  )
  if (lead == null && endAddon == null) return input
  return (
    <div className="input-group">
      {lead != null && <div className="input-group-text">{lead}</div>}
      {input}
      {endAddon != null && <div className="input-group-text">{endAddon}</div>}
    </div>
  )
}
