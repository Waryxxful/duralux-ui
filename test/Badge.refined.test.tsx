import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Badge } from '../src/components/ui/Badge'
import { DEBT, THEMES, componentCss, contrast, ruleOf } from './helpers/themeTokens'

afterEach(() => vi.restoreAllMocks())

const TONES = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark'] as const

describe('Badge refinado (receta de componente 2.3)', () => {
  test('reenvía ref al elemento raíz', () => {
    const ref = createRef<HTMLElement>()
    render(<Badge ref={ref}>Activo</Badge>)
    expect(ref.current?.tagName).toBe('SPAN')
  })

  test('suave usa clases propias con tokens, sin utilidades Bootstrap con prioridad forzada', () => {
    render(<Badge variant="success" soft>Cumplido</Badge>)
    const badge = screen.getByText('Cumplido')
    expect(badge).toHaveClass('badge', 'gcu-badge', 'gcu-badge--soft', 'gcu-badge--success')
    expect(badge.className).not.toMatch(/\bbg-|\btext-/)
  })

  test('sólido usa la variante sólida del tono', () => {
    render(<Badge variant="danger">Vencido</Badge>)
    expect(screen.getByText('Vencido')).toHaveClass('gcu-badge--solid', 'gcu-badge--danger')
  })

  test('light conserva el chip de alto contraste', () => {
    render(<Badge variant="light">Borrador</Badge>)
    expect(screen.getByText('Borrador')).toHaveClass('gcu-badge', 'gcu-badge--light')
  })

  test('las variantes light-{tono} del tipo público se pintan suaves', () => {
    render(<Badge variant="light-warning">En riesgo</Badge>)
    expect(screen.getByText('En riesgo')).toHaveClass('gcu-badge--soft', 'gcu-badge--warning')
  })

  test('punto de estado decorativo: el estado sigue en el texto', () => {
    const { container } = render(<Badge variant="success" soft dot>En línea</Badge>)
    const dot = container.querySelector('.gcu-badge__dot')
    expect(dot).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('En línea')).toBeInTheDocument()
  })

  test('como botón: interactivo por clase, sin estilo inline', () => {
    render(<Badge as="button" type="button" variant="info">Filtrar</Badge>)
    const button = screen.getByRole('button', { name: 'Filtrar' })
    expect(button).toHaveClass('gcu-badge--interactive')
    expect(button).not.toHaveAttribute('style')
  })

  test('un tono desconocido avisa con prefijo [duralux] y cae en primary', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // SAFETY: se fuerza un tono fuera del tipo público para probar el fallback en runtime.
    render(<Badge variant={'rosa' as never}>X</Badge>)
    expect(screen.getByText('X')).toHaveClass('gcu-badge--primary')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('rosa'))
  })
})

describe('CSS de Badge (src/styles/components/badge.css)', () => {
  const css = componentCss('badge')

  test('sin deuda: 0 !important, 0 hex, 0 overrides de tema', () => {
    expect(css).not.toMatch(DEBT)
  })

  test.each(THEMES)('suave y sólido cumplen AA en %s', (theme) => {
    for (const tone of TONES) {
      const sel = `.gcu-badge--${tone}`
      expect(contrast(theme, ruleOf(css, sel, '--gcu-badge-soft-fg'), ruleOf(css, sel, '--gcu-badge-soft-bg')), `soft ${tone}`).toBeGreaterThanOrEqual(4.5)
      expect(contrast(theme, ruleOf(css, sel, '--gcu-badge-solid-fg'), ruleOf(css, sel, '--gcu-badge-solid-bg')), `solid ${tone}`).toBeGreaterThanOrEqual(4.5)
    }
    const chip = '.gcu-badge.gcu-badge--light'
    expect(contrast(theme, ruleOf(css, chip, 'color'), ruleOf(css, chip, 'background-color'))).toBeGreaterThanOrEqual(4.5)
  })
})
