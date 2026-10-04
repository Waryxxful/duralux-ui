import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { MessageBubble } from '../src/components/conversation/MessageBubble'

describe('MessageBubble refinado (lote L7)', () => {
  test('forwardRef apunta a la fila y bubbleRef sigue apuntando a la burbuja', () => {
    const ref = createRef<HTMLDivElement>()
    const bubbleRef = createRef<HTMLDivElement>()
    render(<MessageBubble ref={ref} bubbleRef={bubbleRef} variant="incoming">Hola</MessageBubble>)

    expect(ref.current).toHaveClass('gcu-message-row', 'gcu-message-row--incoming')
    expect(bubbleRef.current).toHaveClass('gcu-message-bubble', 'gcu-message-bubble--incoming')
  })

  test('conserva las clases públicas que usan las apps (call_reviews)', () => {
    const html = renderToStaticMarkup(
      <>
        <MessageBubble variant="incoming" header="Agente" highlighted data-raw="Hola" className="cw-bubble-agent">Hola</MessageBubble>
        <MessageBubble variant="outgoing" meta="10:05">Gracias</MessageBubble>
        <MessageBubble variant="system">Llamada transferida</MessageBubble>
      </>,
    )

    expect(html).toContain('gcu-message-bubble--incoming')
    expect(html).toContain('gcu-message-bubble--outgoing')
    expect(html).toContain('gcu-message-bubble--highlighted')
    expect(html).toContain('gcu-message-bubble__header')
    expect(html).toContain('gcu-message-bubble__meta')
    expect(html).toContain('gcu-message-system')
    expect(html).toContain('data-raw="Hola"')
    expect(html).toMatch(/class="gcu-message-bubble [^"]*cw-bubble-agent/)
    expect(html).not.toContain('bg-light')
    expect(html).not.toContain('class="bg-primary')
  })

  test('meta con hora en <time> y estado de entrega con texto, no solo ícono', () => {
    render(<MessageBubble variant="outgoing" time="16:42" status="read">Listo</MessageBubble>)

    const time = screen.getByText('16:42')
    expect(time.tagName).toBe('TIME')
    expect(time.closest('.gcu-message-bubble__meta')).not.toBeNull()
    expect(screen.getByText('Leído')).toBeInTheDocument()
  })

  test('el error de entrega se lee como texto visible', () => {
    render(<MessageBubble variant="outgoing" status="failed">Hola</MessageBubble>)
    expect(screen.getByText('No se envió')).toBeVisible()
  })

  test('grouped marca la fila como continuación y el sistema se centra', () => {
    const { container } = render(
      <>
        <MessageBubble variant="incoming" grouped>Segundo</MessageBubble>
        <MessageBubble variant="system">Ana se unió</MessageBubble>
      </>,
    )
    expect(container.querySelector('.gcu-message-row--grouped')).not.toBeNull()
    expect(container.querySelector('.gcu-message-row--system')).toHaveTextContent('Ana se unió')
  })
})
