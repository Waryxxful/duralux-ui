import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Person } from '../src'

describe('Person (lote N2)', () => {
  test('avatar decorativo + nombre + dato, con title para el truncado', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(<Person ref={ref} name="Camila Rojas" meta="Supervisora · Cobranza" />)
    expect(ref.current).toHaveClass('gcu-person')
    expect(container.querySelector('.gcu-avatar')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Camila Rojas')).toHaveAttribute('title', 'Camila Rojas')
    expect(screen.getByText('Supervisora · Cobranza')).toHaveAttribute('title', 'Supervisora · Cobranza')
    expect(container.querySelector('.gcu-avatar')).toHaveTextContent('CR')
  })

  test('sin meta no deja nodos vacíos', () => {
    const { container } = render(<Person name="Ana" />)
    expect(container.querySelector('.gcu-person__meta')).toBeNull()
  })
})
