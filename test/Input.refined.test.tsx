import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Input } from '../src/components/form/Input'

afterEach(() => vi.restoreAllMocks())

describe('Input refinado (receta de componente 2.3)', () => {
  test('reenvía ref al <input> nativo, también con addons', () => {
    const ref = createRef<HTMLInputElement>()
    const addonRef = createRef<HTMLInputElement>()
    render(<><Input ref={ref} aria-label="Nombre" /><Input ref={addonRef} aria-label="Monto" startAddon="$" /></>)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(addonRef.current).toBeInstanceOf(HTMLInputElement)
    expect(addonRef.current?.closest('.input-group')).not.toBeNull()
  })

  test('controlSize aplica las alturas sm/lg de Bootstrap sin tocar el atributo nativo size', () => {
    render(<><Input aria-label="Chico" controlSize="sm" size={12} /><Input aria-label="Grande" controlSize="lg" /><Input aria-label="Medio" controlSize="md" /></>)
    const small = screen.getByRole('textbox', { name: 'Chico' })
    expect(small).toHaveClass('form-control', 'form-control-sm')
    expect(small).toHaveAttribute('size', '12')
    expect(screen.getByRole('textbox', { name: 'Grande' })).toHaveClass('form-control-lg')
    expect(screen.getByRole('textbox', { name: 'Medio' }).className).not.toMatch(/form-control-(sm|md|lg)/)
  })

  test('readOnly y disabled llegan al control nativo', () => {
    render(<><Input aria-label="Solo lectura" readOnly defaultValue="CL-001" /><Input aria-label="Bloqueado" disabled /></>)
    expect(screen.getByRole('textbox', { name: 'Solo lectura' })).toHaveAttribute('readonly')
    expect(screen.getByRole('textbox', { name: 'Bloqueado' })).toBeDisabled()
  })

})
