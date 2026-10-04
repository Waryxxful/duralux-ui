import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { ChatWindow } from '../src/components/chat/ChatWindow'

const CONTACT = { name: 'Ana Martínez', avatar: '/ana.png', online: true }

describe('ChatWindow refinado (lote L7)', () => {
  test('forwardRef a la sección y log de mensajes con aria-live cortés', () => {
    const ref = createRef<HTMLElement>()
    render(<ChatWindow ref={ref} contact={CONTACT} messages={<p>hola</p>} />)
    expect(ref.current).toHaveClass('chat-window')
    const log = screen.getByRole('log', { name: 'Mensajes' })
    expect(log).toHaveAttribute('aria-live', 'polite')
    expect(log).toHaveClass('chat-window__messages')
  })

  test('vacío: EmptyState dentro de la sección chat-window-empty', () => {
    const ref = createRef<HTMLElement>()
    const { container } = render(<ChatWindow ref={ref} contact={null} />)
    expect(ref.current).toHaveClass('chat-window-empty')
    expect(container.querySelector('.gcu-state--empty')).toHaveTextContent('Selecciona una conversación')
  })

  test('avatar del encabezado con el Avatar de la librería', () => {
    const { container } = render(<ChatWindow contact={CONTACT} />)
    expect(container.querySelector('.gcu-avatar img')).toHaveAttribute('alt', '')
  })

  test('volver a la lista solo existe con onBack y tiene nombre', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const { rerender } = render(<ChatWindow contact={CONTACT} />)
    expect(screen.queryByRole('button', { name: 'Volver a las conversaciones' })).not.toBeInTheDocument()

    rerender(<ChatWindow contact={CONTACT} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: 'Volver a las conversaciones' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  test('carga del historial: aria-busy y anuncio', () => {
    render(<ChatWindow contact={CONTACT} loading />)
    expect(screen.getByRole('log', { name: 'Mensajes' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Cargando mensajes')
  })

  test('className se agrega a la raíz', () => {
    const { container } = render(<ChatWindow contact={CONTACT} className="mi-chat" />)
    expect(container.firstElementChild).toHaveClass('chat-window', 'mi-chat')
  })
})
