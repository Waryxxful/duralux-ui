import { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

/**
 * AppLayout — monta el shell Duralux (sidebar + header + footer).
 * Los atributos data-pc-* van en <html> y nxl-sidebar-mini en <body>
 * para que el CSS del tema los tome correctamente.
 */
export function AppLayout({
  children,
  navItems = [],
  logo = '/brand/logo-full.png',
  logoAbbr = '/brand/huella.png',
  user = {},
  notifications = [],
  theme = 'light',
  preset = 'preset-1',
  promoCard,
}) {
  const [mini, setMini] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // data-pc-* en <html> — el CSS del tema los busca ahí
  useEffect(() => {
    const el = document.documentElement
    el.setAttribute('data-pc-preset', preset)
    el.setAttribute('data-pc-direction', 'ltr')
    el.setAttribute('data-pc-theme', theme)
  }, [theme, preset])

  // minimenu en <html> — así lo espera el CSS de Duralux (html.minimenu selector)
  useEffect(() => {
    document.documentElement.classList.toggle('minimenu', mini)
    return () => document.documentElement.classList.remove('minimenu')
  }, [mini])

  // mob-sidebar-active en <body>
  useEffect(() => {
    document.body.classList.toggle('mob-sidebar-active', mobileOpen)
    return () => document.body.classList.remove('mob-sidebar-active')
  }, [mobileOpen])

  return (
    <>
      <Sidebar
        navItems={navItems}
        logo={logo}
        logoAbbr={logoAbbr}
        promoCard={promoCard}
      />

      <Header
        user={user}
        notifications={notifications}
        onToggleMini={() => setMini((m) => !m)}
        onToggleMobile={() => setMobileOpen((m) => !m)}
      />

      <main className="nxl-container">
        <div className="nxl-content">
          {children}
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
          className="nxl-navbar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}
