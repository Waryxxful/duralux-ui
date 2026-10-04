import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { MultiSelect } from '../src/components/form/MultiSelect'
import { SearchableSelect } from '../src/components/form/SearchableSelect'

afterEach(() => vi.restoreAllMocks())

const OPTIONS = [
  { value: 'cl', label: 'Chile' },
  { value: 'pe', label: 'Perú' },
  { value: 'mx', label: 'México' },
]

describe('SearchableSelect refinado (receta de componente 2.3)', () => {
  test('reenvía ref al <input role="combobox"> y el foco interno sigue funcionando', async () => {
    const user = userEvent.setup()
    const ref = createRef<HTMLInputElement>()
    render(<SearchableSelect ref={ref} aria-label="País" options={OPTIONS} defaultValue="cl" clearable />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toHaveAttribute('role', 'combobox')
    await user.click(screen.getByRole('button', { name: 'Limpiar selección' }))
    expect(ref.current).toHaveFocus()
  })

  test('DX-017: al abrir, la primera opción habilitada queda activa sin esperar un efecto', async () => {
    const user = userEvent.setup()
    render(<SearchableSelect aria-label="País" options={OPTIONS} />)
    const input = screen.getByRole('combobox', { name: 'País' })
    await user.click(input)
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Chile' }).id)
    await user.type(input, 'mé')
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'México' }).id)
  })

  test('DX-017: si la opción elegida desaparece, el valor no controlado deja de enviarse', () => {
    const { container, rerender } = render(
      <form><SearchableSelect aria-label="País" name="pais" options={OPTIONS} defaultValue="pe" /></form>,
    )
    expect(new FormData(container.querySelector('form')!).getAll('pais')).toEqual(['pe'])
    rerender(<form><SearchableSelect aria-label="País" name="pais" options={OPTIONS.filter(o => o.value !== 'pe')} defaultValue="pe" /></form>)
    expect(new FormData(container.querySelector('form')!).getAll('pais')).toEqual([])
    expect(screen.getByRole('combobox', { name: 'País' })).toHaveValue('')
  })

  test('DX-017: deshabilitar cierra la lista sin setState en efecto', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<SearchableSelect aria-label="País" options={OPTIONS} />)
    await user.click(screen.getByRole('combobox', { name: 'País' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    rerender(<SearchableSelect aria-label="País" options={OPTIONS} disabled />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  test('un renderOption que falla cae al label y se informa por log [duralux]', async () => {
    const user = userEvent.setup()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<SearchableSelect aria-label="Seguro" options={OPTIONS} renderOption={() => { throw new Error('x') }} />)
    await user.click(screen.getByRole('combobox', { name: 'Seguro' }))
    expect(screen.getByRole('option', { name: 'Chile' })).toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('renderOption'))
  })
})

describe('MultiSelect refinado (receta de componente 2.3)', () => {
  test('reenvía ref al <input role="combobox">', () => {
    const ref = createRef<HTMLInputElement>()
    render(<MultiSelect ref={ref} aria-label="Etiquetas" options={OPTIONS} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  test('DX-017: max recorta el valor no controlado en render, sin efecto ni callback', () => {
    const onChange = vi.fn()
    const { rerender } = render(<MultiSelect aria-label="Países" options={OPTIONS} defaultValue={['cl', 'pe']} onChange={onChange} />)
    expect(screen.getAllByRole('button', { name: /^Quitar/ })).toHaveLength(2)
    rerender(<MultiSelect aria-label="Países" options={OPTIONS} defaultValue={['cl', 'pe']} max={1} onChange={onChange} />)
    expect(screen.getAllByRole('button', { name: /^Quitar/ })).toHaveLength(1)
    expect(onChange).not.toHaveBeenCalled()
  })

  test('con max muestra el contador de selección con cifras tabulares', () => {
    render(<MultiSelect aria-label="Países" options={OPTIONS} defaultValue={['cl']} max={2} />)
    expect(screen.getByText('1 de 2')).toHaveClass('gcu-multiselect__count')
  })
})
