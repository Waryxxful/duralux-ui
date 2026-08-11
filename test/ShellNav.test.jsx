import { render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import userEvent from '@testing-library/user-event'
import { afterEach, test, expect, vi } from 'vitest'
import { ShellNav } from '../src/index.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

const brand = {
  href: '/',
  logoLg: '/logo.svg',
  logoSm: '/logo-sm.svg',
  alt: 'GranCRM',
}

const sections = [
  {
    caption: 'Aplicación',
    items: [
      { label: 'Resumen', icon: 'grid', href: '/app' },
      {
        label: 'Configuración',
        icon: 'settings',
        children: [
          { label: 'Usuarios', icon: 'users', href: '/app/settings/users' },
        ],
      },
    ],
  },
]

test('derives the active leaf and ancestor from pathname without importing Router', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn((href, event) => event.preventDefault())
  const { rerender } = render(
    <ShellNav
      brand={brand}
      sections={sections}
      pathname="/app/settings/users"
      onNavigate={onNavigate}
    />,
  )

  const group = screen.getByRole('button', { name: 'Configuración' })
  const submenu = document.getElementById(group.getAttribute('aria-controls'))
  const users = screen.getByRole('link', { name: 'Usuarios' })

  expect(group).toHaveAttribute('aria-expanded', 'true')
  expect(group.closest('li')).toHaveClass('active', 'nxl-trigger')
  expect(submenu).toHaveClass('nxl-menu-visible')
  expect(users).toHaveAttribute('aria-current', 'page')

  await user.click(users)
  expect(onNavigate).toHaveBeenCalledWith('/app/settings/users', expect.anything())

  rerender(
    <ShellNav
      brand={brand}
      sections={sections}
      pathname="/app"
      onNavigate={onNavigate}
    />,
  )

  expect(screen.getByRole('link', { name: 'Resumen' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Usuarios' })).not.toHaveAttribute('aria-current')
  expect(screen.getByRole('button', { name: 'Configuración' }).closest('li')).not.toHaveClass('active')
})

test('keeps nested menus mounted and toggles them with keyboard-accessible buttons', async () => {
  const user = userEvent.setup()
  render(
    <ShellNav brand={brand} sections={sections} onNavigate={vi.fn()} />,
  )

  const group = screen.getByRole('button', { name: 'Configuración' })
  const submenu = document.getElementById(group.getAttribute('aria-controls'))

  expect(submenu).toHaveClass('nxl-menu-hidden')
  expect(submenu).toHaveAttribute('aria-hidden', 'true')
  expect(submenu).toHaveAttribute('inert')

  await user.click(group)
  expect(group).toHaveAttribute('aria-expanded', 'true')
  expect(submenu).toHaveClass('nxl-menu-visible')

  await user.keyboard('{ArrowLeft}')
  expect(group).toHaveAttribute('aria-expanded', 'false')
})

test('keeps a non-navigating disclosure trigger inactive without an active descendant', () => {
  render(
    <ShellNav
      brand={brand}
      sections={[{
        items: [{
          label: 'Configuración',
          icon: 'settings',
          href: '/app/settings',
          children: [{ label: 'Usuarios', icon: 'users', href: '/app/settings/users' }],
        }],
      }]}
      pathname="/app/settings"
      onNavigate={vi.fn()}
    />,
  )

  expect(screen.getByRole('button', { name: 'Configuración' }).closest('li')).not.toHaveClass('active')
  expect(screen.getByRole('button', { name: 'Configuración' })).not.toHaveAttribute('aria-current')
})

test('reflects controlled mobile state on the navigation landmark', () => {
  render(
    <ShellNav
      brand={brand}
      sections={sections}
      onNavigate={vi.fn()}
      mobileOpen
      navigationId="shell-navigation"
    />,
  )

  expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toHaveAttribute('id', 'shell-navigation')
  expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toHaveClass('mob-navigation-active')
})

test('keeps the brand name on the link and removes closed descendants from Tab order', async () => {
  const user = userEvent.setup()
  const { container } = render(
    <ShellNav
      brand={brand}
      sections={[{
        items: [
          {
            label: 'Configuración',
            icon: 'settings',
            children: [{ label: 'Usuarios', icon: 'users', href: '/users' }],
          },
          { label: 'Después', icon: 'arrow-right', href: '/after' },
        ],
      }]}
      onNavigate={vi.fn()}
    />,
  )

  expect(container.querySelector('.b-brand')).toHaveAccessibleName('GranCRM')
  expect(container.querySelector('.logo-lg')).toHaveAttribute('alt', '')
  expect(container.querySelector('.logo-sm')).toHaveAttribute('alt', '')

  const group = screen.getByRole('button', { name: 'Configuración' })
  const after = screen.getByRole('link', { name: 'Después' })
  const users = screen.getByText('Usuarios').closest('a')

  group.focus()
  await user.tab()
  expect(document.activeElement).toBe(after)

  await user.click(group)
  group.focus()
  await user.tab()
  expect(document.activeElement).toBe(users)
})

test('selects one most-specific current route even when destinations duplicate', () => {
  const { container } = render(
    <ShellNav
      brand={brand}
      pathname="/app/reports"
      sections={[{
        items: [
          { label: 'Reports first', icon: 'bar-chart', href: '/app/reports' },
          { label: 'Reports duplicate', icon: 'bar-chart', href: '/app/reports' },
          { label: 'Reports child', icon: 'bar-chart', href: '/app/reports/42' },
        ],
      }]}
      onNavigate={vi.fn()}
    />,
  )

  expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  expect(screen.getByRole('link', { name: 'Reports first' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Reports duplicate' })).not.toHaveAttribute('aria-current')
})

test('marks only the most-specific leaf active across route prefixes', () => {
  const { container } = render(
    <ShellNav
      brand={brand}
      pathname="/app/users"
      sections={[{
        items: [
          { label: 'App', icon: 'grid', href: '/app' },
          { label: 'Users', icon: 'users', href: '/app/users' },
          {
            label: 'Administration',
            icon: 'settings',
            children: [{ label: 'Teams', icon: 'users', href: '/app/users/teams' }],
          },
        ],
      }]}
      onNavigate={vi.fn()}
    />,
  )

  expect(screen.getByRole('link', { name: 'App' }).closest('li')).not.toHaveClass('active')
  expect(screen.getByRole('link', { name: 'App' })).not.toHaveAttribute('aria-current')
  expect(screen.getByRole('link', { name: 'Users' }).closest('li')).toHaveClass('active')
  expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('button', { name: 'Administration' }).closest('li')).not.toHaveClass('active')
  expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
})

test('restores focus to a group trigger when a focused submenu is closed programmatically', async () => {
  const user = userEvent.setup()
  render(
    <ShellNav
      brand={brand}
      sections={[{
        items: [
          { label: 'First', icon: 'grid', children: [{ label: 'Child', icon: 'users', href: '/child' }] },
          { label: 'Second', icon: 'settings', children: [{ label: 'Other child', icon: 'users', href: '/other' }] },
        ],
      }]}
      onNavigate={vi.fn()}
    />,
  )

  const first = screen.getByRole('button', { name: 'First' })
  const second = screen.getByRole('button', { name: 'Second' })
  await user.click(first)
  screen.getByRole('link', { name: 'Child' }).focus()

  // fireEvent preserves the focused descendant while the sibling disclosure
  // closes the first submenu.
  second.click()

  await waitFor(() => expect(first).toHaveFocus())
})

test('makes a closed mobile navigation inert after media-query enhancement', async () => {
  const mediaQuery = {
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const { container } = render(
    <ShellNav
      brand={brand}
      sections={sections}
      mobileOpen={false}
      onNavigate={vi.fn()}
    />,
  )

  const nav = container.querySelector('.nxl-navigation')
  expect(nav.querySelector('.nxl-caption label')).toBeNull()
  expect(nav.querySelector('.nxl-caption span')).toHaveTextContent('Aplicación')
  await waitFor(() => {
    expect(nav).toHaveAttribute('aria-hidden', 'true')
    expect(nav).toHaveAttribute('inert')
  })
  expect(container.querySelector('.b-brand')).toHaveAttribute('tabindex', '-1')
  expect(container.querySelector('a[aria-label="Resumen"]')).toHaveAttribute('tabindex', '-1')
  expect(mediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

  mediaQuery.matches = false
  mediaQuery.addEventListener.mock.calls[0][1]({ matches: false })
  await waitFor(() => {
    expect(nav).not.toHaveAttribute('aria-hidden')
    expect(nav).not.toHaveAttribute('inert')
  })
  expect(container.querySelector('.b-brand')).not.toHaveAttribute('tabindex')
  expect(container.querySelector('a[aria-label="Resumen"]')).not.toHaveAttribute('tabindex')
})

test('keeps the mobile-closed navigation visible to desktop and supports legacy listeners', async () => {
  const mediaQuery = {
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const { unmount } = render(
    <ShellNav brand={brand} sections={sections} onNavigate={vi.fn()} />,
  )

  const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
  await waitFor(() => expect(nav).not.toHaveAttribute('aria-hidden'))
  expect(nav).not.toHaveAttribute('inert')
  expect(mediaQuery.addListener).toHaveBeenCalledWith(expect.any(Function))
  unmount()
  expect(mediaQuery.removeListener).toHaveBeenCalledWith(mediaQuery.addListener.mock.calls[0][0])
})

test('keeps the root navigation media-neutral in SSR markup for hydration stability', () => {
  const html = renderToString(
    <ShellNav brand={brand} sections={sections} onNavigate={vi.fn()} mobileOpen={false} />,
  )
  const openingTag = html.match(/<nav\b[^>]*>/)?.[0] || ''

  expect(openingTag).not.toContain('aria-hidden="true"')
  expect(openingTag).not.toContain('inert')
})
