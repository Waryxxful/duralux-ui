import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import {
  CardBody,
  CardFooter,
  CardHeader,
  StatCard,
  StatusBadge,
  StatusButton,
} from '../src/components/shell/GranCrmExtras'

describe('GranCrmExtras refinado (lote L4)', () => {
  test('CardHeader, CardBody y CardFooter reenvían ref a su <div>', () => {
    const header = createRef<HTMLDivElement>()
    const body = createRef<HTMLDivElement>()
    const footer = createRef<HTMLDivElement>()
    render(<><CardHeader ref={header} title="Colas" /><CardBody ref={body} /><CardFooter ref={footer} /></>)
    expect(header.current).toHaveClass('card-header')
    expect(body.current).toHaveClass('card-body')
    expect(footer.current).toHaveClass('card-footer')
    expect(screen.getByRole('heading', { name: 'Colas' })).toBeInTheDocument()
  })

  test('StatusBadge y StatusButton reenvían ref', () => {
    const badge = createRef<HTMLSpanElement>()
    const button = createRef<HTMLButtonElement>()
    render(<><StatusBadge ref={badge} status="success" label="Activa" /><StatusButton ref={button} status="danger" label="Pausar" /></>)
    expect(badge.current).toHaveTextContent('Activa')
    expect(button.current).toBeInstanceOf(HTMLButtonElement)
    expect(button.current).toHaveAttribute('type', 'button')
  })

  test('StatCard es un componente real (DX-021): reenvía ref y traduce change a una variación con signo', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<StatCard ref={ref} title="Tickets abiertos" value={1240} variant="warning" change={{ value: 12.5, label: 'vs. mes pasado' }} />)
    expect(ref.current).toHaveClass('card', 'gcu-stats-card')
    expect(container.querySelector('.gcu-stat__value')).toHaveTextContent('1.240')
    expect(container.querySelector('.gcu-stat-delta')).toHaveTextContent(/Sube\s*\+12,5\s%/)
    expect(screen.getByText('vs. mes pasado')).toBeInTheDocument()
  })
})
