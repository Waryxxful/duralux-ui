import { useId } from 'react'
import { cx } from '../../utils/cx'

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
    <div className={cx('mb-3', className)}>
      {label && (
        <label htmlFor={id} className="form-label">{label}</label>
      )}
      <input
        id={id}
        type="file"
        className={cx('form-control', error ? 'is-invalid' : '')}
        aria-describedby={describedBy}
        aria-invalid={error ? true : providedInvalid}
        {...rest}
      />
      {typeof error === 'string' && <div id={errorId} className="invalid-feedback">{error}</div>}
      {helpText && !error && <div id={helpId} className="form-text">{helpText}</div>}
    </div>
  )
}
