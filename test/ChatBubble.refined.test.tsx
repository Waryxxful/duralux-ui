import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import {
  ChatBubble,
  ChatDaySeparator,
  ChatTypingIndicator,
} from '../src/components/chat/ChatBubble'
import { formatChatDay, groupChatMessages } from '../src/components/chat/chatModel'

const NOW = new Date(2026, 9, 4, 12, 0)

describe('ChatBubble refinado (lote L7)', () => {
  test('forwardRef al contenedor del mensaje y burbuja con las clases de MessageBubble', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <ChatBubble ref={ref} message={{ text: 'Hola', time: '10:00', sender: { name: 'Ana' }, mine: true }} />,
    )

    expect(ref.current).toHaveClass('single-chat-item', 'gcu-chat-message', 'gcu-chat-message--outgoing')
    const bubble = container.querySelector('.chat-bubble-content')
    expect(bubble).toHaveClass('gcu-message-bubble', 'gcu-message-bubble--outgoing')
    expect(screen.getByText('10:00').tagName).toBe('TIME')
  })

  test('agrupado: sin avatar ni nombre repetidos', () => {
    const { container } = render(
      <ChatBubble grouped message={{ text: 'Sigo aquí', sender: { name: 'Ana' } }} />,
    )
    expect(container.querySelector('.gcu-chat-message--grouped')).not.toBeNull()
    expect(screen.queryByText('Ana')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  test('avatar con el Avatar de la librería (contorno de imagen) y decorativo', () => {
    const { container } = render(
      <ChatBubble message={{ text: 'Hola', sender: { name: 'Ana', avatar: '/ana.png' } }} />,
    )
    expect(container.querySelector('.gcu-avatar img')).toHaveAttribute('alt', '')
  })

  test('error de envío: texto visible y reintento accesible', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const message = { id: 7, text: 'Hola', mine: true, status: 'failed' as const }
    render(<ChatBubble message={message} onRetry={onRetry} />)

    expect(screen.getByText('No se envió')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar envío' }))
    expect(onRetry).toHaveBeenCalledWith(message)
  })

  test('mensaje del sistema discreto, sin avatar', () => {
    const { container } = render(<ChatBubble message={{ text: 'Ana se unió', system: true }} />)
    expect(container.querySelector('.gcu-message-system')).toHaveTextContent('Ana se unió')
    expect(container.querySelector('.gcu-avatar')).toBeNull()
  })
})

describe('ChatTypingIndicator y ChatDaySeparator', () => {
  test('escribiendo: anuncio cortés y puntos decorativos', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(<ChatTypingIndicator ref={ref} name="Ana" />)
    expect(screen.getByRole('status')).toHaveTextContent('Ana está escribiendo')
    expect(ref.current).toHaveClass('chat-typing-indicator')
    expect(container.querySelectorAll('.chat-typing-dot[aria-hidden="true"]')).toHaveLength(3)
  })

  test('separador de día: Hoy, Ayer y dd-mm-aaaa en <time>', () => {
    render(
      <>
        <ChatDaySeparator date={new Date(2026, 9, 4, 9, 0)} now={NOW} />
        <ChatDaySeparator date={new Date(2026, 9, 3, 23, 0)} now={NOW} />
        <ChatDaySeparator date={new Date(2026, 8, 23, 8, 0)} now={NOW} />
      </>,
    )
    expect(screen.getByText('Hoy').tagName).toBe('TIME')
    expect(screen.getByText('Ayer')).toBeInTheDocument()
    expect(screen.getByText('23-09-2026')).toBeInTheDocument()
  })

  test('formatChatDay devuelve vacío con fechas inválidas', () => {
    expect(formatChatDay('no-es-fecha', NOW)).toBe('')
  })
})

describe('groupChatMessages', () => {
  test('inserta separadores por día y agrupa mensajes consecutivos del mismo autor', () => {
    const entries = groupChatMessages([
      { id: 1, text: 'a', sender: { id: 'ana' }, date: new Date(2026, 9, 3, 10, 0) },
      { id: 2, text: 'b', sender: { id: 'ana' }, date: new Date(2026, 9, 3, 10, 1) },
      { id: 3, text: 'c', mine: true, date: new Date(2026, 9, 3, 10, 2) },
      { id: 4, text: 'd', mine: true, date: new Date(2026, 9, 4, 9, 0) },
      { id: 5, text: 'e', system: true, date: new Date(2026, 9, 4, 9, 1) },
      { id: 6, text: 'f', mine: true, date: new Date(2026, 9, 4, 9, 2) },
    ], { now: NOW })

    expect(entries.map((entry) => (entry.type === 'day' ? entry.label : `${entry.message.id}${entry.grouped ? 'g' : ''}`)))
      .toEqual(['Ayer', '1', '2g', '3', 'Hoy', '4', '5', '6'])
  })

  test('no agrupa si pasan más de 5 minutos entre mensajes del mismo autor', () => {
    const entries = groupChatMessages([
      { id: 1, mine: true, date: new Date(2026, 9, 4, 9, 0) },
      { id: 2, mine: true, date: new Date(2026, 9, 4, 9, 10) },
    ], { now: NOW })
    expect(entries.filter((entry) => entry.type === 'message').map((entry) => entry.type === 'message' && entry.grouped))
      .toEqual([false, false])
  })

  test('tolera entradas inválidas sin romper', () => {
    expect(() => groupChatMessages(null as never)).not.toThrow()
    expect(groupChatMessages([null as never, { id: 1, text: 'x' }]).filter((entry) => entry.type === 'message')).toHaveLength(2)
  })
})
