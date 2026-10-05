import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Checkbox } from '../src/components/form/Checkbox'
import { Radio } from '../src/components/form/Radio'

afterEach(() => vi.restoreAllMocks())

describe('Checkbox refinado (receta de componente 2.3)', () => {
  test('reenvía ref al <input type="checkbox"> y conserva indeterminate', () => {
    const ref = createRef<HTMLInputElement>()
    const { rerender } = render(<Checkbox ref={ref} label="Todos" indeterminate />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.indeterminate).toBe(true)
    rerender(<Checkbox ref={ref} label="Todos" />)
    expect(ref.current?.indeterminate).toBe(false)
  })

  test('acepta ref de callback', () => {
    let node: HTMLInputElement | null = null
    render(<Checkbox ref={(el) => { node = el }} label="Acepto" />)
    expect(node).toBeInstanceOf(HTMLInputElement)
  })

  test('se opera con teclado (Espacio) y el label es el nombre accesible', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox label="Recibir avisos" onChange={onChange} />)
    const box = screen.getByRole('checkbox', { name: 'Recibir avisos' })
    box.focus()
    await user.keyboard(' ')
    expect(onChange).toHaveBeenCalled()
    expect(box).toBeChecked()
  })

})

describe('Radio refinado (receta de componente 2.3)', () => {
  test('reenvía ref al <input type="radio">', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Radio ref={ref} name="plan" label="Mensual" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveAttribute('type', 'radio')
  })

  test('deshabilitado y error llegan al control', () => {
    render(<><Radio name="p" label="Anual" disabled /><Radio name="p" label="Semestral" error /></>)
    expect(screen.getByRole('radio', { name: 'Anual' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Semestral' })).toHaveAttribute('aria-invalid', 'true')
  })
})
