import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { TextareaProps } from '../../public/types'
import { ariaInvalidFor, sizeClass } from './internal/fieldState'

/**
 * Textarea — `<textarea class="form-control">` con ícono opcional.
 *
 * - error: borde y `aria-invalid`.
 * - rows: 4 por defecto; crece solo en vertical.
 * - controlSize: tipografía y relleno de los tamaños sm / lg.
 * - El ref apunta al `<textarea>` nativo, también con ícono.
 */
export const Textarea = /* @__PURE__ */ forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({
  icon,
  error,
  rows = 4,
  controlSize,
  className = '',
  'aria-invalid': ariaInvalid,
  ...props
}, ref) {
  const isInvalid = Boolean(error)
  const field = (
    <textarea
      {...props}
      ref={ref}
      rows={rows}
      className={cx('form-control', sizeClass('form-control', controlSize), isInvalid && 'is-invalid', className)}
      aria-invalid={ariaInvalidFor(ariaInvalid, isInvalid)}
    />
  )
  if (!icon) return field

  return (
    <div className="input-group align-items-start">
      <div className="input-group-text"><i className={icon} aria-hidden="true"></i></div>
      {field}
    </div>
  )
})
