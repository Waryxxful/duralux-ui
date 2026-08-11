import { cx } from '../../utils/cx'

/**
 * Textarea — textarea con ícono opcional.
 *
 * Props:
 *   icon    — feather class string
 *   error   — estado de error → is-invalid (alias legacy: invalid)
 *   rows    — número de filas (default 4)
 *   Todos los props nativos de <textarea> son válidos.
 */
export function Textarea({
  icon,
  invalid,
  error,
  rows = 4,
  className = '',
  'aria-invalid': ariaInvalid,
  ...props
}) {
  const isInvalid = Boolean(invalid || error)
  const inputProps = {
    ...props,
    className: cx('form-control', isInvalid && 'is-invalid', className),
    rows,
    'aria-invalid': ariaInvalid !== undefined ? ariaInvalid : isInvalid ? true : undefined,
  }
  if (!icon) {
    return <textarea {...inputProps} />
  }

  return (
    <div className="input-group align-items-start">
      <div className="input-group-text"><i className={icon} aria-hidden="true"></i></div>
      <textarea {...inputProps} />
    </div>
  )
}
