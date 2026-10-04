import { forwardRef, useId } from 'react'
import { isString } from '../../utils/typeGuards'
import { Icon } from '../ui/Icon'
import type { AuthLayoutProps } from '../../public/types'

function hasNode(value: unknown): boolean {
  if (value === null || value === undefined || value === false || value === true) return false
  return isString(value) ? value.trim() !== '' : true
}

/**
 * AuthLayout — pantalla de acceso (auth-cover-wrapper de Duralux) con tokens.
 *
 * - `title` (h1) y `description` encabezan la tarjeta; `children` es el formulario.
 * - `error` se anuncia con `role="alert"` (lectores de pantalla lo leen al aparecer) y lleva
 *   `errorId` para que el formulario lo enlace con `aria-describedby`.
 * - La imagen de portada es decorativa por defecto (`imageAlt=""`).
 * - El ref apunta al `<main>`.
 */
export const AuthLayout = /* @__PURE__ */ forwardRef<HTMLElement, AuthLayoutProps>(function AuthLayout({
  children,
  image,
  imageAlt = '',
  title,
  description,
  error,
  errorId: errorIdProp,
  footer,
}, ref) {
  const autoId = useId()
  const errorId = errorIdProp ?? `gcu-auth-error-${autoId.replace(/:/g, '')}`
  const imageSrc = isString(image) && image.trim() !== '' ? image : undefined
  const accessibleImageAlt = imageAlt == null ? '' : String(imageAlt)

  return (
    <main ref={ref} className="auth-cover-wrapper gcu-auth">
      {imageSrc && (
        <div className="auth-cover-content-inner">
          <div className="auth-cover-content-wrapper">
            <div className="auth-img">
              <img src={imageSrc} alt={accessibleImageAlt} className="img-fluid" />
            </div>
          </div>
        </div>
      )}
      <div className="auth-cover-sidebar-inner">
        <div className="auth-cover-card-wrapper">
          <div className="auth-cover-card p-sm-5">
            {hasNode(title) && <h1 className="gcu-auth__title">{title}</h1>}
            {hasNode(description) && <p className="gcu-auth__description">{description}</p>}
            {hasNode(error) && (
              <div id={errorId} role="alert" className="gcu-auth__error">
                <Icon name="alert-circle" className="gcu-auth__error-icon" />
                <div>{error}</div>
              </div>
            )}
            {children}
            {hasNode(footer) && <div className="gcu-auth__footer">{footer}</div>}
          </div>
        </div>
      </div>
    </main>
  )
})
