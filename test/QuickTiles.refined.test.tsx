import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { QuickTiles } from '../src'

describe('QuickTiles active', () => {
  test('un botón active marca aria-pressed en todo el grupo', () => {
    render(
      <QuickTiles
        title="Atajos"
        items={[
          { label: 'Todas', onClick: () => {} },
          { label: 'Bajo la meta', onClick: () => {}, active: true },
          { label: 'Sin revisar', onClick: () => {} },
        ]}
      />,
    )
    expect(screen.getByRole('button', { name: 'Bajo la meta' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Bajo la meta' })).toHaveClass('gcu-quick-tiles__tile--active')
    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Sin revisar' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Todas' })).not.toHaveClass('gcu-quick-tiles__tile--active')
  })

  test('un enlace active usa aria-current y no aria-pressed', () => {
    render(
      <QuickTiles
        items={[
          { label: 'Campañas', href: '/campanas', active: true },
          { label: 'Contactos', href: '/contactos' },
        ]}
      />,
    )
    const current = screen.getByRole('link', { name: 'Campañas' })
    const other = screen.getByRole('link', { name: 'Contactos' })
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).not.toHaveAttribute('aria-pressed')
    expect(current).toHaveClass('gcu-quick-tiles__tile--active')
    expect(other).not.toHaveAttribute('aria-current')
    expect(other).not.toHaveAttribute('aria-pressed')
  })

  test('href gana sobre onClick: el tile activo es enlace y los botones del grupo publican aria-pressed', () => {
    render(
      <QuickTiles
        items={[
          { label: 'Campañas', href: '/campanas', onClick: () => {}, active: true },
          { label: 'Filtrar abiertas', onClick: () => {} },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Campañas' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Campañas' })).not.toHaveAttribute('aria-pressed')
    expect(screen.getByRole('button', { name: 'Filtrar abiertas' })).toHaveAttribute('aria-pressed', 'false')
  })

  test('sin active el DOM no lleva aria-pressed ni aria-current', () => {
    render(
      <QuickTiles
        items={[
          { label: 'Crear campaña', href: '/campanas/nueva' },
          { label: 'Importar contactos', onClick: () => {} },
        ]}
      />,
    )
    const link = screen.getByRole('link', { name: 'Crear campaña' })
    const button = screen.getByRole('button', { name: 'Importar contactos' })
    expect(link).not.toHaveAttribute('aria-pressed')
    expect(link).not.toHaveAttribute('aria-current')
    expect(button).not.toHaveAttribute('aria-pressed')
    expect(button).not.toHaveAttribute('aria-current')
    expect(link).not.toHaveClass('gcu-quick-tiles__tile--active')
    expect(button).not.toHaveClass('gcu-quick-tiles__tile--active')
  })
})
