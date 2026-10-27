import { createRef } from 'react'
import type * as React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ActionMenu } from '../src'

afterEach(() => vi.restoreAllMocks())

describe('ActionMenu', () => {
  function renderMenu(overrides: Partial<React.ComponentProps<typeof ActionMenu>> = {}) {
    const editar = vi.fn()
    const subir = vi.fn()
    const archivar = vi.fn()
    const eliminar = vi.fn()
    const utils = render(
      <ActionMenu
        label="Acciones de la lección 2.3"
        items={[
          { key: 'editar', label: 'Editar', icon: 'edit-2', onSelect: editar, description: 'Cambia título y contenido' },
          { key: 'subir', label: 'Subir', icon: 'arrow-up', onSelect: subir, shortcut: 'Alt ↑' },
          { key: 'archivar', label: 'Archivar', onSelect: archivar, disabled: true },
          { key: 'eliminar', label: 'Eliminar', icon: 'trash-2', onSelect: eliminar, tone: 'danger', separatorBefore: true },
        ]}
        {...overrides}
      />,
    )
    return { ...utils, editar, subir, archivar, eliminar }
  }

  test('botón cuadrado con nombre y title; menú con menuitems; ref al div raíz', async () => {
    const user = userEvent.setup()
    const ref = createRef<HTMLDivElement>()
    renderMenu({ ref })
    expect(ref.current).toHaveClass('dropdown', 'gcu-action-menu')
    const trigger = screen.getByRole('button', { name: 'Acciones de la lección 2.3' })
    expect(trigger).toHaveAttribute('title', 'Acciones de la lección 2.3')
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveClass('btn-icon', 'btn-sm', 'gcu-action-menu__trigger--sm')
    expect(trigger.querySelector('.feather-more-horizontal')).toBeInTheDocument()
    await user.click(trigger)
    const menu = screen.getByRole('menu')
    expect(menu).toHaveClass('show')
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(4)
    expect(within(menu).getByRole('menuitem', { name: 'Editar' })).toHaveFocus()
    expect(within(menu).getByRole('menuitem', { name: 'Editar' })).toHaveAccessibleDescription('Cambia título y contenido')
    expect(within(menu).getByText('Alt ↑')).toHaveClass('gcu-action-menu__shortcut')
  })

  test('elegir un ítem cierra, devuelve el foco y llama onSelect', async () => {
    const user = userEvent.setup()
    const { subir } = renderMenu()
    const trigger = screen.getByRole('button', { name: 'Acciones de la lección 2.3' })
    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: 'Subir' }))
    expect(subir).toHaveBeenCalledTimes(1)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  test('peligro, separador y deshabilitado', async () => {
    const user = userEvent.setup()
    const { archivar, container } = renderMenu()
    await user.click(screen.getByRole('button', { name: 'Acciones de la lección 2.3' }))
    const eliminar = screen.getByRole('menuitem', { name: 'Eliminar' })
    expect(eliminar).toHaveClass('gcu-action-menu__item--danger', 'gcu-dropdown-item--danger')
    expect(eliminar.previousElementSibling).toHaveAttribute('role', 'separator')
    expect(container.querySelectorAll('[role="separator"]')).toHaveLength(1)
    const archivarItem = screen.getByRole('menuitem', { name: 'Archivar' })
    expect(archivarItem).toBeDisabled()
    await user.click(archivarItem)
    expect(archivar).not.toHaveBeenCalled()
  })

  test('teclado: ↓ abre en el primero, ↑/↓/Fin saltan deshabilitados, Enter elige, Esc devuelve el foco', async () => {
    const user = userEvent.setup()
    const { eliminar } = renderMenu()
    const trigger = screen.getByRole('button', { name: 'Acciones de la lección 2.3' })
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus()
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus()
    await user.keyboard('{End}')
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(eliminar).toHaveBeenCalledTimes(1)
    expect(trigger).toHaveFocus()
  })

  test('size md, ícono propio y disabled', () => {
    renderMenu({ size: 'md', icon: 'more-vertical', disabled: true })
    const trigger = screen.getByRole('button', { name: 'Acciones de la lección 2.3' })
    expect(trigger).toHaveClass('gcu-action-menu__trigger--md')
    expect(trigger).not.toHaveClass('btn-sm')
    expect(trigger.querySelector('.feather-more-vertical')).toBeInTheDocument()
    expect(trigger).toBeDisabled()
  })
})
