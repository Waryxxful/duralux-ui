import { createRef, StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Tabs } from '../src/components/ui/Tabs'
import { DEBT, componentCss } from './helpers/themeTokens'

afterEach(() => vi.restoreAllMocks())

const tabs = [
  { key: 'resumen', label: 'Resumen', content: 'Panel resumen' },
  { key: 'actividad', label: 'Actividad', content: 'Panel actividad' },
]

describe('Tabs refinado (receta de componente 2.3, DX-016)', () => {
  test('reenvía ref a un raíz que contiene la lista y los paneles', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Tabs ref={ref} tabs={tabs} />)
    expect(ref.current).toHaveClass('gcu-tabs-root')
    expect(ref.current?.querySelector('[role="tablist"]')).not.toBeNull()
    expect(ref.current?.querySelectorAll('[role="tabpanel"]')).toHaveLength(2)
  })

  test('una clave controlada inválida se resuelve en render sin notificar al padre y avisa una vez', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const onChange = vi.fn()
    const { rerender } = render(<StrictMode><Tabs tabs={tabs} activeKey="no-existe" onChange={onChange} /></StrictMode>)
    expect(screen.getByRole('tab', { name: 'Resumen' })).toHaveAttribute('aria-selected', 'true')
    rerender(<StrictMode><Tabs tabs={tabs} activeKey="no-existe" onChange={onChange} /></StrictMode>)
    expect(onChange).not.toHaveBeenCalled()
    const invalidWarnings = warn.mock.calls.filter(([, message]) => String(message).includes('no-existe'))
    expect(invalidWarnings).toHaveLength(1)
  })

  test('la notificación al padre sale del evento del usuario', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Tabs tabs={tabs} activeKey="resumen" onChange={onChange} />)
    await user.click(screen.getByRole('tab', { name: 'Actividad' }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('actividad')
  })

  test('cada pestaña lleva su clase de componente para el indicador', () => {
    render(<Tabs tabs={tabs} />)
    expect(screen.getByRole('tab', { name: 'Resumen' })).toHaveClass('nav-link', 'gcu-tabs__tab', 'active')
  })
})

describe('CSS de Tabs (src/styles/components/tabs.css)', () => {
  const css = componentCss('tabs')

  test('sin deuda: 0 !important, 0 hex, 0 overrides de tema', () => {
    expect(css).not.toMatch(DEBT)
  })

  test('indicador animado por transform con duración de token (reduced-motion la lleva a 0)', () => {
    expect(css).toMatch(/\.gcu-tabs__tab::after\{[^}]*transform:scaleX\(0\)/)
    expect(css).toMatch(/transition:transform var\(--gcu-duration-/)
    expect(css).toMatch(/\.gcu-tabs__tab\.active::after\{[^}]*transform:scaleX\(1\)/)
  })

  test('el hover de la pestaña es instantáneo (sin transición de color)', () => {
    expect(css).toMatch(/\.gcu-tabs \.gcu-tabs__tab\{[^}]*transition:none/)
  })

  test('foco con el anillo de tokens; contorno solo en alto contraste', () => {
    expect(css).toMatch(/\.gcu-tabs__tab:focus-visible\{[^}]*box-shadow:var\(--gcu-focus-ring\)/)
    expect(css).toMatch(/@media \(forced-colors:active\)\{[^@]*outline:2px solid currentColor/)
  })
})
