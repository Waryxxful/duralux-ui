import { useId } from 'react'

/**
 * Radio — form-check Bootstrap con label asociado.
 * Respeta `id` del caller; si no hay, genera uno estable con useId.
 * (Antes useId se sobreescribía por rest.id y el label quedaba huérfano.)
 */
export function Radio({
  label,
  invalid,
  error,
  className,
  id: idProp,
  'aria-invalid': ariaInvalid,
  ...rest
}) {
  const autoId = useId()
  const id = idProp ?? autoId
  const isInvalid = Boolean(invalid || error)

  return (
    <div className={['form-check', className].filter(Boolean).join(' ')}>
      <input
        {...rest}
        id={id}
        type="radio"
        className={['form-check-input', isInvalid ? 'is-invalid' : ''].filter(Boolean).join(' ')}
        aria-invalid={ariaInvalid !== undefined ? ariaInvalid : isInvalid ? true : undefined}
      />
      <label htmlFor={id} className="form-check-label">{label}</label>
    </div>
  )
}
