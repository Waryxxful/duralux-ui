import { createRef, useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { FilterChip } from '../src'
import type { FilterChipOption } from '../src'

afterEach(() => vi.restoreAllMocks())

const EQUIPOS: FilterChipOption[] = [
  { value: 'ventas', label: 'Ventas', count: 12 },
  { value: 'retencion', label: 'Retención', count: 1234 },
  { value: 'cobranza', label: 'Cobranza', count: 3 },
  { value: 'calidad', label: <strong>Calidad</strong>, textValue: 'Calidad' },
]

function panelOf(container: HTMLElement): HTMLElement {
  return container.querySelector('.gcu-filter-chip__panel') as HTMLElement
}

describe('FilterChip', () => {
  test('inactiva: borde punteado, «+» y el nombre; reenvía ref al div raíz', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<FilterChip ref={ref} label="Equipo" options={EQUIPOS} />)
    expect(ref.current).toHaveClass('dropdown', 'gcu-filter-chip')
    expect(ref.current).not.toHaveClass('gcu-filter-chip--active')
    const trigger = screen.getByRole('button', { name: 'Equipo' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('.feather-plus')).toBeInTheDocument()
  })

  test('activa: resume hasta dos valores y luego «X y N más»; el nombre accesible lleva el valor', () => {
    const { rerender, container } = render(<FilterChip label="Equipo" options={EQUIPOS} value={['retencion', 'ventas']} />)
    expect(container.firstElementChild).toHaveClass('gcu-filter-chip--active')
    expect(screen.getByRole('button', { name: 'Equipo: Ventas, Retención' })).toBeInTheDocument()
    expect(container.querySelector('.feather-plus')).not.toBeInTheDocument()
    rerender(<FilterChip label="Equipo" options={EQUIPOS} value={['ventas', 'retencion', 'cobranza', 'calidad']} />)
    expect(screen.getByRole('button', { name: 'Equipo: Ventas y 3 más' })).toBeInTheDocument()
    rerender(<FilterChip label="Equipo" options={EQUIPOS} value={['calidad']} />)
    expect(screen.getByRole('button', { name: 'Equipo: Calidad' })).toBeInTheDocument()
  })

  test('abre el panel con casillas y cantidades; marcar y desmarcar llama onChange en el orden de las opciones', async () => {
    const user = userEvent.setup()
    function Controlado({ onChange }: { onChange: (v: string[]) => void }) {
      const [value, setValue] = useState<string[]>(['cobranza'])
      return <FilterChip label="Equipo" options={EQUIPOS} value={value} onChange={(v) => { onChange(v); setValue(v) }} />
    }
    const onChange = vi.fn()
    const { container } = render(<Controlado onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Equipo: Cobranza' }))
    const panel = panelOf(container)
    expect(panel).toHaveClass('show')
    expect(within(panel).getByText('1.234')).toHaveClass('gcu-filter-chip__count')
    expect(within(panel).getByRole('checkbox', { name: /Cobranza/ })).toBeChecked()
    expect(within(panel).getByRole('checkbox', { name: /Ventas/ })).toHaveFocus()
    await user.click(within(panel).getByRole('checkbox', { name: /Ventas/ }))
    expect(onChange).toHaveBeenLastCalledWith(['ventas', 'cobranza'])
    expect(panel).toHaveClass('show')
    await user.click(within(panel).getByRole('checkbox', { name: /Cobranza/ }))
    expect(onChange).toHaveBeenLastCalledWith(['ventas'])
    expect(screen.getByRole('button', { name: 'Equipo: Ventas' })).toBeInTheDocument()
  })

  test('«Quitar el filtro» vacía la selección con onChange([]), cierra y devuelve el foco', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<FilterChip label="Equipo" options={EQUIPOS} value={['ventas']} onChange={onChange} />)
    const trigger = screen.getByRole('button', { name: 'Equipo: Ventas' })
    await user.click(trigger)
    await user.click(within(panelOf(container)).getByRole('button', { name: 'Quitar el filtro' }))
    expect(onChange).toHaveBeenCalledWith([])
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  test('onClear propio y clearLabel; sin filtro aplicado no hay botón de quitar', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    const onChange = vi.fn()
    const { container, rerender } = render(
      <FilterChip label="Equipo" options={EQUIPOS} value={['ventas']} onChange={onChange} onClear={onClear} clearLabel="Limpiar equipo" />,
    )
    await user.click(screen.getByRole('button', { name: 'Equipo: Ventas' }))
    await user.click(within(panelOf(container)).getByRole('button', { name: 'Limpiar equipo' }))
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
    rerender(<FilterChip label="Equipo" options={EQUIPOS} value={[]} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Equipo' }))
    expect(within(panelOf(container)).queryByRole('button', { name: 'Quitar el filtro' })).not.toBeInTheDocument()
  })

  test('búsqueda: aparece con más de 8 opciones, ignora tildes y muestra el texto vacío', async () => {
    const user = userEvent.setup()
    const muchas: FilterChipOption[] = Array.from({ length: 9 }, (_, i) => ({ value: `o${i}`, label: `Opción ${i}` }))
    muchas.push({ value: 'ret', label: 'Retención' })
    const { container } = render(<FilterChip label="Cola" options={muchas} emptyText="Sin coincidencias." />)
    await user.click(screen.getByRole('button', { name: 'Cola' }))
    const panel = panelOf(container)
    const search = within(panel).getByRole('searchbox', { name: 'Buscar en Cola' })
    expect(search).toHaveFocus()
    expect(search).toHaveAttribute('placeholder', 'Buscar…')
    await user.type(search, 'retencion')
    expect(within(panel).getAllByRole('checkbox')).toHaveLength(1)
    await user.clear(search)
    await user.type(search, 'zzz')
    expect(within(panel).queryByRole('checkbox')).not.toBeInTheDocument()
    expect(within(panel).getByText('Sin coincidencias.')).toBeInTheDocument()
  })

  test('sin búsqueda con pocas opciones (salvo searchable) y texto vacío por defecto', async () => {
    const user = userEvent.setup()
    const { container, rerender } = render(<FilterChip label="Rol" options={EQUIPOS} />)
    await user.click(screen.getByRole('button', { name: 'Rol' }))
    expect(within(panelOf(container)).queryByRole('searchbox')).not.toBeInTheDocument()
    rerender(<FilterChip label="Rol" options={EQUIPOS} searchable searchPlaceholder="Busca un rol" />)
    expect(within(panelOf(container)).getByRole('searchbox')).toHaveAttribute('placeholder', 'Busca un rol')
    rerender(<FilterChip label="Rol" options={[]} />)
    expect(within(panelOf(container)).getByText('No hay opciones.')).toBeInTheDocument()
  })

  test('panel propio con valueText: activa con el valor y quitar llama onClear', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    const { container, rerender } = render(
      <FilterChip label="Vence" valueText="01-09-2026" onClear={onClear}>
        <label htmlFor="fecha">Fecha</label>
        <input id="fecha" type="text" defaultValue="01-09-2026" />
      </FilterChip>,
    )
    expect(container.firstElementChild).toHaveClass('gcu-filter-chip--active')
    await user.click(screen.getByRole('button', { name: 'Vence: 01-09-2026' }))
    const panel = panelOf(container)
    expect(within(panel).getByLabelText('Fecha')).toHaveFocus()
    expect(within(panel).queryByRole('checkbox')).not.toBeInTheDocument()
    await user.click(within(panel).getByRole('button', { name: 'Quitar el filtro' }))
    expect(onClear).toHaveBeenCalledTimes(1)
    rerender(<FilterChip label="Vence" valueText=""><span>panel</span></FilterChip>)
    expect(screen.getByRole('button', { name: 'Vence' })).toBeInTheDocument()
    expect(container.firstElementChild).not.toHaveClass('gcu-filter-chip--active')
  })

  test('Esc cierra y devuelve el foco; disabled no abre', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<FilterChip label="Equipo" options={EQUIPOS} />)
    const trigger = screen.getByRole('button', { name: 'Equipo' })
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
    rerender(<FilterChip label="Equipo" options={EQUIPOS} disabled />)
    expect(trigger).toBeDisabled()
  })
})
