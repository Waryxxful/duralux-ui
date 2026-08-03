import { useId } from 'react'
import { cx } from '../../utils/cx'

/**
 * Radio — form-check Bootstrap con label asociado.
 * Respeta `id` del caller; si no hay, genera uno estable con useId.
 * (Antes useId se sobreescribía por rest.id y el label quedaba huérfano.)
 */
export function Radio({ label, error, className, id: idProp, ...rest }) {
  const autoId = useId()
  const id = idProp ?? autoId

  return (
    <div className={cx('form-check', className)}>
      <input
        id={id}
        type="radio"
        className={cx('form-check-input', error ? 'is-invalid' : '')}
        {...rest}
      />
      <label htmlFor={id} className="form-check-label">{label}</label>
    </div>
  )
}
