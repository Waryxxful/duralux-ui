import { useId } from 'react'

export function Radio({ label, error, className, ...rest }) {
  const id = useId()

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
