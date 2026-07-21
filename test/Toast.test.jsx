import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { Toast } from '../src/components/ui/Toast.tsx'

function mockReducedMotion(matches) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches })))
}

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

test.each([
  ['success', 'status', 'polite'],
  ['info', 'status', 'polite'],
  ['warning', 'alert', 'assertive'],
  ['danger', 'alert', 'assertive'],
])('uses atomic %s live-region semantics', (variant, role, live) => {
  render(<Toast variant={variant} title="Saved" show onClose={vi.fn()} autoHideMs={0} />)

  const toast = screen.getByRole(role)
  expect(toast).toHaveAttribute('aria-live', live)
  expect(toast).toHaveAttribute('aria-atomic', 'true')
})

test('uses the latest onClose once when auto-hide and rapid clicks race', () => {
  vi.useFakeTimers()
  mockReducedMotion(false)
  const firstOnClose = vi.fn()
  const latestOnClose = vi.fn()
  const { rerender } = render(
    <Toast variant="success" title="Saved" show onClose={firstOnClose} autoHideMs={100} />,
  )

  act(() => vi.advanceTimersByTime(100))
  expect(screen.getByRole('status')).toHaveClass('gcu-toast--closing')

  rerender(<Toast variant="success" title="Saved" show onClose={latestOnClose} autoHideMs={100} />)
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }))
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }))
  act(() => vi.advanceTimersByTime(300))

  expect(firstOnClose).not.toHaveBeenCalled()
  expect(latestOnClose).toHaveBeenCalledOnce()
})

test('reschedules auto-hide without leaving an earlier timer active', () => {
  vi.useFakeTimers()
  mockReducedMotion(false)
  const onClose = vi.fn()
  const { rerender } = render(
    <Toast variant="info" title="Updated" show onClose={onClose} autoHideMs={100} />,
  )

  act(() => vi.advanceTimersByTime(50))
  rerender(<Toast variant="info" title="Updated" show onClose={onClose} autoHideMs={200} />)
  act(() => vi.advanceTimersByTime(199))
  expect(screen.getByRole('status')).not.toHaveClass('gcu-toast--closing')

  act(() => vi.advanceTimersByTime(1))
  expect(screen.getByRole('status')).toHaveClass('gcu-toast--closing')
  act(() => vi.advanceTimersByTime(299))
  expect(onClose).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(1))
  expect(onClose).toHaveBeenCalledOnce()
})

test('closes immediately and only once with reduced motion', () => {
  mockReducedMotion(true)
  const onClose = vi.fn()
  render(<Toast variant="info" title="Updated" show onClose={onClose} autoHideMs={0} />)

  const closeButton = screen.getByRole('button', { name: 'Cerrar notificación' })
  fireEvent.click(closeButton)
  fireEvent.click(closeButton)

  expect(onClose).toHaveBeenCalledOnce()
  expect(screen.getByRole('status')).not.toHaveClass('gcu-toast--closing')
})
