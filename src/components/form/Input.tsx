import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { InputProps } from '../../public/types'
import { ariaInvalidFor, sizeClass } from './internal/fieldState'

/**
 * Input — `<input class="form-control">` con addons opcionales.
 *
 * - startAddon / endAddon: nodos dentro de `.input-group-text` antes o después del control.
 * - error: borde y `aria-invalid`; el mensaje lo muestra FormField.
 * - controlSize: alturas 32 / 36 / 40 px. El atributo nativo `size` no cambia de significado.
 * - El ref apunta siempre al `<input>` nativo, también cuando hay addons.
 */
export const Input = /* @__PURE__ */ forwardRef<HTMLInputElement, InputProps>(function Input({
  startAddon,
  endAddon,
  error,
  controlSize,
  className = '',
  'aria-invalid': ariaInvalid,
  ...props
}, ref) {
  const isInvalid = Boolean(error)
  const lead = startAddon
  const input = (
    <input
      {...props}
      ref={ref}
      className={cx('form-control', sizeClass('form-control', controlSize), isInvalid && 'is-invalid', className)}
      aria-invalid={ariaInvalidFor(ariaInvalid, isInvalid)}
    />
  )
  if (lead == null && endAddon == null) return input
  return (
    <div className={cx('input-group', controlSize === 'sm' && 'input-group-sm', controlSize === 'lg' && 'input-group-lg')}>
      {lead != null && <div className="input-group-text">{lead}</div>}
      {input}
      {endAddon != null && <div className="input-group-text">{endAddon}</div>}
    </div>
  )
})
