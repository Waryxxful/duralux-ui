import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ThemeProvider } from '../src/theme/ThemeProvider'
import { THEME_HEAD_SNIPPET, useTheme } from '../src/theme/ThemeContext'
import { ThemeScope } from '../src/components/shell/ThemeScope'
import { useThemeBoundaryMode } from '../src/theme/themeBoundary'

const html = document.documentElement
let stored
let mediaListeners
let prefersDark

function mockMatchMedia() {
  mediaListeners = new Set()
  vi.stubGlobal('matchMedia', vi.fn(query => ({
    media: query,
    get matches() { return query.includes('dark') ? prefersDark : false },
    addEventListener: (_type, fn) => mediaListeners.add(fn),
    removeEventListener: (_type, fn) => mediaListeners.delete(fn),
  })))
}

function setSystemDark(value) {
  prefersDark = value
  act(() => mediaListeners.forEach(fn => fn({ matches: value })))
}

function Probe() {
  const { mode, resolved, dark, setMode, toggleDark } = useTheme()
  return (
    <>
      <output data-testid="state">{`${mode}|${resolved}|${dark}`}</output>
      <button type="button" onClick={() => setMode('navy')}>navy</button>
      <button type="button" onClick={() => setMode('system')}>system</button>
      <button type="button" onClick={toggleDark}>toggle</button>
    </>
  )
}

const state = () => screen.getByTestId('state').textContent
const renderProvider = () => render(<ThemeProvider enableResponsiveMini={false}><Probe /></ThemeProvider>)

beforeEach(() => {
  stored = new Map()
  vi.stubGlobal('localStorage', {
    getItem: key => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, String(value)),
    removeItem: key => stored.delete(key),
  })
  prefersDark = false
  mockMatchMedia()
  html.classList.remove('app-skin-dark')
  html.removeAttribute('data-gcu-theme')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  html.classList.remove('app-skin-dark')
  html.removeAttribute('data-gcu-theme')
})

describe('modos de tema en runtime', () => {
  test('un valor guardado navy se respeta al recargar', () => {
    stored.set('grancrm-theme', 'navy')
    renderProvider()
    expect(state()).toBe('navy|navy|true')
    expect(html).toHaveAttribute('data-gcu-theme', 'navy')
    expect(html).toHaveClass('app-skin-dark')
  })

  test('system sigue al sistema operativo y reacciona en caliente', () => {
    stored.set('grancrm-theme', 'system')
    prefersDark = true
    renderProvider()
    expect(state()).toBe('system|dark|true')
    setSystemDark(false)
    expect(state()).toBe('system|light|false')
    expect(html).toHaveAttribute('data-gcu-theme', 'light')
    expect(html).not.toHaveClass('app-skin-dark')
    expect(stored.get('grancrm-theme')).toBe('system')
  })

  test('toggleDark desde navy vuelve a light y desde light va a dark', () => {
    renderProvider()
    fireEvent.click(screen.getByRole('button', { name: 'navy' }))
    expect(state()).toBe('navy|navy|true')
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(state()).toBe('light|light|false')
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(state()).toBe('dark|dark|true')
  })

  test('un valor guardado desconocido cae en light y avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    stored.set('grancrm-theme', 'sepia')
    renderProvider()
    expect(state()).toBe('light|light|false')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('sepia'))
  })

  test.each([
    ['dark', 'dark', true],
    ['navy', 'navy', true],
    ['light', 'light', false],
  ])('THEME_HEAD_SNIPPET fija el tema %s antes del primer pintado', (value, attr, dark) => {
    stored.set('grancrm-theme', value)
    new Function(THEME_HEAD_SNIPPET)()
    expect(html).toHaveAttribute('data-gcu-theme', attr)
    expect(html.classList.contains('app-skin-dark')).toBe(dark)
  })

  test('THEME_HEAD_SNIPPET resuelve system con matchMedia', () => {
    stored.set('grancrm-theme', 'system')
    prefersDark = true
    new Function(THEME_HEAD_SNIPPET)()
    expect(html).toHaveAttribute('data-gcu-theme', 'dark')
  })

  test('los portales heredan el tema resuelto, no "system"', () => {
    stored.set('grancrm-theme', 'system')
    prefersDark = true
    function Boundary() { return <output data-testid="boundary">{useThemeBoundaryMode()}</output> }
    render(<ThemeProvider enableResponsiveMini={false}><Boundary /></ThemeProvider>)
    expect(screen.getByTestId('boundary')).toHaveTextContent('dark')
  })

  test('ThemeScope acepta navy', () => {
    render(<ThemeScope theme="navy" data-testid="scope" />)
    expect(screen.getByTestId('scope')).toHaveAttribute('data-gcu-theme', 'navy')
  })
})
