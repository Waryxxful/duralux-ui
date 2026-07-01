import { useId } from 'react'

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
  const id = htmlFor || generatedId
  const help = helpText ?? hint
  return (
    <div className={`row mb-4 align-items-center${className ? ' ' + className : ''}`}>
      <div className="col-lg-4">
        <label htmlFor={id} className="fw-semibold">
          {label}{required && <span className="text-danger ms-1">*</span>}
        </label>
      </div>
      <div className="col-lg-8">
        {typeof children === 'function' ? children(id) : children}
        {error && <div className="text-danger fs-12 mt-1">{error}</div>}
        {help && !error && <div className="text-muted fs-12 mt-1">{help}</div>}
      </div>
    </div>
  )
}
