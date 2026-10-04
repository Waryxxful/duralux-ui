import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { SwitchProps } from '../../public/types'
import { hasContent, joinIds } from './internal/describedBy'

/**
 * Switch — activa o desactiva algo con efecto inmediato («Puede ingresar», «Notificar por correo»).
 * Para elegir dentro de un formulario que se guarda después, usa Checkbox.
 *
 * - `<input type="checkbox" role="switch">` nativo: Espacio lo cambia y el estado se expone como
 *   `aria-checked` (el navegador lo deriva de `checked`; si es controlado, además se declara).
 * - Etiqueta clicable (`<label htmlFor>`); `description` se asocia con `aria-describedby`.
 * - size: `sm` (pista de 28×16) o `md` (36×20). El pulgar se desliza: movimiento espacial que
 *   confirma el cambio; con reduced-motion es instantáneo (tokens).
 * - El ref apunta al `<input>` nativo.
 */
export const Switch = /* @__PURE__ */ forwardRef<HTMLInputElement, SwitchProps>(function Switch({
  label,
  description,
  size = 'md',
  className,
  id: idProp,
  checked,
  'aria-describedby': ariaDescribedBy,
  ...rest
}, ref) {
  const autoId = useId()
  const id = idProp ?? autoId
  const descriptionId = hasContent(description) ? `${id}-description` : undefined
  if (size !== 'sm' && size !== 'md') log.warn(`Switch: size "${String(size)}" no existe; se usa md.`)

  return (
    <div className={cx('gcu-switch', size === 'sm' && 'gcu-switch--sm', className)}>
      <input
        {...rest}
        ref={ref}
        id={id}
        type="checkbox"
        role="switch"
        className="form-check-input gcu-switch__input"
        checked={checked}
        aria-checked={checked === undefined ? undefined : Boolean(checked)}
        aria-describedby={joinIds(ariaDescribedBy, descriptionId)}
      />
      <span className="gcu-switch__text">
        <label htmlFor={id} className="gcu-switch__label">{label}</label>
        {descriptionId && <span id={descriptionId} className="gcu-switch__description">{description}</span>}
      </span>
    </div>
  )
})
