import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { AppLayout } from '../src/components/layout/AppLayout'
import { Sidebar } from '../src/components/layout/Sidebar'
import { Modal } from '../src/components/ui/Modal'
import { ThemeProvider, useThemeOptional } from '../src/theme/ThemeProvider'
import { adaptAppNavItems } from '../src/contract'

afterEach(() => {
  document.documentElement.classList.remove('app-skin-dark', 'minimenu')
  localStorage.clear()
  vi.unstubAllGlobals()
})

const navItems = [
  {
    label: 'Accounts',
    icon: 'feather-users',
    children: [
      {
        label: 'Administration',
        children: [
          { label: 'Teams', to: '/accounts/teams' },
        ],
      },
    ],
  },
  { label: 'Reports', icon: 'feather-bar-chart', to: '/reports' },
]

function renderLayout(props = {}) {
  const { children = 'Content', ...rest } = props
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AppLayout navItems={navItems} {...rest}>{children}</AppLayout>
    </MemoryRouter>,
  )
}

function ThemeState() {
  const theme = useThemeOptional()
  return <output>{`${theme.mode}:${theme.mini ? 'mini' : 'expanded'}`}</output>
}

describe('AppLayout PAGE-STRUCTURE', () => {
  test('does not force-wrap children in .main-content (PageHeader can be sibling)', () => {
    const { container } = renderLayout({
      children: (
        <>
          <div className="page-header">Header</div>
          <div className="main-content">Body</div>
        </>
      ),
    })
    const content = container.querySelector('.nxl-content')
    expect(content).toBeTruthy()
    // Children are direct under nxl-content (not nested: nxl-content > main-content > both)
    const forced = content.querySelector(':scope > .main-content > .page-header')
    expect(forced).toBeNull()
    expect(content.querySelector(':scope > .page-header')).toBeTruthy()
    expect(content.querySelector(':scope > .main-content')).toBeTruthy()
  })
})

describe('AppLayout mobile navigation', () => {
  test('uses the canonical nav class and overlay, then closes through every mobile exit', async () => {
    const user = userEvent.setup()
    const { container } = renderLayout()
    const nav = container.querySelector('.nxl-navigation')
    const toggle = container.querySelector('.nxl-head-mobile-toggler')

    await user.click(toggle)
    expect(nav).toHaveClass('mob-navigation-active')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAttribute('aria-controls', nav.id)
    expect(toggle).toHaveAccessibleName('Cerrar navegación móvil')
    expect(toggle).toHaveClass('is-active')
    const overlay = container.querySelector('.nxl-menu-overlay')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveAttribute('aria-label', 'Cerrar menú')
    expect(document.body).not.toHaveClass('mob-sidebar-active')

    await user.click(overlay)
    expect(nav).not.toHaveClass('mob-navigation-active')
    expect(container.querySelector('.nxl-menu-overlay')).not.toBeInTheDocument()
    expect(toggle).toHaveFocus()
    expect(overlay.tagName).toBe('BUTTON')
    expect(overlay).toHaveAttribute('type', 'button')

    await user.click(toggle)
    const consumedEscape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    consumedEscape.preventDefault()
    fireEvent(document, consumedEscape)
    expect(nav).toHaveClass('mob-navigation-active')

    await user.keyboard('{Escape}')
    expect(nav).not.toHaveClass('mob-navigation-active')

    await user.click(toggle)
    await user.click(screen.getByRole('link', { name: 'Reports' }))
    expect(nav).not.toHaveClass('mob-navigation-active')
    expect(container.querySelector('.nxl-menu-overlay')).not.toBeInTheDocument()
  })

  test('closes after a programmatic pathname change, including browser back', async () => {
    const user = userEvent.setup()

    function RouteActions() {
      const navigate = useNavigate()
      return (
        <div>
          <button type="button" onClick={() => navigate('/reports')}>Go reports</button>
          <button type="button" onClick={() => navigate(-1)}>Go back</button>
        </div>
      )
    }

    const { container } = render(
      <MemoryRouter initialEntries={['/', '/accounts']} initialIndex={1}>
        <AppLayout navItems={navItems}><RouteActions /></AppLayout>
      </MemoryRouter>,
    )

    const nav = container.querySelector('.nxl-navigation')
    const toggle = screen.getByRole('button', { name: 'Abrir navegación móvil' })

    await user.click(toggle)
    expect(nav).toHaveClass('mob-navigation-active')

    await user.click(screen.getByRole('button', { name: 'Go reports' }))
    expect(nav).not.toHaveClass('mob-navigation-active')
    expect(toggle).toHaveAccessibleName('Abrir navegación móvil')
    expect(screen.getByRole('button', { name: 'Go reports' })).toHaveFocus()

    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: 'Go back' }))
    expect(nav).not.toHaveClass('mob-navigation-active')
    expect(screen.getByRole('button', { name: 'Go back' })).toHaveFocus()
  })

  test('dismisses a modal before an already-open mobile navigation', async () => {
    const user = userEvent.setup()

    function LayoutWithModal() {
      const [modalOpen, setModalOpen] = useState(false)
      return (
        <MemoryRouter>
          <AppLayout navItems={navItems}>
            <button type="button" onClick={() => setModalOpen(true)}>Open modal</button>
            <Modal open={modalOpen} title="Dialog" onClose={() => setModalOpen(false)}>
              Modal content
            </Modal>
          </AppLayout>
        </MemoryRouter>
      )
    }

    const { container } = render(<LayoutWithModal />)
    const nav = container.querySelector('.nxl-navigation')
    await user.click(container.querySelector('.nxl-head-mobile-toggler'))
    await user.click(screen.getByRole('button', { name: 'Open modal' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(nav).toHaveClass('mob-navigation-active')

    await user.keyboard('{Escape}')
    expect(nav).not.toHaveClass('mob-navigation-active')
  })
})

test('opens and marks every ancestor of an active nested route', () => {
  const { container } = render(
    <MemoryRouter initialEntries={['/accounts/teams']}>
      <Sidebar navItems={navItems} />
    </MemoryRouter>,
  )

  const accounts = screen.getByText('Accounts').closest('li')
  const administration = screen.getByText('Administration').closest('li')
  const teams = screen.getByRole('link', { name: 'Teams' }).closest('li')

  expect(accounts).toHaveClass('active', 'nxl-trigger')
  expect(administration).toHaveClass('active', 'nxl-trigger')
  expect(teams).toHaveClass('active')
  expect(container.querySelectorAll('.nxl-submenu')).toHaveLength(2)
})

test('uses native submenu buttons with ARIA and keeps hidden menus mounted for animation', async () => {
  const user = userEvent.setup()
  const { container } = render(
    <MemoryRouter initialEntries={['/']}>
      <Sidebar navItems={navItems} />
    </MemoryRouter>,
  )

  const accounts = screen.getByRole('button', { name: 'Accounts' })
  const submenu = document.getElementById(accounts.getAttribute('aria-controls'))

  expect(accounts).toHaveAttribute('aria-expanded', 'false')
  expect(submenu).toHaveClass('nxl-menu-hidden')
  expect(submenu).toHaveAttribute('aria-hidden', 'true')
  expect(submenu).toHaveAttribute('inert')
  expect(container.querySelectorAll('.nxl-submenu')).toHaveLength(2)
  expect(container.querySelector('a[href="#"]')).toBeNull()

  accounts.focus()
  await user.keyboard('{Enter}')
  expect(accounts).toHaveAttribute('aria-expanded', 'true')
  expect(submenu).toHaveClass('nxl-menu-visible')
  expect(submenu).toHaveAttribute('aria-hidden', 'false')

  await user.keyboard('{ArrowLeft}')
  expect(accounts).toHaveAttribute('aria-expanded', 'false')
})

test('does not put mounted closed submenu descendants in the tab order', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/']}>
      <Sidebar navItems={navItems} />
    </MemoryRouter>,
  )

  const accounts = screen.getByRole('button', { name: 'Accounts' })
  const reports = screen.getByRole('link', { name: 'Reports' })
  const administration = screen.getByText('Administration').closest('button')
  const teams = screen.getByText('Teams').closest('a')

  accounts.focus()
  await user.tab()
  expect(document.activeElement).toBe(reports)
  expect(administration).not.toHaveFocus()
  expect(teams).not.toHaveFocus()

  await user.click(accounts)
  await user.tab()
  expect(document.activeElement).toBe(administration)
  await user.click(administration)
  administration.focus()
  await user.tab()
  expect(document.activeElement).toBe(teams)
})

test('restores mobile focus only for dismissive closes', async () => {
  const user = userEvent.setup()
  const { container } = renderLayout()
  const nav = container.querySelector('.nxl-navigation')
  const toggle = screen.getByRole('button', { name: 'Abrir navegación móvil' })

  await user.click(toggle)
  await user.click(screen.getByRole('link', { name: 'Reports' }))
  expect(nav).not.toHaveClass('mob-navigation-active')
  expect(screen.getByRole('link', { name: 'Reports' })).toHaveFocus()

  await user.click(toggle)
  await user.click(container.querySelector('.nxl-menu-overlay'))
  expect(toggle).toHaveFocus()
})

test('uses prefix route matching unless end is explicitly requested', () => {
  render(
    <MemoryRouter initialEntries={['/reports/42']}>
      <Sidebar navItems={navItems} />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: 'Reports' }).closest('li')).toHaveClass('active')
})

test('renders the official adapter output in the standalone Sidebar', () => {
  const adapted = adaptAppNavItems([
    { label: 'Calls', icon: 'feather-phone', inner: '/calls' },
  ], { routePrefix: '/app' })
  const { container } = render(
    <MemoryRouter initialEntries={['/app/calls']}>
      <Sidebar navItems={adapted} />
    </MemoryRouter>,
  )

  expect(container.querySelector('.nxl-micon i')).toHaveClass('feather-phone')
})

test('uses Router Link for the standalone brand so a basename is preserved', () => {
  const { container } = render(
    <MemoryRouter basename="/standalone" initialEntries={['/standalone/']}>
      <Sidebar navItems={[]} />
    </MemoryRouter>,
  )

  expect(container.querySelector('.m-header .b-brand')).toHaveAttribute('href', '/standalone')
})

test('opens the most specific active branch after an earlier prefix match', () => {
  render(
    <MemoryRouter initialEntries={['/settings/security']}>
      <Sidebar
        navItems={[
          { label: 'Settings overview', to: '/settings' },
          {
            label: 'Security settings',
            children: [{ label: 'Security', to: '/settings/security' }],
          },
        ]}
      />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: 'Settings overview' }).closest('li')).not.toHaveClass('active')
  expect(screen.getByRole('link', { name: 'Settings overview' })).not.toHaveAttribute('aria-current')
  expect(screen.getByText('Security settings').closest('li')).toHaveClass('active', 'nxl-trigger')
  expect(screen.getByRole('link', { name: 'Security' }).closest('li')).toHaveClass('active')
  expect(screen.getByRole('link', { name: 'Security' })).toHaveAttribute('aria-current', 'page')
})

test('keeps duplicate sibling groups independently keyed', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <Sidebar
        navItems={[
          { label: 'Duplicate', children: [{ label: 'First child', to: '/first' }] },
          { label: 'Duplicate', children: [{ label: 'Second child', to: '/second' }] },
        ]}
      />
    </MemoryRouter>,
  )

  const labels = screen.getAllByText('Duplicate')
  const groups = labels.map((label) => label.closest('li'))

  await user.click(labels[0])
  expect(groups[0]).toHaveClass('nxl-trigger')
  expect(groups[1]).not.toHaveClass('nxl-trigger')

  await user.click(labels[1])
  expect(groups[0]).not.toHaveClass('nxl-trigger')
  expect(groups[1]).toHaveClass('nxl-trigger')
})

test('does not expose disabled groups, links, or actions as interactive controls', async () => {
  const user = userEvent.setup()
  const action = vi.fn()
  render(
    <MemoryRouter initialEntries={['/']}>
      <Sidebar
        navItems={[
          { label: 'Disabled group', icon: 'folder', disabled: true, children: [{ label: 'Hidden child', to: '/hidden' }] },
          { label: 'Disabled link', icon: 'lock', to: '/disabled', disabled: true },
          { label: 'Disabled action', icon: 'slash', onClick: action, disabled: true },
        ]}
      />
    </MemoryRouter>,
  )

  expect(screen.queryByRole('button', { name: 'Disabled group' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Disabled link' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Disabled action' })).not.toBeInTheDocument()
  expect(screen.getByText('Disabled group').closest('li').querySelector('[aria-disabled="true"]')).toBeInTheDocument()
  expect(screen.getByText('Disabled link').closest('li').querySelector('[aria-disabled="true"]')).toBeInTheDocument()
  expect(screen.getByText('Disabled action').closest('li').querySelector('[aria-disabled="true"]')).toBeInTheDocument()
  expect(document.querySelector('a[href="/disabled"]')).toBeNull()
  expect(document.querySelector('a[href="#"]')).toBeNull()

  await user.tab()
  expect(document.activeElement).not.toHaveTextContent(/Disabled/)
  expect(action).not.toHaveBeenCalled()
})

test('does not leave nav focus behind when a mobile drawer closes during navigation', async () => {
  const mediaQuery = {
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const { container } = renderLayout()
  const nav = container.querySelector('.nxl-navigation')
  const toggle = screen.getByRole('button', { name: 'Abrir navegación móvil' })
  await userEvent.setup().click(toggle)
  await userEvent.setup().click(screen.getByRole('link', { name: 'Reports' }))

  await waitFor(() => expect(nav).not.toContainElement(document.activeElement))
})

test('applies the Duralux dark class and restores pre-existing ownership on unmount', () => {
  const html = document.documentElement
  const { rerender, unmount } = render(
    <MemoryRouter>
      <AppLayout theme="dark">Content</AppLayout>
    </MemoryRouter>,
  )

  expect(html).toHaveClass('app-skin-dark')

  rerender(
    <MemoryRouter>
      <AppLayout theme="light">Content</AppLayout>
    </MemoryRouter>,
  )
  expect(html).not.toHaveClass('app-skin-dark')
  unmount()

  html.classList.add('app-skin-dark')
  const owned = render(
    <MemoryRouter>
      <AppLayout theme="light">Content</AppLayout>
    </MemoryRouter>,
  )
  expect(html).not.toHaveClass('app-skin-dark')
  owned.unmount()
  expect(html).toHaveClass('app-skin-dark')
})

test('leaves dark and mini ownership with ThemeProvider', async () => {
  const user = userEvent.setup()
  const html = document.documentElement
  html.classList.add('app-skin-dark', 'minimenu')

  const { container, rerender } = render(
    <ThemeProvider enableResponsiveMini={false}>
      <MemoryRouter>
        <AppLayout theme="light">Content</AppLayout>
      </MemoryRouter>
      <ThemeState />
    </ThemeProvider>,
  )

  expect(screen.getByText('dark:mini')).toBeInTheDocument()
  expect(html).toHaveClass('app-skin-dark', 'minimenu')

  await user.click(container.querySelector('.nxl-navigation-toggle button'))
  expect(screen.getByText('dark:expanded')).toBeInTheDocument()
  expect(html).toHaveClass('app-skin-dark')
  expect(html).not.toHaveClass('minimenu')

  rerender(
    <ThemeProvider enableResponsiveMini={false}>
      <ThemeState />
    </ThemeProvider>,
  )
  expect(screen.getByText('dark:expanded')).toBeInTheDocument()
  expect(html).toHaveClass('app-skin-dark')
})
