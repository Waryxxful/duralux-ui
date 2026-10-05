import { forwardRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { ModelSelectorProps, RadioGroupOption } from '../../public/types'
import { RadioGroup } from '../form/RadioGroup'
import { Segmented } from '../ui/Segmented'
import { Badge } from '../ui/Badge'

/**
 * ModelSelector — elige el modelo del asistente.
 *
 * - list: RadioGroup con nombre, etiqueta («Recomendado») y descripción de cada modelo.
 * - segmented: Segmented para 2 a 5 opciones cortas (barra del compositor).
 * - Controlado (`value`) o no controlado (`defaultValue`); avisa con `onChange`.
 * Estilos: src/styles/components/ai-controls.css.
 */
export const ModelSelector = /* @__PURE__ */ forwardRef<HTMLElement, ModelSelectorProps>(function ModelSelector(
  { models, value, defaultValue, onChange, variant = 'list', label = 'Modelo', className, ...rest },
  ref,
) {
  const [inner, setInner] = useState<string | undefined>(defaultValue ?? models.find((m) => !m.disabled)?.value)
  const current = value ?? inner
  const select = (next: string) => {
    if (value === undefined) setInner(next)
    log.debug(`ModelSelector: modelo elegido «${next}».`)
    onChange?.(next)
  }

  if (variant === 'segmented') {
    if (models.length > 5) log.warn(`ModelSelector: ${models.length} modelos no caben en segmented; usa variant="list".`)
    return (
      <Segmented<string>
        {...rest}
        // SAFETY: el ref público es HTMLElement; Segmented reenvía a un <div>.
        ref={ref as React.Ref<HTMLDivElement>}
        aria-label={label}
        size="sm"
        className={cx('gcu-ai-models', 'gcu-ai-models--segmented', className)}
        options={models.map((m) => ({ value: m.value, label: m.label, disabled: m.disabled }))}
        value={current}
        onChange={select}
      />
    )
  }

  const options: RadioGroupOption[] = models.map((m) => ({
    value: m.value,
    disabled: m.disabled,
    description: m.description,
    label: (
      <span className="gcu-ai-models__label">
        {m.label}
        {m.badge && <Badge variant="secondary" soft className="gcu-ai-models__badge">{m.badge}</Badge>}
      </span>
    ),
  }))
  return (
    <RadioGroup
      {...(rest as Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'>)}
      // SAFETY: el ref público es HTMLElement; RadioGroup reenvía a un <fieldset>.
      ref={ref as React.Ref<HTMLFieldSetElement>}
      legend={label}
      className={cx('gcu-ai-models', className)}
      options={options}
      value={current}
      onChange={(next) => select(next)}
    />
  )
})
