import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { DescriptionList } from '../src'

afterEach(() => vi.restoreAllMocks())

describe('DescriptionList (lote N2)', () => {
  test('pares dt/dd con columnas por contenedor', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <DescriptionList
        ref={ref}
        columns={2}
        items={[
          { label: 'Cuenta', value: 'Retail Sur' },
          { label: 'Llamadas', value: 2840 },
          { label: 'ID', value: '#48213', mono: true },
        ]}
      />,
    )
    expect(ref.current).toHaveClass('gcu-description-list', 'gcu-container')
    expect(container.querySelector('dl')).toHaveClass('gcu-description-list__grid--cols-2')
    expect(container.querySelectorAll('dt')).toHaveLength(3)
    expect(screen.getByText('2.840')).toHaveClass('gcu-tabular')
    expect(screen.getByText('#48213')).toHaveClass('gcu-description-list__value--mono')
  })

  test('valores vacíos muestran «—» y «Sin dato»', () => {
    render(<DescriptionList items={[{ label: 'Teléfono', value: null }, { label: 'Correo', value: '' }]} />)
    expect(screen.getAllByText('Sin dato')).toHaveLength(2)
    expect(screen.getAllByText('—')).toHaveLength(2)
  })

  test('columns inválido avisa y usa 1', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error columnas inválidas a propósito
    const { container } = render(<DescriptionList columns={5} items={[{ label: 'A', value: 'B' }]} />)
    expect(container.querySelector('dl')).toHaveClass('gcu-description-list__grid--cols-1')
    expect(warn).toHaveBeenCalled()
  })

  test('carga: skeleton y aria-busy', () => {
    const { container } = render(<DescriptionList loading items={[]} />)
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelectorAll('.gcu-skeleton').length).toBeGreaterThan(0)
  })
})
