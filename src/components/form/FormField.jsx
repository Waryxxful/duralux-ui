import { Fragment, cloneElement, isValidElement, useId } from 'react'
import { Checkbox } from './Checkbox.jsx'
import { FileInput } from './FileInput.jsx'
import { Input } from './Input.jsx'
import { Radio } from './Radio.jsx'
import { Select } from './Select.jsx'
import { Textarea } from './Textarea.jsx'

const CONTROL_COMPONENTS = new Set([Checkbox, FileInput, Input, Radio, Select, Textarea])
const NATIVE_CONTROL_TAGS = new Set(['button', 'input', 'select', 'textarea'])
const REQUIRED_NATIVE_CONTROL_TAGS = new Set(['input', 'select', 'textarea'])

function isPackageControl(type, props) {
  if (CONTROL_COMPONENTS.has(type)) return true
  const marker = type?.duraluxFormControl
  if (marker === undefined) return false
  try {
    return typeof marker === 'function' ? Boolean(marker(props)) : Boolean(marker)
  } catch {
    return false
  }
}

function hasContent(value) {
  return value !== undefined && value !== null && value !== false && value !== ''
}

function describedByTokens(value) {
  if (typeof value !== 'string') return []
  return value.trim().split(/\s+/).filter(Boolean)
}

function appendUnique(values, next) {
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
 * FormField — fila horizontal label (col-lg-4) + control (col-lg-8).
 * Envuelve cualquier input/select/textarea en el layout Duralux.
 *
 * Props:
 *   label    — texto del label
 *   required — muestra asterisco
 *   error    — mensaje de error
 *   helpText — texto de ayuda debajo del control (alias legacy: hint)
 *   htmlFor  — id explícito del control (si no, se genera y se pasa al render-prop)
 *   className — clase extra en la fila
 *   children — nodo, o render-prop (id) => nodo para asociar el label al control
 *
 * Un único control, incluidos los wrappers compuestos de este paquete (por
 * ejemplo Input con addons o Checkbox/Radio), recibe id/required/describedby.
 * Con varios hijos no se inventa una asociación `for`: usá `htmlFor` para un
 * control principal o el render-prop para decidir las asociaciones explícitas.
 */
export function FormField({ label, htmlFor, required, error, helpText, hint, className, children }) {
  const generatedId = useId()
  const help = helpText ?? hint
  const isRenderProp = typeof children === 'function'
  const fallbackId = htmlFor ?? generatedId
  const renderedContent = isRenderProp ? children(fallbackId) : children
  const candidateType = isValidElement(renderedContent) && renderedContent.type !== Fragment
    ? renderedContent.type
    : null
  const packageControl = candidateType ? isPackageControl(candidateType, renderedContent.props) : false
  const isSingleControl = Boolean(candidateType) && (
    (typeof candidateType === 'string' && NATIVE_CONTROL_TAGS.has(candidateType))
    || packageControl
  )
  const id = isSingleControl
    ? (renderedContent.props.id ?? fallbackId)
    : isRenderProp
      ? fallbackId
      : htmlFor
  const errorId = `${generatedId}-error`
  const helpId = `${generatedId}-help`
  const hasError = hasContent(error)
  const hasHelp = hasContent(help)
  const appliesRequired = Boolean(
    required
    && isSingleControl
    && (typeof candidateType !== 'string' || REQUIRED_NATIVE_CONTROL_TAGS.has(candidateType)),
  )

  let content = renderedContent
  if (isSingleControl) {
    const controlProps = {}

    if (renderedContent.props.id == null) controlProps.id = id
    const descriptionIds = appendUnique([], describedByTokens(renderedContent.props['aria-describedby']))
    if (hasHelp) appendUnique(descriptionIds, [helpId])
    if (hasError) appendUnique(descriptionIds, [errorId])
    if (descriptionIds.length > 0) {
      controlProps['aria-describedby'] = descriptionIds.join(' ')
    }
    if (appliesRequired) {
      controlProps.required = true
      if (renderedContent.props['aria-required'] === undefined) controlProps['aria-required'] = true
    }
    if (hasError && renderedContent.props['aria-invalid'] === undefined) controlProps['aria-invalid'] = true

    content = cloneElement(renderedContent, controlProps)
  }

  return (
    <div className={`row mb-4 align-items-center${className ? ' ' + className : ''}`}>
      <div className="col-lg-4">
        <label htmlFor={id} className="fw-semibold">
          {label}{appliesRequired && <span className="text-danger ms-1" aria-hidden="true">*</span>}
        </label>
      </div>
      <div className="col-lg-8">
        {content}
        {hasHelp && <div id={helpId} className="text-muted fs-12 mt-1">{help}</div>}
        {hasError && (
          <div id={errorId} className="text-danger fs-12 mt-1" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
