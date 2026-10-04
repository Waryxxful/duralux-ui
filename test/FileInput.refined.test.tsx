import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { FileInput } from '../src/components/form/FileInput'

describe('FileInput refinado (receta de componente 2.3)', () => {
  test('reenvía ref al <input type="file">', () => {
    const ref = createRef<HTMLInputElement>()
    render(<FileInput ref={ref} label="Contrato" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveAttribute('type', 'file')
  })

  test('expone la clase de componente para su CSS (botón nativo con tokens, DX-010)', () => {
    render(<FileInput label="Adjunto" controlSize="sm" />)
    const input = screen.getByLabelText('Adjunto')
    expect(input).toHaveClass('form-control', 'gcu-file-input', 'form-control-sm')
  })

  test('el error booleano marca inválido sin mensaje huérfano', () => {
    render(<FileInput label="Respaldo" error />)
    const input = screen.getByLabelText('Respaldo')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).not.toHaveAttribute('aria-describedby')
  })
})
