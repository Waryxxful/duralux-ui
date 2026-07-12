import { useId, useRef, useEffect } from 'react'

/**
 * Checkbox — form-check Bootstrap con label asociado.
 * Respeta `id` del caller; si no hay, genera uno estable con useId.
 */
export function Checkbox({ label, error, indeterminate, className, id: idProp, ...rest }) {
  const autoId = useId()
  const id = idProp ?? autoId
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate
    }
  }, [indeterminate])

  return (
    <div className={['form-check', className].filter(Boolean).join(' ')}>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        className={['form-check-input', error ? 'is-invalid' : ''].filter(Boolean).join(' ')}
        {...rest}
      />
      <label htmlFor={id} className="form-check-label">{label}</label>
    </div>
  )
}
