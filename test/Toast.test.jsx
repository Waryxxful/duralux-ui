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

test('keeps important danger and warning toasts until they are dismissed', () => {
  vi.useFakeTimers()
  mockReducedMotion(false)
  const onClose = vi.fn()
  const { rerender } = render(<Toast variant="danger" title="Failed" show onClose={onClose} />)

  act(() => vi.advanceTimersByTime(10_000))
  expect(screen.getByRole('alert')).not.toHaveClass('gcu-toast--closing')
  expect(onClose).not.toHaveBeenCalled()

  rerender(<Toast variant="warning" title="Check this" show onClose={onClose} />)
  act(() => vi.advanceTimersByTime(10_000))
  expect(screen.getByRole('alert')).not.toHaveClass('gcu-toast--closing')
  expect(onClose).not.toHaveBeenCalled()
})

test('pauses auto-hide while hovered or focused', () => {
  vi.useFakeTimers()
  mockReducedMotion(false)
  const onClose = vi.fn()
  render(<Toast variant="success" title="Saved" show onClose={onClose} autoHideMs={100} />)

  const toast = screen.getByRole('status')
  fireEvent.mouseEnter(toast)
  act(() => vi.advanceTimersByTime(200))
  expect(toast).not.toHaveClass('gcu-toast--closing')

  fireEvent.mouseLeave(toast)
  act(() => vi.advanceTimersByTime(99))
  expect(toast).not.toHaveClass('gcu-toast--closing')
  act(() => vi.advanceTimersByTime(1))
  expect(toast).toHaveClass('gcu-toast--closing')
})

test('uses the same close timer when CSS handles reduced motion', () => {
  vi.useFakeTimers()
  mockReducedMotion(true)
  const onClose = vi.fn()
  render(<Toast variant="info" title="Updated" show onClose={onClose} autoHideMs={0} />)

  const closeButton = screen.getByRole('button', { name: 'Cerrar notificación' })
  fireEvent.click(closeButton)
  fireEvent.click(closeButton)

  expect(onClose).not.toHaveBeenCalled()
  expect(screen.getByRole('status')).toHaveClass('gcu-toast--closing')
  act(() => vi.advanceTimersByTime(300))
  expect(onClose).toHaveBeenCalledOnce()
})
