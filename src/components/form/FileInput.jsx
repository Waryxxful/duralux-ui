import { useId } from 'react'

export function FileInput({ label, error, helpText, className, ...rest }) {
  const id = useId()

  return (
    <div className={['mb-3', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className="form-label">{label}</label>
      )}
      <input
        id={id}
        type="file"
        className={['form-control', error ? 'is-invalid' : ''].filter(Boolean).join(' ')}
        {...rest}
      />
      {typeof error === 'string' && <div className="invalid-feedback">{error}</div>}
      {helpText && !error && <div className="form-text">{helpText}</div>}
    </div>
  )
}
