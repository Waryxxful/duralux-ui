import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import type { RadioProps } from '../../public/types'
import { ariaInvalidFor, resolveInvalid } from './internal/fieldState'

/**
 * Radio — `.form-check` de Bootstrap con label asociado.
 *
 * - id: respeta el del consumidor; si no hay, genera uno estable con useId.
 * - Agrupa por `name`; las flechas mueven la selección (comportamiento nativo).
 * - error: borde y label en danger del tema. `invalid` está deprecado.
 * - El ref apunta al `<input type="radio">` nativo.
 */
export const Radio = /* @__PURE__ */ forwardRef<HTMLInputElement, RadioProps>(function Radio({
  label,
  invalid,
  error,
  className,
  id: idProp,
  'aria-invalid': ariaInvalid,
  ...rest
}, ref) {
  const autoId = useId()
  const id = idProp ?? autoId
  const isInvalid = resolveInvalid('Radio', invalid, error)

  return (
    <div className={cx('form-check', className)}>
      <input
        {...rest}
        ref={ref}
        id={id}
        type="radio"
        className={cx('form-check-input', isInvalid && 'is-invalid')}
        aria-invalid={ariaInvalidFor(ariaInvalid, isInvalid)}
      />
      <label htmlFor={id} className="form-check-label">{label}</label>
    </div>
  )
})
