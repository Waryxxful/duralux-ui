import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Timeline } from '../src/components/ui/Timeline'
import { ActivityFeed } from '../src/components/ui/ActivityFeed'
import { formatDateTime, formatPercent, formatRelative } from '../src/utils/format'
import { DEBT, componentCss } from './helpers/themeTokens'

afterEach(() => vi.restoreAllMocks())

const NOW = new Date(2026, 9, 4, 16, 42)
const FIVE_MIN_AGO = new Date(2026, 9, 4, 16, 37)
const YESTERDAY = new Date(2026, 9, 3, 9, 5)

describe('formatos es (REGLAS §8)', () => {
  test('fecha dd-mm-aaaa y hora 24 h', () => {
    expect(formatDateTime(YESTERDAY)).toBe('03-10-2026 09:05')
  })

  test('tiempo relativo legible en español', () => {
    expect(formatRelative(new Date(NOW.getTime() - 10_000), NOW)).toBe('hace un momento')
    expect(formatRelative(FIVE_MIN_AGO, NOW)).toBe('hace 5 minutos')
    expect(formatRelative(YESTERDAY, NOW)).toBe('ayer')
  })

  test('porcentaje con espacio duro', () => {
    expect(formatPercent(84.4)).toBe('84 %')
  })
})

describe('Timeline refinado (receta de componente 2.3)', () => {
  test('reenvía ref a la lista', () => {
    const ref = createRef<HTMLUListElement>()
    render(<Timeline ref={ref} items={[{ id: 1, title: 'Llamada' }]} />)
    expect(ref.current).toHaveClass('gcu-timeline')
  })

  test('con `date` muestra tiempo relativo y la fecha completa en dateTime y title', () => {
    render(<Timeline now={NOW} items={[{ id: 1, title: 'Ticket cerrado', date: FIVE_MIN_AGO }]} />)
    const time = screen.getByText('hace 5 minutos')
    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('dateTime', FIVE_MIN_AGO.toISOString())
    expect(time).toHaveAttribute('title', '04-10-2026 16:37')
  })

  test('el marcador usa el tono con tokens y el ícono es decorativo', () => {
    const { container } = render(<Timeline items={[{ id: 1, title: 'Alerta', variant: 'danger', icon: 'feather-alert-triangle' }]} />)
    const marker = container.querySelector('.gcu-timeline__marker')
    expect(marker).toHaveClass('gcu-timeline__marker--danger')
    expect(marker?.className).not.toMatch(/\bbg-|\btext-/)
    expect(marker?.querySelector('i')).toHaveAttribute('aria-hidden', 'true')
  })

  test('iconBg sigue aplicándose, deprecado', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Timeline items={[{ id: 1, title: 'X', iconBg: 'bg-soft-success' }]} />)
    expect(container.querySelector('.gcu-timeline__marker')).toHaveClass('bg-soft-success')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('iconBg'))
  })
})

describe('ActivityFeed refinado', () => {
  test('reenvía ref, usa clases propias y fecha relativa', () => {
    const ref = createRef<HTMLUListElement>()
    render(
      <ActivityFeed
        ref={ref}
        now={NOW}
        items={[{ key: 'a', variant: 'success', title: 'Pago recibido', date: YESTERDAY }]}
      />,
    )
    expect(ref.current).toHaveClass('gcu-activity-feed')
    expect(ref.current?.querySelector('li')).toHaveClass('gcu-activity-feed__item', 'gcu-activity-feed__item--success')
    expect(screen.getByText('ayer')).toHaveAttribute('title', '03-10-2026 09:05')
  })
})

describe('CSS de Timeline y ActivityFeed', () => {
  test.each(['timeline', 'activity-feed'])('%s.css sin deuda, cifras tabulares y container query', (name) => {
    const css = componentCss(name)
    expect(css).not.toMatch(DEBT)
    expect(css).toContain('font-variant-numeric:tabular-nums')
    expect(css).toContain('container-type:inline-size')
    expect(css).toMatch(/@container \(min-width:28rem\)/)
  })
})
