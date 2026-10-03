import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { StatsCard } from '../src/components/ui/StatsCard'
import { DataTable } from '../src/components/data/DataTable'

describe('nombres accesibles (verificación final 2.1)', () => {
  test('la tendencia de StatsCard se anuncia con texto, sin aria-label en un div sin rol (DX-007)', () => {
    const { container } = render(<StatsCard label="Leads" value="120" icon="feather-users" trend={{ up: true, value: '+12%' }} />)
    expect(container.querySelector('div[aria-label]')).toBeNull()
    expect(container.textContent).toContain('Sube')
    expect(container.textContent).toContain('+12%')
  })

  test('la paginación de DataTable tiene un nombre propio, distinto de una paginación suelta (DX-005)', () => {
    const rows = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Fila ${i}` }))
    render(<DataTable aria-label="Clientes" columns={[{ key: 'name', label: 'Nombre' }]} data={rows} rowKey="id" pageSize={10} />)
    expect(screen.getByRole('navigation', { name: 'Paginación de Clientes' })).toBeInTheDocument()
  })
})
