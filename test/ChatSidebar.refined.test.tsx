import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { ChatSidebar } from '../src/components/chat/ChatSidebar'

const CONTACTS = [
  { id: 'ana', name: 'Ana Martínez', preview: 'Hola', time: '10:05', online: true, unread: 3 },
  { id: 'carlos', name: 'Carlos Ruiz', preview: 'Revisa el documento', time: '09:30', unread: 0 },
]

describe('ChatSidebar refinado (lote L7)', () => {
  test('forwardRef al aside y lista seleccionable como listbox/option', async () => {
    const user = userEvent.setup()
    const ref = createRef<HTMLElement>()
    const onSelect = vi.fn()
    render(<ChatSidebar ref={ref} contacts={CONTACTS} onSelect={onSelect} />)

    expect(ref.current?.tagName).toBe('ASIDE')
    expect(ref.current).toHaveClass('content-sidebar')
    const listbox = screen.getByRole('listbox', { name: 'Lista de conversaciones' })
    const ana = screen.getByRole('option', { name: 'Ana Martínez' })
    expect(listbox).toContainElement(ana)
    expect(ana).toHaveAttribute('aria-selected', 'false')

    await user.click(ana)
    expect(ana).toHaveAttribute('aria-selected', 'true')
    expect(onSelect).toHaveBeenCalledWith(CONTACTS[0])
  })

  test('las apps siguen encontrando el contacto como li > button', () => {
    const { container } = render(<ChatSidebar contacts={CONTACTS} onSelect={vi.fn()} />)
    expect(container.querySelector('.content-sidebar-body li button')).not.toBeNull()
  })

  test('no leídos con el Badge de la librería y cifras tabulares', () => {
    const { container } = render(<ChatSidebar contacts={CONTACTS} onSelect={vi.fn()} />)
    const badge = container.querySelector('.gcu-badge')
    expect(badge).toHaveTextContent('3')
    expect(container.querySelectorAll('.gcu-badge')).toHaveLength(1)
    expect(container.querySelector('.gcu-chat-contact--unread')).not.toBeNull()
  })

  test('sin conversaciones: EmptyState con título y explicación', () => {
    const { container } = render(<ChatSidebar contacts={[]} />)
    expect(container.querySelector('.gcu-state--empty')).not.toBeNull()
    expect(screen.getByText('Todavía no hay conversaciones')).toBeInTheDocument()
  })

  test('noResults personalizado sigue usándose cuando la lista está vacía (compatibilidad)', () => {
    render(<ChatSidebar contacts={[]} labels={{ noResults: 'Aún no tienes conversaciones.' }} />)
    expect(screen.getByText('Aún no tienes conversaciones.')).toBeInTheDocument()
  })

  test('sin resultados de búsqueda: EmptyState con sugerencia', async () => {
    const user = userEvent.setup()
    const { container } = render(<ChatSidebar contacts={CONTACTS} />)
    await user.type(screen.getByRole('searchbox'), 'zzz')
    expect(container.querySelector('.gcu-state--empty')).toHaveTextContent('No se encontraron conversaciones')
  })

  test('carga: aria-busy y anuncio', () => {
    const { container } = render(<ChatSidebar contacts={[]} loading />)
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Cargando conversaciones')
  })

  test('DX-017: retirar el contacto enfocado mueve el foco sin estado ajustado en efectos', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ChatSidebar contacts={CONTACTS} onSelect={vi.fn()} />)
    screen.getByRole('option', { name: 'Ana Martínez' }).focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Carlos Ruiz' })).toHaveFocus()

    rerender(<ChatSidebar contacts={[CONTACTS[0]]} onSelect={vi.fn()} />)
    const ana = screen.getByRole('option', { name: 'Ana Martínez' })
    expect(ana).toHaveFocus()
    expect(ana).toHaveAttribute('tabindex', '0')
  })
})
