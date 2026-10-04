import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Card } from '../src/components/ui/Card'
import { DEBT, componentCss } from './helpers/themeTokens'

afterEach(() => vi.restoreAllMocks())

describe('Card refinado (receta de componente 2.3)', () => {
  test('reenvía ref al elemento raíz', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Card ref={ref} title="Resumen">Cuerpo</Card>)
    expect(ref.current).toHaveClass('card', 'gcu-card')
  })

  test('elementRef sigue funcionando, deprecado', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ref = createRef<HTMLDivElement>()
    render(<Card elementRef={ref}>Cuerpo</Card>)
    expect(ref.current).toHaveClass('card')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('elementRef'))
  })

  test('acciones genéricas con nombres en español (DX-029)', () => {
    render(<Card title="Ventas" onRefresh={() => {}} onRemove={() => {}} onExpand={() => {}}>Cuerpo</Card>)
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expandir' })).toBeInTheDocument()
  })

  test('interactive marca la elevación de hover solo cuando se pide', () => {
    const { container, rerender } = render(<Card>Cuerpo</Card>)
    expect(container.firstElementChild).not.toHaveClass('gcu-card--interactive')
    rerender(<Card interactive>Cuerpo</Card>)
    expect(container.firstElementChild).toHaveClass('gcu-card--interactive')
  })

  test('carga con skeleton: sin spinner, ocupado y con nombre anunciado', () => {
    const { container } = render(
      <Card title="Campañas" loading loadingVariant="skeleton" skeletonRows={4} loadingLabel="Cargando campañas">
        <p>Contenido real</p>
      </Card>,
    )
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelectorAll('.gcu-skeleton')).toHaveLength(4)
    expect(container.querySelector('.spinner-border')).toBeNull()
    expect(screen.queryByText('Contenido real')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando campañas')
  })

  test('la cabecera agrupa título y acciones en un contenedor que responde a su ancho', () => {
    const { container } = render(<Card title="Ventas" actions={<button type="button">Ver</button>}>Cuerpo</Card>)
    const inner = container.querySelector('.card-header .gcu-card-head')
    expect(inner).not.toBeNull()
    expect(inner?.querySelector('.card-header-action')).toHaveTextContent('Ver')
  })
})

describe('CSS de Card (src/styles/components/card.css)', () => {
  const css = componentCss('card')

  test('sin deuda: 0 !important, 0 hex, 0 overrides de tema', () => {
    expect(css).not.toMatch(DEBT)
  })

  test('elevación 1 en reposo y 2 en hover solo si es interactiva y con puntero real', () => {
    expect(css).toContain('box-shadow:var(--gcu-shadow-1)')
    expect(css).toMatch(/@media \(hover:hover\)\{\.gcu-card--interactive:hover\{box-shadow:var\(--gcu-shadow-2\)\}/)
  })

  test('cabecera con container query, no media query de viewport', () => {
    expect(css).toContain('container-type:inline-size')
    expect(css).toMatch(/@container \(min-width:28rem\)/)
  })
})
