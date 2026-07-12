import { useId } from 'react'

/**
 * Radio — form-check Bootstrap con label asociado.
 * Respeta `id` del caller; si no hay, genera uno estable con useId.
 * (Antes useId se sobreescribía por rest.id y el label quedaba huérfano.)
 */
export function Radio({ label, error, className, id: idProp, ...rest }) {
  const autoId = useId()
  const id = idProp ?? autoId

  return (
    <div className={['form-check', className].filter(Boolean).join(' ')}>
      <input
        id={id}
        type="radio"
        className={['form-check-input', error ? 'is-invalid' : ''].filter(Boolean).join(' ')}
        {...rest}
      />
      <label htmlFor={id} className="form-check-label">{label}</label>
    </div>
  )
}
