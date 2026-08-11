import { afterEach, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShellHeader } from '../src/index.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

test('opens the user menu by click without Bootstrap', async () => {
  const user = userEvent.setup()
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  render(
    <ShellHeader
      nombre="Ada Lovelace"
      email="ada@example.com"
      rol="agente"
      viewAsSa={false}
      cuentaNombre={null}
      cuentas={[]}
      apps={[]}
      dark={false}
      mini={false}
      onToggleDark={vi.fn()}
      onToggleMini={vi.fn()}
      onToggleMobileNav={vi.fn()}
      onOpenApp={vi.fn()}
      onSelectCuenta={vi.fn()}
      onVolverSa={vi.fn()}
      appHref={() => '/'}
      csrfToken="csrf-token"
    />,
  )

  const trigger = screen.getByRole('button', { name: 'Menú de usuario' })
  const menu = document.getElementById(trigger.getAttribute('aria-controls'))
  expect(trigger).not.toHaveAttribute('data-bs-toggle')
  expect(menu).not.toHaveClass('show')

  await user.click(trigger)

  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(menu).toHaveClass('show')
})

test('uses controlled mobile state for hamburger label, ARIA and active styling', () => {
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const props = {
    nombre: 'Ada Lovelace',
    email: 'ada@example.com',
    rol: 'agente',
    viewAsSa: false,
    cuentaNombre: null,
    cuentas: [],
    apps: [],
    dark: false,
    mini: false,
    onToggleDark: vi.fn(),
    onToggleMini: vi.fn(),
    onToggleMobileNav: vi.fn(),
    onOpenApp: vi.fn(),
    onSelectCuenta: vi.fn(),
    onVolverSa: vi.fn(),
    appHref: () => '/',
    csrfToken: 'csrf-token',
    mobileNavId: 'shell-nav',
  }
  const { rerender } = render(<ShellHeader {...props} mobileOpen={false} />)

  const trigger = screen.getByRole('button', { name: 'Abrir navegación móvil' })
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(trigger).toHaveAttribute('aria-controls', 'shell-nav')

  rerender(<ShellHeader {...props} mobileOpen />)
  const openTrigger = screen.getByRole('button', { name: 'Cerrar navegación móvil' })
  expect(openTrigger).toHaveAttribute('aria-expanded', 'true')
  expect(openTrigger).toHaveClass('is-active')

  openTrigger.focus()
  rerender(<ShellHeader {...props} mobileOpen={false} />)
  expect(screen.getByRole('button', { name: 'Abrir navegación móvil' })).toHaveFocus()
})

test('search closes outside and restores focus on Escape', async () => {
  const user = userEvent.setup()
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))
  render(
    <>
      <ShellHeader
        nombre="Ada Lovelace"
        email="ada@example.com"
        rol="agente"
        viewAsSa={false}
        cuentaNombre={null}
        cuentas={[]}
        apps={[]}
        dark={false}
        mini={false}
        onToggleDark={vi.fn()}
        onToggleMini={vi.fn()}
        onToggleMobileNav={vi.fn()}
        onOpenApp={vi.fn()}
        onSelectCuenta={vi.fn()}
        onVolverSa={vi.fn()}
        appHref={() => '/'}
        csrfToken="csrf-token"
      />
      <button type="button">Outside</button>
    </>,
  )

  const trigger = screen.getByRole('button', { name: 'Buscar módulo' })
  const outside = screen.getByRole('button', { name: 'Outside' })
  await user.click(trigger)
  expect(screen.getByRole('textbox', { name: 'Buscar módulo' })).toHaveFocus()

  await user.click(outside)
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(outside).toHaveFocus()

  await user.click(trigger)
  await user.keyboard('{Escape}')
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(trigger).toHaveFocus()
})

test('modules menu supports Escape and outside dismissal without placeholder anchors', async () => {
  const user = userEvent.setup()
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const app = {
    id: 1,
    nombre: 'Ventas',
    slug: 'ventas',
    icono: 'grid',
    categoria: 'Operación',
    estado: 'activo',
    modo: 'spa_remote',
    url_publica: '/ventas',
    route_prefix: '/ventas',
  }

  render(
    <>
      <ShellHeader
        nombre="Ada Lovelace"
        email="ada@example.com"
        rol="agente"
        viewAsSa={false}
        cuentaNombre={null}
        cuentas={[]}
        apps={[app]}
        dark={false}
        mini={false}
        onToggleDark={vi.fn()}
        onToggleMini={vi.fn()}
        onToggleMobileNav={vi.fn()}
        onOpenApp={vi.fn()}
        onSelectCuenta={vi.fn()}
        onVolverSa={vi.fn()}
        appHref={() => '/ventas'}
        csrfToken="csrf-token"
      />
      <button type="button">Outside</button>
    </>,
  )

  const trigger = screen.getByRole('button', { name: 'Módulos' })
  const outside = screen.getByRole('button', { name: 'Outside' })
  const menu = document.getElementById(trigger.getAttribute('aria-controls'))

  await user.click(trigger)
  expect(menu).toHaveClass('show')
  await user.keyboard('{Escape}')
  expect(menu).not.toHaveClass('show')
  expect(trigger).toHaveFocus()

  await user.click(trigger)
  await user.click(outside)
  expect(menu).not.toHaveClass('show')
  expect(outside).toHaveFocus()
  expect(document.querySelector('a[href="#"]')).toBeNull()
})

test('cleans matchMedia listeners on unmount', () => {
  const mediaQuery = {
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const { unmount } = render(
    <ShellHeader
      nombre="Ada Lovelace"
      email="ada@example.com"
      rol="agente"
      viewAsSa={false}
      cuentaNombre={null}
      cuentas={[]}
      apps={[]}
      dark={false}
      mini={false}
      onToggleDark={vi.fn()}
      onToggleMini={vi.fn()}
      onToggleMobileNav={vi.fn()}
      onOpenApp={vi.fn()}
      onSelectCuenta={vi.fn()}
      onVolverSa={vi.fn()}
      appHref={() => '/'}
      csrfToken="csrf-token"
    />,
  )

  expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  unmount()
  expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
})

test('does not render the mark-all-read action without its callback', async () => {
  const user = userEvent.setup()
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  render(
    <ShellHeader
      nombre="Ada Lovelace"
      email="ada@example.com"
      rol="agente"
      viewAsSa={false}
      cuentaNombre={null}
      cuentas={[]}
      apps={[]}
      notifications={[{
        id: 1,
        mensaje: 'Aviso',
        url: '/avisos/1',
        leida: false,
        creada_en: '2026-08-10T00:00:00Z',
        aplicacion_nombre: null,
      }]}
      dark={false}
      mini={false}
      onToggleDark={vi.fn()}
      onToggleMini={vi.fn()}
      onToggleMobileNav={vi.fn()}
      onOpenApp={vi.fn()}
      onSelectCuenta={vi.fn()}
      onVolverSa={vi.fn()}
      appHref={() => '/'}
      csrfToken="csrf-token"
    />,
  )

  await user.click(screen.getByRole('button', { name: /Notificaciones/ }))
  expect(screen.queryByRole('button', { name: /Marcar como leído/ })).not.toBeInTheDocument()
})

test('renders a safe relative time for malformed notification dates', async () => {
  const user = userEvent.setup()
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  render(
    <ShellHeader
      nombre="Ada Lovelace"
      email="ada@example.com"
      rol="agente"
      viewAsSa={false}
      cuentaNombre={null}
      cuentas={[]}
      apps={[]}
      notifications={[{
        id: 2,
        mensaje: 'Aviso inválido',
        url: '/avisos/2',
        leida: true,
        creada_en: 'not-a-date',
        aplicacion_nombre: null,
      }]}
      dark={false}
      mini={false}
      onToggleDark={vi.fn()}
      onToggleMini={vi.fn()}
      onToggleMobileNav={vi.fn()}
      onOpenApp={vi.fn()}
      onSelectCuenta={vi.fn()}
      onVolverSa={vi.fn()}
      appHref={() => '/'}
      csrfToken="csrf-token"
    />,
  )

  await user.click(screen.getByRole('button', { name: /Notificaciones/ }))
  expect(screen.getByText('Aviso inválido').parentElement).not.toHaveTextContent('NaN')
})

test('keeps the modules parent open while category disclosure handles ArrowRight, ArrowLeft and Escape', async () => {
  const user = userEvent.setup()
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const app = {
    id: 3,
    nombre: 'Ventas',
    slug: 'ventas',
    icono: 'grid',
    categoria: 'Operación',
    estado: 'activo',
    modo: 'spa_remote',
    url_publica: '/ventas',
    route_prefix: '/ventas',
  }

  render(
    <ShellHeader
      nombre="Ada Lovelace"
      email="ada@example.com"
      rol="agente"
      viewAsSa={false}
      cuentaNombre={null}
      cuentas={[]}
      apps={[app]}
      dark={false}
      mini={false}
      onToggleDark={vi.fn()}
      onToggleMini={vi.fn()}
      onToggleMobileNav={vi.fn()}
      onOpenApp={vi.fn()}
      onSelectCuenta={vi.fn()}
      onVolverSa={vi.fn()}
      appHref={() => '/ventas'}
      csrfToken="csrf-token"
    />,
  )

  const modulesTrigger = screen.getByRole('button', { name: 'Módulos' })
  await user.click(modulesTrigger)
  const category = screen.getByRole('button', { name: 'Operación' })
  const categoryMenu = document.getElementById(category.getAttribute('aria-controls'))

  category.focus()
  await user.keyboard('{ArrowRight}')
  expect(category).toHaveAttribute('aria-expanded', 'true')
  expect(categoryMenu).toHaveClass('show')
  expect(modulesTrigger).toHaveAttribute('aria-expanded', 'true')
  expect(document.getElementById(modulesTrigger.getAttribute('aria-controls'))).toHaveClass('show')

  await user.keyboard('{ArrowLeft}')
  expect(category).toHaveAttribute('aria-expanded', 'false')
  expect(category).toHaveFocus()
  expect(modulesTrigger).toHaveAttribute('aria-expanded', 'true')

  await user.keyboard('{ArrowRight}')
  await user.keyboard('{Escape}')
  expect(category).toHaveAttribute('aria-expanded', 'false')
  expect(modulesTrigger).toHaveAttribute('aria-expanded', 'true')
})

test('marks closed notification and user menus inert so their focusables stay hidden', () => {
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  render(
    <ShellHeader
      nombre="Ada Lovelace"
      email="ada@example.com"
      rol="agente"
      viewAsSa={false}
      cuentaNombre={null}
      cuentas={[]}
      apps={[]}
      notifications={[{
        id: 4,
        mensaje: 'Aviso',
        url: '/avisos/4',
        leida: false,
        creada_en: '2026-08-10T00:00:00Z',
        aplicacion_nombre: null,
      }]}
      dark={false}
      mini={false}
      onToggleDark={vi.fn()}
      onToggleMini={vi.fn()}
      onToggleMobileNav={vi.fn()}
      onOpenApp={vi.fn()}
      onSelectCuenta={vi.fn()}
      onVolverSa={vi.fn()}
      appHref={() => '/'}
      csrfToken="csrf-token"
    />,
  )

  const notificationTrigger = screen.getByRole('button', { name: /Notificaciones/ })
  const userTrigger = screen.getByRole('button', { name: 'Menú de usuario' })
  expect(document.getElementById(notificationTrigger.getAttribute('aria-controls'))).toHaveAttribute('inert')
  expect(document.getElementById(userTrigger.getAttribute('aria-controls'))).toHaveAttribute('inert')
})
