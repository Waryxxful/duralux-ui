/**
 * Select — select nativo estilizado con Duralux.
 *
 * Props:
 *   options  — [{ value, label }] o [string]
 *   invalid  — estado de error
 *   Todos los props nativos de <select> son válidos.
 */
export function Select({ options = [], invalid, className = '', children, ...props }) {
  return (
    <select
      className={`form-control form-select${invalid ? ' is-invalid' : ''} ${className}`}
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
