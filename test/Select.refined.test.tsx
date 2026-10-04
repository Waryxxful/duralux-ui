import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Select } from '../src/components/form/Select'

afterEach(() => vi.restoreAllMocks())

describe('Select refinado (receta de componente 2.3)', () => {
  test('reenvía ref al <select> nativo', () => {
    const ref = createRef<HTMLSelectElement>()
    render(<Select ref={ref} aria-label="Estado" options={['Activa', 'Pausada']} />)
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })

  test('controlSize aplica form-select-sm/-lg', () => {
    render(<><Select aria-label="Chico" controlSize="sm" options={[1]} /><Select aria-label="Grande" controlSize="lg" options={[1]} /></>)
    expect(screen.getByRole('combobox', { name: 'Chico' })).toHaveClass('form-select', 'form-select-sm')
    expect(screen.getByRole('combobox', { name: 'Grande' })).toHaveClass('form-select-lg')
  })

  test('las opciones descartadas se informan por log con prefijo [duralux]', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // SAFETY: se fuerza una opción fuera del tipo público para probar el descarte en runtime.
    render(<Select aria-label="Con basura" options={[null as never, 'Ok']} />)
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('Select'))
  })
})
