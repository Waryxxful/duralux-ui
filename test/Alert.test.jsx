import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import { Alert } from '../src/index.js'

test('variante solida por defecto no anuncia contenido estático', () => {
  const { container } = render(<Alert variant="success">Ok</Alert>)
  expect(container.querySelector('.gcu-alert')).toHaveClass('alert-success')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('prop soft genera la clase alert-soft-{variant}-message', () => {
  const { container } = render(<Alert variant="warning" soft>Cuidado</Alert>)
  const el = container.querySelector('.gcu-alert')
  expect(el).toHaveClass('alert-soft-warning-message')
  expect(el).not.toHaveClass('alert-warning')
})

test('announce expone feedback dinámico como estado educado', () => {
  render(<Alert announce>Guardado</Alert>)
  expect(screen.getByRole('status')).toHaveTextContent('Guardado')
})

test('dismiss control exposes accessible name Cerrar', async () => {
  const { default: userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  const { container } = render(<Alert variant="danger" dismissible>Error</Alert>)
  const close = screen.getByRole('button', { name: 'Cerrar' })
  expect(close).toHaveClass('btn-close')
  await user.click(close)
  expect(container.querySelector('.gcu-alert')).not.toBeInTheDocument()
})
