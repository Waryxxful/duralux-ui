import { createRef } from 'react'
import type * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Dropdown, DropdownMenu } from '../src/components/ui/Dropdown'

afterEach(() => vi.restoreAllMocks())

function Menu({ rootRef, menuRef }: { rootRef?: React.Ref<HTMLDivElement>, menuRef?: React.Ref<HTMLElement> }) {
  return (
    <Dropdown ref={rootRef} trigger={(props) => <button {...props}>Acciones</button>}>
      <DropdownMenu ref={menuRef}>
        <button type="button" className="dropdown-item">Exportar reporte</button>
      </DropdownMenu>
    </Dropdown>
  )
}

describe('Dropdown refinado (receta de componente 2.3)', () => {
  test('Dropdown y DropdownMenu reenvían ref', () => {
    const rootRef = createRef<HTMLDivElement>()
    const menuRef = createRef<HTMLElement>()
    render(<Menu rootRef={rootRef} menuRef={menuRef} />)
    expect(rootRef.current).toHaveClass('dropdown')
    expect(menuRef.current).toHaveClass('dropdown-menu')
  })

  test('el menú lleva la clase del componente y Esc lo cierra devolviendo el foco', async () => {
    const user = userEvent.setup()
    render(<Menu />)
    const trigger = screen.getByRole('button', { name: 'Acciones' })
    await user.click(trigger)
    expect(document.querySelector('.dropdown-menu')).toHaveClass('gcu-dropdown-menu', 'show')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  test('DropdownMenu fuera de Dropdown registra el error con prefijo [duralux]', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<DropdownMenu>x</DropdownMenu>)).toThrow()
    expect(error).toHaveBeenCalledWith('[duralux]', expect.stringContaining('DropdownMenu'))
  })
})
