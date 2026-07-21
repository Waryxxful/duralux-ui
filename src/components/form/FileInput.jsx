import { useId } from 'react'

export function FileInput({
  label,
  error,
  helpText,
  className,
  id: providedId,
  'aria-describedby': providedDescribedBy,
  'aria-invalid': providedInvalid,
  ...rest
}) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const errorId = `${id}-error`
  const helpId = `${id}-help`
  const describedBy = [
    providedDescribedBy,
    typeof error === 'string' ? errorId : undefined,
    helpText && !error ? helpId : undefined,
  ].filter(Boolean).join(' ') || undefined

  return (
    <div className={['mb-3', className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={id} className="form-label">{label}</label>
      )}
      <input
        id={id}
        type="file"
        className={['form-control', error ? 'is-invalid' : ''].filter(Boolean).join(' ')}
        aria-describedby={describedBy}
        aria-invalid={error ? true : providedInvalid}
        {...rest}
      />
      {typeof error === 'string' && <div id={errorId} className="invalid-feedback">{error}</div>}
      {helpText && !error && <div id={helpId} className="form-text">{helpText}</div>}
    </div>
  )
}
