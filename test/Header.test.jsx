import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { Header } from '../src/components/layout/Header'

test('mobile and mini togglers are real buttons, not href="#" links', () => {
  render(<Header />)
  expect(document.querySelector('.nxl-head-mobile-toggler').tagName).toBe('BUTTON')
  expect(document.querySelector('.nxl-navigation-toggle button')).toBeInTheDocument()
})

test('notification and user triggers expose aria-expanded/aria-controls and toggle', async () => {
  const user = userEvent.setup()
  render(
    <Header
      user={{ name: 'Ada' }}
      notifications={[{ title: 'Nueva alerta' }]}
    />,
  )

  const notifTrigger = screen.getByRole('button', { name: 'Notificaciones' })
  expect(notifTrigger).toHaveAttribute('aria-expanded', 'false')
  const notifMenuId = notifTrigger.getAttribute('aria-controls')

  await user.click(notifTrigger)
  expect(notifTrigger).toHaveAttribute('aria-expanded', 'true')
  expect(document.getElementById(notifMenuId)).toBeInTheDocument()
  expect(screen.getByText('Nueva alerta')).toBeInTheDocument()
})

test('"Mark all as read" is a button, not a href="#" link', async () => {
  const user = userEvent.setup()
  render(<Header user={{ name: 'Ada' }} notifications={[{ title: 'Nueva alerta' }]} />)

  await user.click(screen.getByRole('button', { name: 'Notificaciones' }))
  const markAllRead = screen.getByRole('button', { name: 'Mark all as read' })
  expect(markAllRead).toBeInTheDocument()

  await user.click(markAllRead)
  expect(screen.queryByText('Nueva alerta')).not.toBeInTheDocument()
})
