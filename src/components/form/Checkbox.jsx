import { useId, useRef, useEffect } from 'react'

/**
 * Checkbox — form-check Bootstrap con label asociado.
 * Respeta `id` del caller; si no hay, genera uno estable con useId.
 */
export function Checkbox({
  label,
  invalid,
  error,
  indeterminate,
  className,
  id: idProp,
  'aria-invalid': ariaInvalid,
  'aria-checked': ariaChecked,
  ...rest
}) {
  const autoId = useId()
  const id = idProp ?? autoId
  const inputRef = useRef(null)
  const isInvalid = Boolean(invalid || error)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate
    }
  }, [indeterminate])

  return (
    <div className={['form-check', className].filter(Boolean).join(' ')}>
      <input
        {...rest}
        ref={inputRef}
        id={id}
        type="checkbox"
        className={['form-check-input', isInvalid ? 'is-invalid' : ''].filter(Boolean).join(' ')}
        aria-invalid={ariaInvalid !== undefined ? ariaInvalid : isInvalid ? true : undefined}
        aria-checked={ariaChecked !== undefined ? ariaChecked : indeterminate ? 'mixed' : undefined}
      />
      <label htmlFor={id} className="form-check-label">{label}</label>
    </div>
  )
}
