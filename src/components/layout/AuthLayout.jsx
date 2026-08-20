import { isString } from '../../utils/typeGuards'

/**
 * AuthLayout — auth-cover-wrapper de Duralux (duralux-admin/auth-login-cover.html:39-89).
 * Solo la variante "cover" está portada; "creative"/"minimal" quedan para cuando
 * haya demanda real (ver auth-login-creative.html / auth-login-minimal.html).
 */
export function AuthLayout({ children, image, imageAlt = '' }) {
  const hasImage = isString(image) ? image.trim() !== '' : Boolean(image)
  const accessibleImageAlt = imageAlt == null ? '' : String(imageAlt)

  return (
    <main className="auth-cover-wrapper">
      {hasImage && (
        <div className="auth-cover-content-inner">
          <div className="auth-cover-content-wrapper">
            <div className="auth-img">
              <img src={image} alt={accessibleImageAlt} className="img-fluid" />
            </div>
          </div>
        </div>
      )}
      <div className="auth-cover-sidebar-inner">
        <div className="auth-cover-card-wrapper">
          <div className="auth-cover-card p-sm-5">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
