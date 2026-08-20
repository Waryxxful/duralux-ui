import { Fragment } from 'react'
import { readFileSync } from 'node:fs'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { ChatBubble, ChatTypingIndicator } from '../src/components/chat/ChatBubble.jsx'
import { ChatInputBar } from '../src/components/chat/ChatInputBar.jsx'
import { ChatSidebar } from '../src/components/chat/ChatSidebar.jsx'
import { ChatWindow } from '../src/components/chat/ChatWindow.jsx'

const CONTACTS = [
  {
    id: 'ana',
    name: 'Ana Martínez',
    preview: 'Hola, ¿cómo va?',
    time: '10:05',
    online: true,
    unread: 2,
  },
  {
    id: 'carlos',
    name: 'Carlos Ruiz',
    preview: 'Revisa el documento',
    time: '09:30',
    online: false,
    unread: 0,
  },
]

const CONTACT = {
  name: 'Ana Martínez',
  avatar: '/avatar.png',
  online: true,
  role: 'Diseñadora UI',
}

describe('ChatSidebar', () => {
  test('expone nombres y estado, y selecciona contactos con teclado', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<ChatSidebar contacts={CONTACTS} onSelect={onSelect} />)

    const search = screen.getByRole('searchbox', { name: 'Buscar conversaciones' })
    expect(search).toBeInTheDocument()

    const ana = screen.getByRole('button', { name: 'Ana Martínez' })
    const carlos = screen.getByRole('button', { name: 'Carlos Ruiz' })
    expect(ana).not.toHaveAttribute('aria-current')
    expect(ana).not.toHaveAttribute('aria-pressed')
    expect(ana).toHaveAccessibleName('Ana Martínez')

    ana.focus()
    await user.keyboard('{ArrowDown}{Enter}')

    expect(carlos).toHaveFocus()
    expect(onSelect).toHaveBeenCalledWith(CONTACTS[1])
    expect(carlos).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Carlos Ruiz')
  })

  test('muestra el control de editar solo cuando tiene callback y anuncia la acción', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <ChatSidebar
        contacts={CONTACTS}
        onEdit={onEdit}
        labels={{ edit: 'Nueva conversación' }}
      />,
    )

    const edit = screen.getByRole('button', { name: 'Nueva conversación' })
    await user.click(edit)
    expect(onEdit).toHaveBeenCalledOnce()

    const { unmount } = render(<ChatSidebar contacts={CONTACTS} />)
    expect(screen.queryByRole('button', { name: 'Editar conversación' })).not.toBeInTheDocument()
    unmount()
  })

  test('renderiza contactos como lista view-only cuando no existe callback de selección', () => {
    render(<ChatSidebar contacts={CONTACTS} />)

    expect(screen.getByRole('list', { name: 'Lista de conversaciones' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(CONTACTS.length)
    expect(screen.queryByRole('button', { name: 'Ana Martínez' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Carlos Ruiz' })).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  test('filtra localmente por nombre y preview, aunque no exista onSearch', async () => {
    const user = userEvent.setup()
    render(<ChatSidebar contacts={CONTACTS} />)

    const search = screen.getByRole('searchbox', { name: 'Buscar conversaciones' })
    await user.type(search, 'documento')

    expect(screen.queryByRole('group', { name: 'Ana Martínez' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Carlos Ruiz' })).toBeInTheDocument()
    expect(search).toHaveValue('documento')
    expect(screen.getByRole('status')).toHaveTextContent('1 conversaciones encontradas')
  })

  test('mantiene el filtrado local y notifica a onSearch cuando se proporciona', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<ChatSidebar contacts={CONTACTS} onSearch={onSearch} />)

    const search = screen.getByRole('searchbox', { name: 'Buscar conversaciones' })
    await user.type(search, 'hola')

    expect(onSearch).toHaveBeenLastCalledWith('hola')
    expect(screen.getByRole('group', { name: 'Ana Martínez' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Carlos Ruiz' })).not.toBeInTheDocument()
  })

  test('anuncia y muestra un estado vacío cuando no hay resultados', async () => {
    const user = userEvent.setup()
    render(<ChatSidebar contacts={CONTACTS} />)

    await user.type(screen.getByRole('searchbox', { name: 'Buscar conversaciones' }), 'inexistente')

    expect(screen.getAllByText('No se encontraron conversaciones')).toHaveLength(2)
    expect(screen.getByRole('status')).toHaveTextContent('No se encontraron conversaciones')
  })

  test('expone preview, unread y online en la descripción de contactos view-only', () => {
    render(<ChatSidebar contacts={CONTACTS} />)

    const ana = screen.getByRole('group', { name: 'Ana Martínez' })
    expect(ana).toHaveAccessibleDescription('Hola, ¿cómo va?, 10:05, 2 sin leer, En línea')
  })

  test('mantiene un roving tabindex por contacto visible al reordenar y retirar el enfocado', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(
      <ChatSidebar contacts={CONTACTS} selectedId="ana" onSelect={onSelect} />,
    )

    const ana = screen.getByRole('button', { name: 'Ana Martínez' })
    ana.focus()
    await user.keyboard('{ArrowDown}')

    const carlos = screen.getByRole('button', { name: 'Carlos Ruiz' })
    expect(carlos).toHaveFocus()
    expect(carlos).toHaveAttribute('tabindex', '0')

    rerender(
      <ChatSidebar contacts={[CONTACTS[1], CONTACTS[0]]} selectedId="ana" onSelect={onSelect} />,
    )
    expect(screen.getByRole('button', { name: 'Carlos Ruiz' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Carlos Ruiz' })).toHaveAttribute('tabindex', '0')

    rerender(<ChatSidebar contacts={[CONTACTS[0]]} selectedId="ana" onSelect={onSelect} />)
    const remaining = screen.getByRole('button', { name: 'Ana Martínez' })
    expect(remaining).toHaveFocus()
    expect(remaining).toHaveAttribute('tabindex', '0')
  })

  test('no repite la normalización al cambiar solo la selección local', async () => {
    const user = userEvent.setup()
    let reads = 0
    const proxiedContacts = new Proxy(CONTACTS, {
      get(target, property) {
        if (property === 'length' || property === '0' || property === '1') reads += 1
        return target[property]
      },
    })

    render(<ChatSidebar contacts={proxiedContacts} onSelect={vi.fn()} />)
    const readsAfterRender = reads
    await user.click(screen.getByRole('button', { name: 'Ana Martínez' }))

    expect(reads).toBe(readsAfterRender)
  })

  test('mantiene selección controlada y mueve el foco con Home y End', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { rerender } = render(
      <ChatSidebar contacts={CONTACTS} selectedId="ana" onSelect={onSelect} />,
    )

    const ana = screen.getByRole('button', { name: 'Ana Martínez' })
    const carlos = screen.getByRole('button', { name: 'Carlos Ruiz' })
    expect(ana).toHaveAttribute('tabindex', '0')
    expect(carlos).toHaveAttribute('tabindex', '-1')

    ana.focus()
    await user.keyboard('{End}')
    expect(carlos).toHaveFocus()
    await user.keyboard('{Home}')
    expect(ana).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(CONTACTS[0])
    expect(ana).toHaveAttribute('aria-current', 'true')

    rerender(<ChatSidebar contacts={CONTACTS} selectedId="carlos" onSelect={onSelect} />)
    expect(screen.getByRole('button', { name: 'Carlos Ruiz' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { name: 'Ana Martínez' })).not.toHaveAttribute('aria-current')
  })
})

describe('ChatInputBar', () => {
  test('nombra acciones, ejecuta callbacks y envía con Enter', async () => {
    const user = userEvent.setup()
    const onAttach = vi.fn()
    const onEmoji = vi.fn()
    const onSend = vi.fn()

    render(
      <ChatInputBar
        onAttach={onAttach}
        onEmoji={onEmoji}
        onSend={onSend}
        labels={{
          input: 'Escribir mensaje',
          attach: 'Adjuntar archivo',
          emoji: 'Insertar emoji',
          send: 'Enviar',
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Adjuntar archivo' }))
    await user.click(screen.getByRole('button', { name: 'Insertar emoji' }))
    const input = screen.getByRole('textbox', { name: 'Escribir mensaje' })
    await user.type(input, '  Hola  ')
    await user.keyboard('{Enter}')

    expect(onAttach).toHaveBeenCalledOnce()
    expect(onEmoji).toHaveBeenCalledOnce()
    expect(onSend).toHaveBeenCalledWith('Hola')
    expect(input).toHaveValue('')

    await user.type(input, 'borrador')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(onSend).toHaveBeenCalledOnce()
    expect(input).toHaveValue('borrador')
  })

  test('oculta acciones sin callback y deshabilita el envío sin onSend', () => {
    render(<ChatInputBar />)

    expect(screen.queryByRole('button', { name: 'Adjuntar archivo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Insertar emoji' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Mensaje' })).toBeDisabled()
  })

  test('no envía Enter durante composición IME y define Shift+Enter como no-op', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInputBar onSend={onSend} />)

    const input = screen.getByRole('textbox', { name: 'Mensaje' })
    await user.type(input, '  文字  ')
    fireEvent.compositionStart(input)
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

    expect(onSend).not.toHaveBeenCalled()
    expect(input).toHaveValue('  文字  ')

    fireEvent.compositionEnd(input)
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
    expect(input).toHaveValue('  文字  ')
    expect(input).toHaveAttribute('type', 'text')
  })

  test('consume el Enter sintético posterior a compositionend y conserva el Enter normal', async () => {
    const onSend = vi.fn()
    render(<ChatInputBar onSend={onSend} />)

    const input = screen.getByRole('textbox', { name: 'Mensaje' })
    fireEvent.change(input, { target: { value: '  文字  ' } })
    fireEvent.compositionStart(input)
    fireEvent.compositionEnd(input)
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSend).not.toHaveBeenCalled()
    expect(input).toHaveValue('  文字  ')

    await new Promise((resolve) => setTimeout(resolve, 5))
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSend).toHaveBeenCalledWith('文字')
    expect(input).toHaveValue('')
  })

  test('conserva el draft si onSend lanza una excepción síncrona', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn(() => {
      throw new Error('send failed')
    })
    render(<ChatInputBar onSend={onSend} />)

    const input = screen.getByRole('textbox', { name: 'Mensaje' })
    await user.type(input, 'borrador')

    const suppressUnhandledError = (event) => event.preventDefault()
    window.addEventListener('error', suppressUnhandledError)
    fireEvent.submit(input.closest('form'))
    window.removeEventListener('error', suppressUnhandledError)
    expect(input).toHaveValue('borrador')
  })

  test('usa el mismo submit trimmeado desde el click y descarta callbacks malformados', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInputBar onSend={onSend} onAttach="not-a-function" onEmoji={{}} />)

    const input = screen.getByRole('textbox', { name: 'Mensaje' })
    await user.type(input, '  desde click  ')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(onSend).toHaveBeenCalledWith('desde click')
    expect(input).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Adjuntar archivo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Insertar emoji' })).not.toBeInTheDocument()
  })

  test('disabled bloquea input y acciones aunque existan callbacks', () => {
    render(<ChatInputBar onAttach={vi.fn()} onEmoji={vi.fn()} onSend={vi.fn()} disabled />)

    expect(screen.getByRole('textbox', { name: 'Mensaje' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Adjuntar archivo' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Insertar emoji' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled()
  })
})

describe('ChatWindow slots', () => {
  function renderWindow(props = {}) {
    return render(<ChatWindow contact={CONTACT} {...props} />)
  }

  test.each([
    ['un elemento', <p>mensaje único</p>],
    ['un array', [<p key="one">mensaje uno</p>, <p key="two">mensaje dos</p>]],
    ['un Fragment', <Fragment><p key="f1">fragmento uno</p><p key="f2">fragmento dos</p></Fragment>],
  ])('renderiza messages como %s y composer como slots explícitos', (_, messages) => {
    renderWindow({ messages, composer: <div>compositor explícito</div> })

    expect(screen.getByRole('log', { name: 'Mensajes' })).toHaveTextContent(/(mensaje|fragmento)/)
    expect(screen.getByText('compositor explícito')).toBeInTheDocument()
  })

  test('conserva legacy para una secuencia de children mediante Children.toArray', () => {
    renderWindow({
      children: [<p key="message">mensaje legacy</p>, <div key="composer">compositor legacy</div>],
    })

    expect(screen.getByText('mensaje legacy')).toBeInTheDocument()
    expect(screen.getByText('compositor legacy')).toBeInTheDocument()
  })

  test('permite desactivar la heurística legacy para que dos children sigan siendo mensajes', () => {
    renderWindow({
      legacyChildren: false,
      children: [<p key="one">mensaje uno</p>, <p key="two">mensaje dos</p>],
    })

    const log = screen.getByRole('log', { name: 'Mensajes' })
    expect(log).toHaveTextContent('mensaje uno')
    expect(log).toHaveTextContent('mensaje dos')
  })

  test('las acciones del header solo existen si tienen callback y reciben el contacto', async () => {
    const user = userEvent.setup()
    const onPhone = vi.fn()
    const onVideo = vi.fn()
    const onMenu = vi.fn()

    renderWindow({
      onPhone,
      onVideo,
      onMenu,
      labels: { phone: 'Llamar', video: 'Videollamada', menu: 'Más opciones' },
    })

    await user.click(screen.getByRole('button', { name: 'Llamar' }))
    await user.click(screen.getByRole('button', { name: 'Videollamada' }))
    await user.click(screen.getByRole('button', { name: 'Más opciones' }))

    expect(onPhone).toHaveBeenCalledWith(CONTACT)
    expect(onVideo).toHaveBeenCalledWith(CONTACT)
    expect(onMenu).toHaveBeenCalledWith(CONTACT)
  })

  test('no deja acciones falsas cuando faltan callbacks', () => {
    renderWindow()

    expect(screen.queryByRole('button', { name: 'Llamar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Videollamada' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Más opciones' })).not.toBeInTheDocument()
  })

  test('expone el historial como log y no anuncia el estado vacío repetidamente', () => {
    const { rerender } = renderWindow({ messages: null })
    const log = screen.getByRole('log', { name: 'Mensajes' })

    expect(log).toHaveAttribute('aria-live', 'polite')
    expect(log).toHaveAttribute('aria-relevant', 'additions')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    rerender(<ChatWindow contact={null} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

test('ChatTypingIndicator usa clases para bounce y un estado accesible', () => {
  const { container } = render(<ChatTypingIndicator name="Ana" />)

  expect(screen.getByRole('status')).toHaveTextContent('Ana está escribiendo')
  expect(container.querySelectorAll('.chat-typing-dot')).toHaveLength(3)
  expect(container.querySelector('.chat-typing-dot')).not.toHaveAttribute('style')
})

test('el SCSS del typing declara keyframes y reduced-motion', () => {
  const chatScss = readFileSync('scss/themes/applications/_chat.scss', 'utf8')

  expect(chatScss).toMatch(/\.chat-typing-dot[\s\S]*animation: chat-typing-bounce/)
  expect(chatScss).toContain('@keyframes chat-typing-bounce')
  expect(chatScss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.chat-typing-dot[\s\S]*animation: none/)
})

test('ChatBubble no depende de estilos inline para su ancho', () => {
  const { container } = render(
    <ChatBubble
      message={{
        text: 'Hola',
        time: '10:00',
        sender: { name: 'Ana' },
        mine: false,
      }}
    />,
  )

  expect(container.querySelector('.chat-bubble-content')).not.toHaveAttribute('style')
})

test('los avatares junto a nombres visibles son decorativos', () => {
  const bubble = render(
    <ChatBubble
      message={{
        text: 'Hola',
        time: '10:00',
        sender: { name: 'Ana' },
        mine: false,
      }}
    />,
  )
  expect(bubble.container.querySelector('img')).toHaveAttribute('alt', '')

  const window = render(<ChatWindow contact={CONTACT} />)
  expect(window.container.querySelector('img')).toHaveAttribute('alt', '')
})

test('el estado online usa un foreground local accesible', () => {
  const { container } = render(<ChatWindow contact={CONTACT} />)
  const online = container.querySelector('.chat-online-status')

  expect(online).toHaveTextContent('En línea')
  expect(online).not.toHaveClass('text-success')
  expect(readFileSync('scss/themes/applications/_chat.scss', 'utf8')).toMatch(
    /\.chat-online-status[\s\S]*color:\s*\$dark/,
  )
})

test('normaliza datos ausentes o malformados sin romper la UI pública', () => {
  expect(() => render(<ChatBubble message={null} />)).not.toThrow()
  expect(() => render(<ChatSidebar contacts={[null, { name: {} }]} />)).not.toThrow()
  expect(() => render(<ChatWindow contact={{ name: {}, avatar: {}, online: 'false' }} />)).not.toThrow()
})

test('tolera getters Proxy hostiles en datos y labels sin generar HTML inseguro', () => {
  const hostile = new Proxy({}, {
    get() {
      throw new Error('hostile getter')
    },
  })
  const hostileLabels = new Proxy({}, {
    get() {
      throw new Error('hostile label')
    },
  })

  expect(() => render(<ChatBubble message={hostile} />)).not.toThrow()
  expect(() => render(<ChatSidebar contacts={[hostile]} labels={hostileLabels} />)).not.toThrow()
  expect(() => render(<ChatWindow contact={hostile} labels={hostileLabels} />)).not.toThrow()
  expect(document.querySelector('[dangerouslySetInnerHTML]')).not.toBeInTheDocument()
})

test('reduced-motion cubre typing y animaciones/transiciones legacy del chat', () => {
  const chatScss = readFileSync('scss/themes/applications/_chat.scss', 'utf8')

  expect(chatScss).toMatch(/\.text\.typing[\s\S]*\.dot[\s\S]*animation:\s*none/)
  expect(chatScss).toMatch(/\.animation-infinite[\s\S]*animation:\s*none/)
  expect(chatScss).toMatch(/\.chat-calling-text-message-sidebar[\s\S]*transition:\s*none/)
  expect(chatScss).toMatch(/\.chat-calling-info[\s\S]*transition:\s*none/)
  expect(chatScss).not.toContain('transition: all')
})
