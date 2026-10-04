import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import { renderIconSlot } from '../../utils/iconSlot'
import type { ChoiceCardProps } from '../../public/types'
import { hasContent, joinIds } from './internal/describedBy'

/**
 * ChoiceCard — opción seleccionable con forma de tarjeta (plan, canal, app habilitada).
 *
 * - type `radio` (una del grupo, mismo `name`) o `checkbox` (varias). El control es el input
 *   nativo: teclado, formulario y lectores de pantalla funcionan sin ARIA extra.
 * - Toda la tarjeta es la etiqueta: clic en cualquier parte selecciona.
 * - title es el nombre accesible; description se asocia con `aria-describedby`.
 * - Seleccionada: borde y fondo de marca + el control marcado (nunca solo color).
 * - El ref apunta al `<input>` nativo.
 */
export const ChoiceCard = /* @__PURE__ */ forwardRef<HTMLInputElement, ChoiceCardProps>(function ChoiceCard({
  title,
  description,
  icon,
  type = 'radio',
  error = false,
  className,
  id: idProp,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...rest
}, ref) {
  const autoId = useId()
  const id = idProp ?? autoId
  const titleId = `${id}-title`
  const descriptionId = hasContent(description) ? `${id}-description` : undefined

  return (
    <label htmlFor={id} className={cx('gcu-choice-card', error && 'gcu-choice-card--invalid', className)}>
      <input
        {...rest}
        ref={ref}
        id={id}
        type={type}
        className={cx('form-check-input', 'gcu-choice-card__input', error && 'is-invalid')}
        aria-labelledby={titleId}
        aria-describedby={joinIds(ariaDescribedBy, descriptionId)}
        aria-invalid={ariaInvalid ?? (error || undefined)}
      />
      {icon && <span className="gcu-choice-card__icon">{renderIconSlot(icon, { size: 'lg' })}</span>}
      <span className="gcu-choice-card__text">
        <span id={titleId} className="gcu-choice-card__title">{title}</span>
        {descriptionId && <span id={descriptionId} className="gcu-choice-card__description">{description}</span>}
      </span>
    </label>
  )
})
