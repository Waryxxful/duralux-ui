import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  THEME_HEAD_SNIPPET,
  ThemeProvider,
  useTheme,
} from '../src/theme/ThemeProvider'

const MINI_KEY = 'grancrm-menu-mini'
const MINI_PIN_KEY = 'grancrm-menu-mini-pinned'
const LEGACY_MINI_KEY = 'nexel-classic-dashboard-menu-mini-theme'
const originalInnerWidth = window.innerWidth

let storedValues
let storage

function setWidth(width) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  })
}

function resizeTo(width) {
  act(() => {
    setWidth(width)
    window.dispatchEvent(new Event('resize'))
  })
}

function ThemeState() {
  const { mini, setMini, toggleMini } = useTheme()

  return (
    <>
      <output data-testid="mini-state">{mini ? 'mini' : 'expanded'}</output>
      <button type="button" onClick={() => setMini(true)}>Pin mini</button>
      <button type="button" onClick={() => setMini(false)}>Pin expanded</button>
      <button type="button" onClick={toggleMini}>Toggle mini</button>
    </>
  )
}

function renderTheme() {
  return render(
    <ThemeProvider>
      <ThemeState />
    </ThemeProvider>,
  )
}

function expectState(value) {
  expect(screen.getByTestId('mini-state')).toHaveTextContent(value)
}

beforeEach(() => {
  storedValues = new Map()
  storage = {
    getItem: vi.fn(key => storedValues.get(key) ?? null),
    setItem: vi.fn((key, value) => storedValues.set(key, String(value))),
    removeItem: vi.fn(key => storedValues.delete(key)),
    clear: vi.fn(() => storedValues.clear()),
    key: vi.fn(index => [...storedValues.keys()][index] ?? null),
    get length() {
      return storedValues.size
    },
  }
  vi.stubGlobal('localStorage', storage)
  setWidth(800)
  document.documentElement.classList.remove('app-skin-dark', 'minimenu')
})

afterEach(() => {
  setWidth(originalInnerWidth)
  document.documentElement.classList.remove('app-skin-dark', 'minimenu')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ThemeProvider responsive mini preference', () => {
  test('applies responsive mini without persisting automatic state', () => {
    setWidth(1200)
    renderTheme()

    expectState('mini')
    expect(document.documentElement).toHaveClass('minimenu')
    expect(storage.getItem(MINI_KEY)).toBeNull()
    expect(storage.getItem(MINI_PIN_KEY)).toBeNull()
    expect(storage.getItem(LEGACY_MINI_KEY)).toBeNull()

    resizeTo(1800)

    expectState('expanded')
    expect(document.documentElement).not.toHaveClass('minimenu')
    expect(storage.getItem(MINI_KEY)).toBeNull()
    expect(storage.getItem(MINI_PIN_KEY)).toBeNull()
    expect(storage.getItem(LEGACY_MINI_KEY)).toBeNull()
  })

  test('persists and pins explicit setMini and toggleMini choices across resize', () => {
    setWidth(1200)
    renderTheme()
    expectState('mini')

    fireEvent.click(screen.getByRole('button', { name: 'Pin expanded' }))

    expectState('expanded')
    expect(storage.getItem(MINI_KEY)).toBe('0')
    expect(storage.getItem(MINI_PIN_KEY)).toBe('1')
    expect(storage.getItem(LEGACY_MINI_KEY)).toBe('menu-expend-theme')

    resizeTo(1400)
    expectState('expanded')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle mini' }))

    expectState('mini')
    expect(storage.getItem(MINI_KEY)).toBe('1')
    expect(storage.getItem(LEGACY_MINI_KEY)).toBe('menu-mini-theme')

    resizeTo(1800)
    expectState('mini')
  })

  test('honors an explicitly persisted false preference over markup and responsive width', () => {
    storedValues.set(MINI_KEY, '0')
    storedValues.set(MINI_PIN_KEY, '1')
    storedValues.set(LEGACY_MINI_KEY, 'menu-expend-theme')
    document.documentElement.classList.add('minimenu')
    setWidth(1200)

    renderTheme()

    expectState('expanded')
    expect(document.documentElement).not.toHaveClass('minimenu')
    resizeTo(1400)
    expectState('expanded')
  })

  test('restores an explicit mini preference on reload and in the head snippet', () => {
    setWidth(1800)
    const firstRender = renderTheme()
    expectState('expanded')

    fireEvent.click(screen.getByRole('button', { name: 'Pin mini' }))
    expect(storage.getItem(MINI_KEY)).toBe('1')
    expect(storage.getItem(MINI_PIN_KEY)).toBe('1')
    firstRender.unmount()

    document.documentElement.classList.remove('minimenu')
    Function(THEME_HEAD_SNIPPET)()
    expect(document.documentElement).toHaveClass('minimenu')

    document.documentElement.classList.remove('minimenu')
    renderTheme()
    expectState('mini')
    resizeTo(1800)
    expectState('mini')
  })

  test('removes its responsive resize listener on cleanup', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener')
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const view = renderTheme()
    const resizeRegistration = addEventListener.mock.calls.find(([event]) => event === 'resize')

    expect(resizeRegistration).toBeDefined()
    view.unmount()

    expect(removeEventListener).toHaveBeenCalledWith('resize', resizeRegistration[1])
  })
})
