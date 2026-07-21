import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, test } from 'vitest'
import { AppLayout } from '../src/components/layout/AppLayout'
import { Sidebar } from '../src/components/layout/Sidebar'
import { Modal } from '../src/components/ui/Modal'
import { ThemeProvider, useThemeOptional } from '../src/theme/ThemeProvider'

afterEach(() => {
  document.documentElement.classList.remove('app-skin-dark', 'minimenu')
  localStorage.clear()
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
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AppLayout navItems={navItems} {...props}>Content</AppLayout>
    </MemoryRouter>,
  )
}

function ThemeState() {
  const theme = useThemeOptional()
  return <output>{`${theme.mode}:${theme.mini ? 'mini' : 'expanded'}`}</output>
}

describe('AppLayout mobile navigation', () => {
  test('uses the canonical nav class and overlay, then closes through every mobile exit', async () => {
    const user = userEvent.setup()
    const { container } = renderLayout()
    const nav = container.querySelector('.nxl-navigation')
    const toggle = container.querySelector('.nxl-head-mobile-toggler')

    await user.click(toggle)
    expect(nav).toHaveClass('mob-navigation-active')
    expect(container.querySelector('.nxl-menu-overlay')).toBeInTheDocument()
    expect(document.body).not.toHaveClass('mob-sidebar-active')

    await user.click(container.querySelector('.nxl-menu-overlay'))
    expect(nav).not.toHaveClass('mob-navigation-active')
    expect(container.querySelector('.nxl-menu-overlay')).not.toBeInTheDocument()

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

test('uses prefix route matching unless end is explicitly requested', () => {
  render(
    <MemoryRouter initialEntries={['/reports/42']}>
      <Sidebar navItems={navItems} />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: 'Reports' }).closest('li')).toHaveClass('active')
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

  expect(screen.getByRole('link', { name: 'Settings overview' }).closest('li')).toHaveClass('active')
  expect(screen.getByText('Security settings').closest('li')).toHaveClass('active', 'nxl-trigger')
  expect(screen.getByRole('link', { name: 'Security' }).closest('li')).toHaveClass('active')
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

  await user.click(container.querySelector('.nxl-navigation-toggle a'))
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
