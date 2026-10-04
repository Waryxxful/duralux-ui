import { forwardRef, useEffect, useId, useMemo, useRef } from 'react'
import { cx } from '../../utils/cx'
import type { CheckboxProps } from '../../public/types'
import { ariaInvalidFor, mergeRefs, resolveInvalid } from './internal/fieldState'

/**
 * Checkbox — `.form-check` de Bootstrap con label asociado.
 *
 * - id: respeta el del consumidor; si no hay, genera uno estable con useId.
 * - indeterminate: estado mixto (propiedad DOM + `aria-checked="mixed"`).
 * - error: borde y label en danger del tema. `invalid` está deprecado.
 * - El ref apunta al `<input type="checkbox">` nativo.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({
  label,
  invalid,
  error,
  indeterminate,
  className,
  id: idProp,
  'aria-invalid': ariaInvalid,
  'aria-checked': ariaChecked,
  ...rest
}, ref) {
  const autoId = useId()
  const id = idProp ?? autoId
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isInvalid = resolveInvalid('Checkbox', invalid, error)
  const setRefs = useMemo(() => mergeRefs(inputRef, ref), [ref])

  // `indeterminate` solo existe como propiedad DOM: se sincroniza con el sistema externo (el input).
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = Boolean(indeterminate)
  }, [indeterminate])

  return (
    <div className={cx('form-check', className)}>
      <input
        {...rest}
        ref={setRefs}
        id={id}
        type="checkbox"
        className={cx('form-check-input', isInvalid && 'is-invalid')}
        aria-invalid={ariaInvalidFor(ariaInvalid, isInvalid)}
        aria-checked={ariaChecked !== undefined ? ariaChecked : indeterminate ? 'mixed' : undefined}
      />
      <label htmlFor={id} className="form-check-label">{label}</label>
    </div>
  )
})
