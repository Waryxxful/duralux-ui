import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { FormField } from '../src/components/form/FormField'
import { Input } from '../src/components/form/Input'
import { InputGroup } from '../src/components/form/InputGroup'
import { MultiSelect } from '../src/components/form/MultiSelect'
import { SearchableSelect } from '../src/components/form/SearchableSelect'
import { Select } from '../src/components/form/Select'

afterEach(() => vi.restoreAllMocks())

describe('FormField refinado (receta de componente 2.3)', () => {
  test('reenvía ref a la fila y responde a su contenedor (no al viewport)', () => {
    const ref = createRef<HTMLDivElement>()
    render(<FormField ref={ref} label="Nombre"><Input /></FormField>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toHaveClass('gcu-form-field')
    expect(ref.current?.querySelector('.col-lg-4')).toBeNull()
  })

  test('asocia label, ayuda y error a los controles TSX con forwardRef', () => {
    render(
      <>
        <FormField label="Estado" helpText="Elige uno"><Select options={['Activa']} /></FormField>
        <FormField label="País" error="Requerido"><SearchableSelect options={['Chile']} /></FormField>
        <FormField label="Etiquetas"><MultiSelect options={['VIP']} /></FormField>
        <FormField label="Monto"><InputGroup prepend="$"><input /></InputGroup></FormField>
      </>,
    )
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveAccessibleDescription('Elige uno')
    expect(screen.getByRole('combobox', { name: 'País' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('combobox', { name: 'Etiquetas' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Monto' })).toBeInTheDocument()
  })

  test('el error y la ayuda usan las clases del componente (tokens)', () => {
    render(<FormField label="RUT" error="RUT inválido"><Input /></FormField>)
    const error = screen.getByText('RUT inválido')
    expect(error).toHaveClass('gcu-form-field__error')
    expect(error).toHaveAttribute('role', 'alert')
  })
})

describe('InputGroup refinado (receta de componente 2.3)', () => {
  test('reenvía ref al contenedor .input-group y admite controlSize', () => {
    const ref = createRef<HTMLDivElement>()
    render(<InputGroup ref={ref} controlSize="sm" prepend="@"><input aria-label="Usuario" /></InputGroup>)
    expect(ref.current).toHaveClass('input-group', 'input-group-sm')
  })
})
