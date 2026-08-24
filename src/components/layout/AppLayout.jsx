import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useThemeOptional } from '../../theme/ThemeProvider'
import { registerDismissableLayer } from '../../utils/dismissableLayer'
import { PLACEHOLDER_LOGO, PLACEHOLDER_LOGO_ABBR } from '../../assets/placeholders'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'

const EMPTY_NAV_ITEMS = Object.freeze([])
const EMPTY_USER = Object.freeze({})
const EMPTY_NOTIFICATIONS = Object.freeze([])

/**
 * AppLayout — monta el shell Duralux (sidebar + header + footer).
 * Las clases globales del tema se aplican en <html>, como espera Duralux.
 * logo/logoAbbr caen a un placeholder real (SVG inline) si el consumidor no
 * pasa su propia marca — nunca a una ruta que no existe.
 */
export function AppLayout({
  children,
  navItems = EMPTY_NAV_ITEMS,
  logo = PLACEHOLDER_LOGO,
  logoAbbr = PLACEHOLDER_LOGO_ABBR,
  user = EMPTY_USER,
  notifications = EMPTY_NOTIFICATIONS,
  theme = 'light',
  promoCard,
}) {
  const themeContext = useThemeOptional()
  const hasThemeProvider = themeContext !== null
  const { pathname } = useLocation()
  const navigationId = `app-layout-navigation-${useId().replace(/:/g, '')}`
  const [mini, setMini] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCloseReason, setMobileCloseReason] = useState('dismiss')
  const mobileLayerRef = useRef(null)
  const shellContentRef = useRef(null)
  const mobileTriggerRef = useRef(null)
  const mobileCloseReasonRef = useRef('dismiss')
  const previousPathnameRef = useRef(pathname)

  const closeMobile = useCallback((reason) => {
    mobileCloseReasonRef.current = reason
    setMobileCloseReason(reason)
    setMobileOpen(false)
  }, [])

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

    const navigation = document.getElementById(navigationId)
    const shellContent = shellContentRef.current
    const restoreTarget = mobileTriggerRef.current
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusables = () => [...(navigation?.querySelectorAll(focusableSelector) ?? [])]
      .filter(element => element instanceof HTMLElement && !element.closest('[hidden], [inert], [aria-hidden="true"]'))

    if (shellContent) shellContent.inert = true
    const first = focusables()[0]
    first?.focus()

    const trapFocus = (event) => {
      if (event.key !== 'Tab') return
      const entries = focusables()
      if (entries.length === 0) return
      const firstEntry = entries[0]
      const lastEntry = entries[entries.length - 1]
      if (event.shiftKey && document.activeElement === firstEntry) {
        event.preventDefault()
        lastEntry.focus()
      } else if (!event.shiftKey && document.activeElement === lastEntry) {
        event.preventDefault()
        firstEntry.focus()
      }
    }
    document.addEventListener('keydown', trapFocus)
    const dismissLayer = registerDismissableLayer({
      element: mobileLayerRef.current,
      onEscape: () => closeMobile('escape'),
    })

    return () => {
      document.removeEventListener('keydown', trapFocus)
      dismissLayer()
      if (shellContent) shellContent.inert = false
      if (['escape', 'toggle', 'overlay'].includes(mobileCloseReasonRef.current) && restoreTarget?.isConnected) {
        restoreTarget.focus()
      }
    }
  }, [closeMobile, mobileOpen, navigationId])

  // Route changes can happen without clicking a Sidebar link (navigate(),
  // browser back/forward, redirects). The mobile drawer must follow the
  // pathname, not only the local click handler.
  useEffect(() => {
    if (previousPathnameRef.current === pathname) return
    previousPathnameRef.current = pathname
    if (mobileOpen) closeMobile('programmatic')
  }, [closeMobile, mobileOpen, pathname])

  return (
    <>
      <Sidebar
        navItems={navItems}
        logo={logo}
        logoAbbr={logoAbbr}
        promoCard={promoCard}
        mobileOpen={mobileOpen}
        navigationId={navigationId}
        onNavigate={() => closeMobile('navigation')}
      />

      <div ref={shellContentRef}>
        <Header
          user={user}
          notifications={notifications}
          mini={themeContext?.mini ?? mini}
          onToggleMini={themeContext?.toggleMini ?? (() => setMini((m) => !m))}
          onToggleMobile={() => {
            if (mobileOpen) closeMobile('toggle')
            else {
              mobileTriggerRef.current = document.activeElement
              setMobileCloseReason('open')
              setMobileOpen(true)
            }
          }}
          mobileOpen={mobileOpen}
          mobileNavId={navigationId}
          mobileCloseReason={mobileCloseReason}
        />

        <main className="nxl-container">
          {/*
            PAGE-STRUCTURE: children render directly under .nxl-content so
            PageHeader can sit as a sibling of .main-content (v2 pattern).
            Pages own their own <div className="main-content"> wrapper.
          */}
          <div className="nxl-content">
            {children}
            <Footer />
          </div>
        </main>
      </div>

      {mobileOpen && (
        <button
          ref={mobileLayerRef}
          type="button"
          className="nxl-menu-overlay"
          aria-label="Cerrar menú"
          style={{ border: 0, padding: 0 }}
          onClick={() => closeMobile('overlay')}
        />
      )}
    </>
  )
}
