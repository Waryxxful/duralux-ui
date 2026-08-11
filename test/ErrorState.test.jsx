import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { ErrorState } from '../src/components/feedback/ErrorState.jsx'

test('retry button uses canonical light-brand, never outline', async () => {
  const user = userEvent.setup()
  const onRetry = vi.fn()
  render(<ErrorState onRetry={onRetry} />)

  const retry = screen.getByRole('button', { name: /Reintentar/i })
  expect(retry.className).toMatch(/btn-light-brand/)
  expect(retry.className).not.toMatch(/btn-outline/)
  await user.click(retry)
  expect(onRetry).toHaveBeenCalledTimes(1)
})

test('renders title and message without retry when onRetry omitted', () => {
  render(<ErrorState title="Falló" message="Detalle" />)
  expect(screen.getByRole('heading', { name: 'Falló' })).toBeInTheDocument()
  expect(screen.getByText('Detalle')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Reintentar/i })).not.toBeInTheDocument()
})

test('announces dynamic errors and ignores non-callable retry values', () => {
  const { rerender } = render(<ErrorState title="Falló" message="Primer detalle" onRetry />)
  const alert = screen.getByRole('alert')

  expect(alert).toHaveAttribute('aria-live', 'assertive')
  expect(screen.getByRole('heading', { name: 'Falló' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Reintentar/i })).not.toBeInTheDocument()

  rerender(<ErrorState title="Falló" message="Segundo detalle" />)
  expect(screen.getByText('Segundo detalle')).toBeInTheDocument()
})
