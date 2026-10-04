import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { deprecate } from '../../utils/log'
import type { InputProps } from '../../public/types'
import { ariaInvalidFor, resolveInvalid, sizeClass } from './internal/fieldState'

/**
 * Input — `<input class="form-control">` con addons opcionales.
 *
 * - startAddon / endAddon: nodos dentro de `.input-group-text` antes o después del control.
 * - error: borde y `aria-invalid`; el mensaje lo muestra FormField. `invalid` está deprecado.
 * - controlSize: alturas 32 / 36 / 40 px. El atributo nativo `size` no cambia de significado.
 * - icon / prefix: alias deprecados de startAddon.
 * - El ref apunta siempre al `<input>` nativo, también cuando hay addons.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  icon,
  prefix,
  startAddon,
  endAddon,
  invalid,
  error,
  controlSize,
  className = '',
  'aria-invalid': ariaInvalid,
  ...props
}, ref) {
  if (icon) deprecate('input-icon', 'la prop `icon` de Input es un alias; usa startAddon={<i className="feather-…" aria-hidden="true" />}.')
  if (prefix != null) deprecate('input-prefix', 'la prop `prefix` de Input es un alias; usa `startAddon`.')
  const isInvalid = resolveInvalid('Input', invalid, error)
  const lead = startAddon ?? (icon ? <i className={icon} aria-hidden="true"></i> : prefix != null ? prefix : null)
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
