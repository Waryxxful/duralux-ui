import { useEffect, useRef, useState } from 'react'
import { useThemeOptional } from '../../theme/ThemeProvider'
import { registerDismissableLayer } from '../../utils/dismissableLayer'
import { PLACEHOLDER_LOGO, PLACEHOLDER_LOGO_ABBR } from '../../assets/placeholders'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

/**
 * AppLayout — monta el shell Duralux (sidebar + header + footer).
 * Las clases globales del tema se aplican en <html>, como espera Duralux.
 * logo/logoAbbr caen a un placeholder real (SVG inline) si el consumidor no
 * pasa su propia marca — nunca a una ruta que no existe.
 */
export function AppLayout({
  children,
  navItems = [],
  logo = PLACEHOLDER_LOGO,
  logoAbbr = PLACEHOLDER_LOGO_ABBR,
  user = {},
  notifications = [],
  theme = 'light',
  promoCard,
}) {
  const themeContext = useThemeOptional()
  const hasThemeProvider = themeContext !== null
  const [mini, setMini] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileLayerRef = useRef(null)

  useEffect(() => {
    if (hasThemeProvider) return

    const el = document.documentElement
    const wasDark = el.classList.contains('app-skin-dark')
    const dark = theme === 'dark'
    el.classList.toggle('app-skin-dark', dark)

    return () => {
      // Do not overwrite a newer owner that changed the class while mounted.
      if (el.classList.contains('app-skin-dark') === dark) {
        el.classList.toggle('app-skin-dark', wasDark)
      }
    }
  }, [theme, hasThemeProvider])

  // minimenu en <html> — así lo espera el CSS de Duralux (html.minimenu selector)
  useEffect(() => {
    if (hasThemeProvider) return

    const el = document.documentElement
    const wasMini = el.classList.contains('minimenu')
    el.classList.toggle('minimenu', mini)

    return () => {
      if (el.classList.contains('minimenu') === mini) {
        el.classList.toggle('minimenu', wasMini)
      }
    }
  }, [mini, hasThemeProvider])

  useEffect(() => {
    if (!mobileOpen) return

    return registerDismissableLayer({
      element: mobileLayerRef.current,
      onEscape: () => setMobileOpen(false),
    })
  }, [mobileOpen])

  return (
    <>
      <Sidebar
        navItems={navItems}
        logo={logo}
        logoAbbr={logoAbbr}
        promoCard={promoCard}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <Header
        user={user}
        notifications={notifications}
        onToggleMini={themeContext?.toggleMini ?? (() => setMini((m) => !m))}
        onToggleMobile={() => setMobileOpen((m) => !m)}
      />

      <main className="nxl-container">
        <div className="nxl-content">
          <div className="main-content">
            {children}
          </div>
          <footer className="footer">
            <p className="fs-11 text-muted fw-medium text-uppercase mb-0">
              Copyright © {new Date().getFullYear()}
            </p>
            <div className="d-flex align-items-center gap-4">
              <a href="#" className="fs-11 fw-semibold text-uppercase">Ayuda</a>
              <a href="#" className="fs-11 fw-semibold text-uppercase">Términos</a>
              <a href="#" className="fs-11 fw-semibold text-uppercase">Privacidad</a>
            </div>
          </footer>
        </div>
      </main>

      {mobileOpen && (
        <div
          ref={mobileLayerRef}
          className="nxl-menu-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
