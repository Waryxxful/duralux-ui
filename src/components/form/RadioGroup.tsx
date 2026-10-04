import { forwardRef, useEffect, useId, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { RadioGroupProps } from '../../public/types'
import { Fieldset } from './Fieldset'
import { Radio } from './Radio'
import { hasContent } from './internal/describedBy'

/**
 * RadioGroup — una opción entre varias, con `<fieldset>` + `<legend>` (sobre Fieldset y Radio).
 * Para 2–5 opciones cortas que filtran una vista prefiere Segmented.
 *
 * - Controlado (`value` + `onChange`) o no controlado (`defaultValue`). `onChange(valor, evento)`.
 * - Flechas, Tab y Espacio: comportamiento nativo de los radios con el mismo `name`.
 * - orientation: `vertical` o `horizontal`; la horizontal vuelve a vertical cuando el contenedor
 *   mide menos de 28rem (container query).
 * - error: texto del grupo (se anuncia y se asocia) y marca cada radio como inválido.
 * - description por opción: se asocia al radio con `aria-describedby`.
 * - El ref apunta al `<fieldset>`.
 */
export const RadioGroup = /* @__PURE__ */ forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup({
  legend,
  options,
  name,
  value,
  defaultValue,
  onChange,
  orientation = 'vertical',
  helpText,
  error,
  required = false,
  className,
  ...rest
}, ref) {
  const baseId = useId()
  const groupName = name ?? `gcu-radio-group-${baseId.replace(/:/g, '')}`
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const current = value !== undefined ? value : uncontrolledValue
  const invalid = hasContent(error)
  const unknownValue = current !== undefined && !options.some((option) => option.value === current)
    ? current
    : undefined

  // Solo diagnóstico: un valor que no está entre las opciones deja el grupo sin selección.
  useEffect(() => {
    if (unknownValue !== undefined) {
      log.warn(`RadioGroup: el valor "${unknownValue}" no está entre las opciones; ninguna queda seleccionada.`)
    }
  }, [unknownValue])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setUncontrolledValue(event.target.value)
    onChange?.(event.target.value, event)
  }

  return (
    <Fieldset
      {...rest}
      ref={ref}
      legend={legend}
      description={helpText}
      error={error}
      className={cx('gcu-radio-group', className)}
    >
      <div className={cx('gcu-radio-group__options', orientation === 'horizontal' && 'gcu-radio-group__options--horizontal')}>
        {options.map((option) => {
          const optionId = `${baseId}-${option.value}`
          const descriptionId = hasContent(option.description) ? `${optionId}-description` : undefined
          return (
            <div key={option.value} className="gcu-radio-group__option">
              <Radio
                id={optionId}
                name={groupName}
                value={option.value}
                label={option.label}
                checked={current === option.value}
                onChange={handleChange}
                disabled={option.disabled}
                required={required}
                error={invalid}
                aria-describedby={descriptionId}
              />
              {descriptionId && <p id={descriptionId} className="gcu-radio-group__description">{option.description}</p>}
            </div>
          )
        })}
      </div>
    </Fieldset>
  )
})
