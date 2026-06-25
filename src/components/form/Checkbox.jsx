import { useId, useRef, useEffect } from 'react'

export function Checkbox({ label, error, indeterminate, className, ...rest }) {
  const id = useId()
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
