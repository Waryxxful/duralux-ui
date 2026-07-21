import { Fragment, cloneElement, isValidElement, useId } from 'react'

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
 */
export function FormField({ label, htmlFor, required, error, helpText, hint, className, children }) {
  const generatedId = useId()
  const help = helpText ?? hint
  const isRenderProp = typeof children === 'function'
  const fallbackId = htmlFor ?? generatedId
  const renderedContent = isRenderProp ? children(fallbackId) : children
  const isSingleControl = isValidElement(renderedContent) && renderedContent.type !== Fragment && (
    typeof renderedContent.type !== 'string' ||
    ['button', 'input', 'meter', 'output', 'progress', 'select', 'textarea'].includes(renderedContent.type)
  )
  const id = isSingleControl
    ? (renderedContent.props.id ?? fallbackId)
    : isRenderProp
      ? fallbackId
      : htmlFor
  const errorId = `${generatedId}-error`
  const helpId = `${generatedId}-help`
  const descriptionId = error ? errorId : help ? helpId : undefined

  let content = renderedContent
  if (isSingleControl) {
    const controlProps = {}

    if (renderedContent.props.id == null) controlProps.id = id
    if (descriptionId) {
      controlProps['aria-describedby'] = [renderedContent.props['aria-describedby'], descriptionId]
        .filter(Boolean)
        .join(' ')
    }
    if (required) {
      controlProps.required = true
      if (renderedContent.props['aria-required'] === undefined) controlProps['aria-required'] = true
    }
    if (error && renderedContent.props['aria-invalid'] === undefined) controlProps['aria-invalid'] = true

    content = cloneElement(renderedContent, controlProps)
  }

  return (
    <div className={`row mb-4 align-items-center${className ? ' ' + className : ''}`}>
      <div className="col-lg-4">
        <label htmlFor={id} className="fw-semibold">
          {label}{required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
        </label>
      </div>
      <div className="col-lg-8">
        {content}
        {error && <div id={errorId} className="text-danger fs-12 mt-1">{error}</div>}
        {help && !error && <div id={helpId} className="text-muted fs-12 mt-1">{help}</div>}
      </div>
    </div>
  )
}
