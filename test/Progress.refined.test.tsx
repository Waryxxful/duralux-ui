import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Progress } from '../src/components/ui/Progress'
import { ProgressRing } from '../src/components/ui/ProgressRing'
import { DEBT, THEMES, componentCss, contrast, ruleOf } from './helpers/themeTokens'

const TONES = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo'] as const

describe('Progress refinado (receta de componente 2.3)', () => {
  test('reenvía ref al contenedor', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Progress ref={ref} value={40} />)
    expect(ref.current).toHaveClass('progress', 'gcu-progress')
  })

  test('la barra usa el tono con tokens, sin la utilidad bg-* de prioridad forzada', () => {
    render(<Progress value={40} variant="success" label="Meta diaria" />)
    const bar = screen.getByRole('progressbar', { name: 'Meta diaria' })
    expect(bar).toHaveClass('progress-bar', 'gcu-progress__bar', 'gcu-progress__bar--success')
    expect(bar.className).not.toMatch(/\bbg-/)
  })

  test('anuncia el valor en texto con formato es (número, espacio, %)', () => {
    render(<Progress value={84} label="Cumplimiento" showValue />)
    const bar = screen.getByRole('progressbar', { name: 'Cumplimiento' })
    expect(bar).toHaveAttribute('aria-valuetext', '84 %')
    expect(bar).toHaveTextContent('84 %')
  })
})

describe('ProgressRing refinado', () => {
  test('reenvía ref, anuncia el valor en texto y no lleva hex en el trazo', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ProgressRing ref={ref} value={30} max={60} aria-label="Llamadas atendidas" />)
    const ring = screen.getByRole('progressbar', { name: 'Llamadas atendidas' })
    expect(ref.current).toBe(ring)
    expect(ring).toHaveClass('gcu-progress-ring')
    expect(ring).toHaveAttribute('aria-valuetext', '50 %')
    expect(ring).toHaveTextContent('50 %')
    expect(ring.innerHTML).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  test('el color del consumidor llega al trazo (el CSS no lo pisa)', () => {
    const { container } = render(<ProgressRing value={50} color="var(--gcu-status-success)" />)
    expect(container.querySelector('.gcu-progress-ring__indicator')).toHaveAttribute('stroke', 'var(--gcu-status-success)')
  })
})

describe('CSS de Progress (src/styles/components/progress.css)', () => {
  const css = componentCss('progress')

  test('sin deuda: 0 !important, 0 hex, 0 overrides de tema', () => {
    expect(css).not.toMatch(DEBT)
  })

  test('cifras tabulares en el valor visible', () => {
    expect(css).toContain('font-variant-numeric:tabular-nums')
  })

  test.each(THEMES)('el valor sobre la barra cumple AA en %s', (theme) => {
    for (const tone of TONES) {
      const rule = ruleOf(css, `.gcu-progress__bar--${tone}`)
      const base = ruleOf(css, '.progress-bar.gcu-progress__bar')
      expect(contrast(theme, base.color, rule['--gcu-progress-fill']), tone).toBeGreaterThanOrEqual(4.5)
    }
  })
})
