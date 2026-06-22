/**
 * FormField — fila horizontal label (col-lg-4) + control (col-lg-8).
 * Envuelve cualquier input/select/textarea en el layout Duralux.
 *
 * Props:
 *   label    — texto del label
 *   htmlFor  — id del input asociado
 *   required — muestra asterisco
 *   error    — mensaje de error
 *   hint     — texto de ayuda debajo del control
 */
export function FormField({ label, htmlFor, required, error, hint, children }) {
  return (
    <div className="row mb-4 align-items-center">
      <div className="col-lg-4">
        <label htmlFor={htmlFor} className="fw-semibold">
          {label}{required && <span className="text-danger ms-1">*</span>}
        </label>
      </div>
      <div className="col-lg-8">
        {children}
        {error && <div className="text-danger fs-12 mt-1">{error}</div>}
        {hint && !error && <div className="text-muted fs-12 mt-1">{hint}</div>}
      </div>
    </div>
  )
}
