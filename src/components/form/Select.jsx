/**
 * Select — select nativo estilizado con Duralux.
 *
 * Props:
 *   options  — [{ value, label }] o [string]
 *   error    — estado de error → is-invalid (alias legacy: invalid)
 *   Todos los props nativos de <select> son válidos.
 */
export function Select({ options = [], invalid, error, className = '', children, ...props }) {
  const isInvalid = invalid || error
  return (
    <select
      className={`form-control form-select${isInvalid ? ' is-invalid' : ''} ${className}`}
      {...props}
    >
      {children || options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value
        const label = typeof opt === 'string' ? opt : opt.label
        return <option key={value} value={value}>{label}</option>
      })}
    </select>
  )
}
