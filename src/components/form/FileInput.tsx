import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import { isString } from '../../utils/typeGuards'
import type { FileInputProps } from '../../public/types'
import { sizeClass } from './internal/fieldState'

/**
 * FileInput — `<input type="file">` con label, ayuda y error enlazados.
 *
 * - El botón nativo (`::file-selector-button`) toma superficie y texto de los tokens,
 *   así se lee en claro, oscuro y navy (DX-010).
 * - error string: mensaje enlazado por `aria-describedby`; booleano: solo marca inválido.
 * - controlSize: alturas 32 / 36 / 40 px.
 * - El ref apunta al `<input>` nativo.
 */
export const FileInput = /* @__PURE__ */ forwardRef<HTMLInputElement, FileInputProps>(function FileInput({
  label,
  error,
  helpText,
  controlSize,
  className,
  id: providedId,
  'aria-describedby': providedDescribedBy,
  'aria-invalid': providedInvalid,
  ...rest
}, ref) {
  const generatedId = useId()
  const id = providedId ?? generatedId
  const errorId = `${id}-error`
  const helpId = `${id}-help`
  const describedBy = [
    providedDescribedBy,
    isString(error) ? errorId : undefined,
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
        className={cx('form-control', 'gcu-file-input', sizeClass('form-control', controlSize), error ? 'is-invalid' : '')}
        aria-describedby={describedBy}
        aria-invalid={error ? true : providedInvalid}
        {...rest}
        ref={ref}
      />
      {isString(error) && <div id={errorId} className="invalid-feedback">{error}</div>}
      {helpText && !error && <div id={helpId} className="form-text">{helpText}</div>}
    </div>
  )
})
