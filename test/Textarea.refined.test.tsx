import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Textarea } from '../src/components/form/Textarea'

describe('Textarea refinado (receta de componente 2.3)', () => {
  test('reenvía ref al <textarea> nativo, con y sin ícono', () => {
    const ref = createRef<HTMLTextAreaElement>()
    const iconRef = createRef<HTMLTextAreaElement>()
    render(<><Textarea ref={ref} aria-label="Notas" /><Textarea ref={iconRef} aria-label="Comentario" icon="feather-edit" /></>)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    expect(iconRef.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  test('controlSize, error y solo lectura', () => {
    render(<Textarea aria-label="Detalle" controlSize="sm" error readOnly />)
    const field = screen.getByRole('textbox', { name: 'Detalle' })
    expect(field).toHaveClass('form-control', 'form-control-sm', 'is-invalid')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAttribute('readonly')
    expect(field).toHaveAttribute('rows', '4')
  })
})
