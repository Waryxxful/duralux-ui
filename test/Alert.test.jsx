import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import { Alert } from '../src/index.js'

test('variante solida por defecto', () => {
  render(<Alert variant="success">Ok</Alert>)
  expect(screen.getByRole('alert')).toHaveClass('alert-success')
})

test('prop soft genera la clase alert-soft-{variant}-message', () => {
  render(<Alert variant="warning" soft>Cuidado</Alert>)
  const el = screen.getByRole('alert')
  expect(el).toHaveClass('alert-soft-warning-message')
  expect(el).not.toHaveClass('alert-warning')
})

test('dismiss control exposes accessible name Cerrar', async () => {
  const { default: userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  render(<Alert variant="danger" dismissible>Error</Alert>)
  const close = screen.getByRole('button', { name: 'Cerrar' })
  expect(close).toHaveClass('btn-close')
  await user.click(close)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
