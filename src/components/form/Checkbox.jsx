import { useId, useRef, useEffect } from 'react'
import { cx } from '../../utils/cx'

/**
 * Checkbox — form-check Bootstrap con label asociado.
 * Respeta `id` del caller; si no hay, genera uno estable con useId.
 */
export function Checkbox({
  label,
  error,
  indeterminate,
  className,
  id: idProp,
  'aria-invalid': providedInvalid,
  ...rest
}) {
  const autoId = useId()
  const id = idProp ?? autoId
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate
    }
  }, [indeterminate])

  return (
    <div className={cx('form-check', className)}>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        className={cx('form-check-input', error ? 'is-invalid' : '')}
        aria-invalid={error ? true : providedInvalid}
        {...rest}
      />
      <label htmlFor={id} className="form-check-label">{label}</label>
    </div>
  )
}
