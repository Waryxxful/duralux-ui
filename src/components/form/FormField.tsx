import { Fragment, cloneElement, forwardRef, isValidElement, useId } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isBoolean, isFunction, isString } from '../../utils/typeGuards'
import type { FormFieldProps } from '../../public/types'
import { Checkbox } from './Checkbox'
import { FileInput } from './FileInput'
import { Input } from './Input'
import { Radio } from './Radio'
import { Select } from './Select'
import { Textarea } from './Textarea'

/** Props de campo que FormField puede pasar a un único control. */
interface ControlProps {
  id?: string
  required?: boolean
  'aria-describedby'?: string
  'aria-required'?: React.AriaAttributes['aria-required']
  'aria-invalid'?: React.AriaAttributes['aria-invalid']
}
type ControlMarkerFn = (props: ControlProps) => boolean
type ControlType = React.ReactElement['type']

const CONTROL_COMPONENTS = new Set<ControlType>([Checkbox, FileInput, Input, Radio, Select, Textarea])
const NATIVE_CONTROL_TAGS = new Set(['button', 'input', 'select', 'textarea'])
const REQUIRED_NATIVE_CONTROL_TAGS = new Set(['input', 'select', 'textarea'])

/** Marcador `duraluxFormControl` de un componente compuesto (InputGroup, SearchableSelect…). */
function readMarker(type: ControlType): boolean | ControlMarkerFn | undefined {
  if (isString(type) || !('duraluxFormControl' in type)) return undefined
  const marker = type.duraluxFormControl
  if (isBoolean(marker)) return marker
  if (isFunction<typeof marker, ControlMarkerFn>(marker)) return marker
  return undefined
}

function isPackageControl(type: ControlType, props: ControlProps): boolean {
  if (CONTROL_COMPONENTS.has(type)) return true
  const marker = readMarker(type)
  if (marker === undefined) return false
  try {
    return isBoolean(marker) ? marker : Boolean(marker(props))
  } catch (error) {
    log.warn('FormField no pudo evaluar el marcador duraluxFormControl; el label no se asocia solo.', error)
    return false
  }
}

function hasContent(value: React.ReactNode): boolean {
  return value !== undefined && value !== null && value !== false && value !== ''
}

function describedByTokens(value: string | undefined): string[] {
  if (!isString(value)) return []
  return value.trim().split(/\s+/).filter(Boolean)
}

function appendUnique(values: string[], next: string[]): string[] {
  const seen = new Set(values)
  next.forEach((value) => {
    if (value && !seen.has(value)) {
      seen.add(value)
      values.push(value)
    }
  })
  return values
}

/**
 * FormField — label + control + ayuda + error.
 *
 * Responde a su contenedor, no al viewport: en contenedores angostos apila el label
 * sobre el control; desde 36rem de ancho los pone en fila (1/3 + 2/3).
 *
 * - Un único control (nativo o de este paquete, incluidos los compuestos con marcador
 *   `duraluxFormControl`) recibe id, required, aria-describedby y aria-invalid.
 * - Con varios hijos no se inventa la asociación: usa `htmlFor` o el render-prop `(id) => nodo`.
 * - helpText: ayuda bajo el control.
 * - El ref apunta a la fila contenedora.
 */
export const FormField = /* @__PURE__ */ forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { label, htmlFor, required, error, helpText, className, children },
  ref,
) {
  const generatedId = useId()
  const isRenderProp = isFunction<FormFieldProps['children'], (id: string) => React.ReactNode>(children)
  const fallbackId = htmlFor ?? generatedId
  const renderedContent: React.ReactNode = isFunction<FormFieldProps['children'], (id: string) => React.ReactNode>(children)
    ? children(fallbackId)
    : children
  const control = isValidElement<ControlProps>(renderedContent) && renderedContent.type !== Fragment
    ? renderedContent
    : null
  const candidateType = control ? control.type : null
  const isSingleControl = control !== null && (
    (isString(candidateType) && NATIVE_CONTROL_TAGS.has(candidateType))
    || isPackageControl(control.type, control.props)
  )
  const id = isSingleControl
    ? (control.props.id ?? fallbackId)
    : isRenderProp
      ? fallbackId
      : htmlFor
  const errorId = `${generatedId}-error`
  const helpId = `${generatedId}-help`
  const hasError = hasContent(error)
  const hasHelp = hasContent(helpText)
  const appliesRequired = Boolean(
    required
    && isSingleControl
    && (!isString(candidateType) || REQUIRED_NATIVE_CONTROL_TAGS.has(candidateType)),
  )

  let content: React.ReactNode = renderedContent
  if (isSingleControl && control) {
    const controlProps: ControlProps = {}

    if (control.props.id == null) controlProps.id = id
    const descriptionIds = appendUnique([], describedByTokens(control.props['aria-describedby']))
    if (hasHelp) appendUnique(descriptionIds, [helpId])
    if (hasError) appendUnique(descriptionIds, [errorId])
    if (descriptionIds.length > 0) {
      controlProps['aria-describedby'] = descriptionIds.join(' ')
    }
    if (appliesRequired) {
      controlProps.required = true
      if (control.props['aria-required'] === undefined) controlProps['aria-required'] = true
    }
    if (hasError && control.props['aria-invalid'] === undefined) controlProps['aria-invalid'] = true

    content = cloneElement(control, controlProps)
  }

  return (
    <div ref={ref} className={cx('gcu-form-field', className)}>
      <div className="gcu-form-field__row">
        <div className="gcu-form-field__label-col">
          <label htmlFor={id} className="gcu-form-field__label">
            {label}{appliesRequired && <span className="gcu-form-field__required" aria-hidden="true">*</span>}
          </label>
        </div>
        <div className="gcu-form-field__control-col">
          {content}
          {hasHelp && <div id={helpId} className="gcu-form-field__help">{helpText}</div>}
          {hasError && (
            <div id={errorId} className="gcu-form-field__error" role="alert" aria-live="polite">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
