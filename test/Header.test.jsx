import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { test, expect, vi } from 'vitest'
import { Header } from '../src/index.js'

function renderHeader() {
  return render(
    <>
      <Header
        user={{ name: 'Ada Lovelace', email: 'ada@example.com' }}
        notifications={[{ id: 1, title: 'Nueva alerta', time: 'ahora' }]}
      />
      <button type="button">Outside</button>
    </>,
  )
}

test('uses the controlled mobile state for native hamburger ARIA and active styling', () => {
  const onToggleMobile = vi.fn()
  const { rerender } = render(
    <Header onToggleMobile={onToggleMobile} mobileOpen={false} mobileNavId="layout-nav" />,
  )

  const trigger = screen.getByRole('button', { name: 'Abrir navegación móvil' })
  expect(trigger).toHaveAttribute('type', 'button')
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(trigger).toHaveAttribute('aria-controls', 'layout-nav')
  expect(trigger).not.toHaveClass('is-active')

  rerender(<Header onToggleMobile={onToggleMobile} mobileOpen mobileNavId="layout-nav" />)
  const openTrigger = screen.getByRole('button', { name: 'Cerrar navegación móvil' })
  expect(openTrigger).toHaveAttribute('aria-expanded', 'true')
  expect(openTrigger).toHaveClass('is-active')

  openTrigger.focus()
  rerender(<Header onToggleMobile={onToggleMobile} mobileOpen={false} mobileNavId="layout-nav" />)
  expect(screen.getByRole('button', { name: 'Abrir navegación móvil' })).toHaveFocus()
})

test('keeps the standalone mini control controlled and exposes its state', () => {
  const onToggleMini = vi.fn()
  const { rerender } = render(
    <Header mini={false} onToggleMini={onToggleMini} mobileNavId="layout-nav" />,
  )

  const collapse = screen.getByRole('button', { name: 'Colapsar menú' })
  expect(collapse).toHaveAttribute('aria-pressed', 'false')
  expect(collapse).toHaveAttribute('aria-controls', 'layout-nav')

  rerender(<Header mini onToggleMini={onToggleMini} mobileNavId="layout-nav" />)
  const expand = screen.getByRole('button', { name: 'Expandir menú' })
  expect(expand).toHaveAttribute('aria-pressed', 'true')
  expect(expand).toHaveAttribute('aria-controls', 'layout-nav')
})

test('search closes on outside click and Escape returns focus to its trigger', async () => {
  const user = userEvent.setup()
  renderHeader()

  const trigger = screen.getByRole('button', { name: 'Buscar' })
  const outside = screen.getByRole('button', { name: 'Outside' })

  await user.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('searchbox', { name: 'Buscar' })).toHaveFocus()

  await user.keyboard('{Escape}')
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(trigger).toHaveFocus()

  await user.click(trigger)
  await user.click(outside)
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(outside).toHaveFocus()
})

test('notifications and user controls expose names, controls, outside dismiss and focus return', async () => {
  const user = userEvent.setup()
  renderHeader()

  const notifications = screen.getByRole('button', { name: /Notificaciones/ })
  const userMenu = screen.getByRole('button', { name: 'Menú de usuario' })

  expect(notifications).toHaveAttribute('aria-controls')
  expect(userMenu).toHaveAttribute('aria-controls')

  await user.click(notifications)
  expect(notifications).toHaveAttribute('aria-expanded', 'true')
  await user.click(userMenu)
  expect(notifications).toHaveAttribute('aria-expanded', 'false')
  expect(userMenu).toHaveAttribute('aria-expanded', 'true')

  await user.keyboard('{Escape}')
  expect(userMenu).toHaveAttribute('aria-expanded', 'false')
  expect(userMenu).toHaveFocus()
})

test('does not expose dead toggles or passive notification/user items as controls', async () => {
  const user = userEvent.setup()
  render(
    <Header
      user={{
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        menuItems: [
          { label: 'Passive item' },
          { label: 'Action item', onClick: vi.fn() },
        ],
      }}
      notifications={[{ id: 1, title: 'Passive notification', time: 'ahora' }]}
    />,
  )

  expect(screen.queryByRole('button', { name: 'Abrir navegación móvil' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Colapsar menú' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Notificaciones/ }))
  const notification = screen.getByText('Passive notification')
  expect(notification.closest('a,button')).toBeNull()

  await user.click(screen.getByRole('button', { name: 'Menú de usuario' }))
  const passive = screen.getByText('Passive item')
  const action = screen.getByText('Action item')
  expect(passive.closest('a,button')).toBeNull()
  expect(action.closest('button')).toBeInTheDocument()
})

test('only renders mark-all-read when a callback exists and preserves it when provided', async () => {
  const user = userEvent.setup()
  const onMarkAllRead = vi.fn()
  const props = {
    user: { name: 'Ada Lovelace', email: 'ada@example.com' },
    notifications: [{ id: 1, title: 'Nueva alerta', time: 'ahora' }],
  }
  const { rerender } = render(<Header {...props} />)

  await user.click(screen.getByRole('button', { name: /Notificaciones/ }))
  expect(screen.queryByRole('button', { name: /Marcar todas/ })).not.toBeInTheDocument()

  rerender(<Header {...props} onMarkAllRead={onMarkAllRead} />)
  const markAll = screen.getByRole('button', { name: /Marcar todas/ })
  await user.click(markAll)
  expect(onMarkAllRead).toHaveBeenCalledTimes(1)
})

test('uses a notification callback as a button when no href is available', async () => {
  const user = userEvent.setup()
  const onNotificationClick = vi.fn()
  render(
    <Header
      user={{ name: 'Ada Lovelace' }}
      notifications={[{ id: 1, title: 'Interactiva', time: 'ahora', onClick: onNotificationClick }]}
    />,
  )

  await user.click(screen.getByRole('button', { name: /Notificaciones/ }))
  const notification = screen.getByText('Interactiva').closest('button')
  expect(notification).toBeInTheDocument()
  await user.click(notification)
  expect(onNotificationClick).toHaveBeenCalledTimes(1)
})
