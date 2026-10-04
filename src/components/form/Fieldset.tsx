import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import type { FieldsetProps } from '../../public/types'
import { hasContent, joinIds } from './internal/describedBy'

/**
 * Fieldset — agrupa campos relacionados con `<fieldset>` + `<legend>` («Datos de la cuenta»).
 *
 * - description y error se asocian al grupo con `aria-describedby`; el error se anuncia
 *   (`role="alert"`) y marca el grupo.
 * - columns: 1, o 2 cuando el propio contenedor mide 32rem o más (container query, no viewport).
 * - disabled nativo: deshabilita todos los controles del grupo.
 * - hideLegend: la leyenda sigue nombrando el grupo para lectores de pantalla.
 * - El ref apunta al `<fieldset>`.
 */
export const Fieldset = /* @__PURE__ */ forwardRef<HTMLFieldSetElement, FieldsetProps>(function Fieldset({
  legend,
  description,
  error,
  columns = 1,
  hideLegend = false,
  className,
  children,
  'aria-describedby': ariaDescribedBy,
  ...rest
}, ref) {
  const baseId = useId()
  const hasDescription = hasContent(description)
  const hasError = hasContent(error) && error !== true
  const descriptionId = hasDescription ? `${baseId}-description` : undefined
  const errorId = hasError ? `${baseId}-error` : undefined

  return (
    <fieldset
      {...rest}
      ref={ref}
      className={cx('gcu-fieldset', (hasError || error === true) && 'gcu-fieldset--invalid', className)}
      aria-describedby={joinIds(ariaDescribedBy, descriptionId, errorId)}
    >
      <legend className={cx('gcu-fieldset__legend', hideLegend && 'visually-hidden')}>{legend}</legend>
      {hasDescription && <p id={descriptionId} className="gcu-fieldset__description">{description}</p>}
      <div className={cx('gcu-fieldset__body', columns === 2 && 'gcu-fieldset__body--2')}>{children}</div>
      {hasError && (
        <p id={errorId} className="gcu-fieldset__error" role="alert">
          <i className="feather-alert-circle" aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  )
})
