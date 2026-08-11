import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { usePrefersReducedMotion } from '../src/components/charts/chartMotion.js'

function MotionProbe() {
  const reducedMotion = usePrefersReducedMotion()
  return <output data-testid="reduced-motion">{String(reducedMotion)}</output>
}

function SecondMotionProbe() {
  const reducedMotion = usePrefersReducedMotion()
  return <output data-testid="reduced-motion-second">{String(reducedMotion)}</output>
}

afterEach(() => {
  vi.unstubAllGlobals()
})

test('uses the modern media-query listener and cleans it up', () => {
  const mediaQuery = {
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const view = render(<MotionProbe />)
  expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true')

  const listener = mediaQuery.addEventListener.mock.calls[0][1]
  act(() => listener({ matches: false }))
  expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false')

  view.unmount()
  expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', listener)
})

test('falls back to and cleans up the legacy media-query listener', () => {
  const mediaQuery = {
    matches: true,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const view = render(<MotionProbe />)
  const listener = mediaQuery.addListener.mock.calls[0][0]
  expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true')

  view.unmount()
  expect(mediaQuery.removeListener).toHaveBeenCalledWith(listener)
})

test('shares one media-query listener across chart consumers', () => {
  const mediaQuery = {
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  const view = render(
    <>
      <MotionProbe />
      <SecondMotionProbe />
    </>,
  )

  expect(window.matchMedia).toHaveBeenCalledOnce()
  expect(mediaQuery.addEventListener).toHaveBeenCalledOnce()
  view.unmount()
  expect(mediaQuery.removeEventListener).toHaveBeenCalledOnce()
})
