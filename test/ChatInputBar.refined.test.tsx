import { createRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { ChatInputBar } from '../src/components/chat/ChatInputBar'

describe('ChatInputBar refinado (lote L7)', () => {
  test('forwardRef apunta al campo de texto', () => {
    const ref = createRef<HTMLInputElement | HTMLTextAreaElement>()
    render(<ChatInputBar ref={ref} onSend={vi.fn()} />)
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Mensaje' }))
  })

  test('multiline: Enter envía y Shift+Enter salta de línea', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<ChatInputBar multiline onSend={onSend} />)

    const field = screen.getByRole('textbox', { name: 'Mensaje' })
    expect(field.tagName).toBe('TEXTAREA')
    await user.type(field, 'Hola{Shift>}{Enter}{/Shift}mundo')
    expect(field).toHaveValue('Hola\nmundo')
    expect(onSend).not.toHaveBeenCalled()

    await user.keyboard('{Enter}')
    expect(onSend).toHaveBeenCalledWith('Hola\nmundo')
    expect(field).toHaveValue('')
  })

  test('multiline respeta la composición IME', () => {
    const onSend = vi.fn()
    render(<ChatInputBar multiline onSend={onSend} />)
    const field = screen.getByRole('textbox', { name: 'Mensaje' })
    fireEvent.change(field, { target: { value: '文字' } })
    fireEvent.compositionStart(field)
    fireEvent.keyDown(field, { key: 'Enter', isComposing: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  test('el contador aparece al acercarse al límite y queda asociado al campo', async () => {
    const user = userEvent.setup()
    render(<ChatInputBar onSend={vi.fn()} maxLength={10} />)
    const field = screen.getByRole('textbox', { name: 'Mensaje' })

    await user.type(field, 'hola')
    expect(screen.queryByText(/\/ 10/)).not.toBeInTheDocument()

    await user.type(field, 'hola')
    const counter = screen.getByText('8 / 10')
    expect(field).toHaveAttribute('maxlength', '10')
    expect(field.getAttribute('aria-describedby')).toContain(counter.id)
  })

  test('onChange informa el borrador y el modo controlado se limpia vía onChange al enviar', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    const onChange = vi.fn()
    function Controlado() {
      const [value, setValue] = useState('')
      return (
        <ChatInputBar
          value={value}
          onChange={(text) => { onChange(text); setValue(text) }}
          onSend={onSend}
        />
      )
    }
    render(<Controlado />)
    const field = screen.getByRole('textbox', { name: 'Mensaje' })
    await user.type(field, 'ok{Enter}')

    expect(onChange).toHaveBeenCalledWith('o')
    expect(onSend).toHaveBeenCalledWith('ok')
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(field).toHaveValue('')
  })

  test('deshabilitado explica el motivo', () => {
    render(<ChatInputBar onSend={vi.fn()} disabled disabledReason="Sin conexión con el servicio" />)
    const field = screen.getByRole('textbox', { name: 'Mensaje' })
    expect(field).toBeDisabled()
    expect(field).toHaveAccessibleDescription('Sin conexión con el servicio')
  })

  test('adjuntar es un botón con nombre accesible', async () => {
    const user = userEvent.setup()
    const onAttach = vi.fn()
    render(<ChatInputBar onSend={vi.fn()} onAttach={onAttach} />)
    await user.click(screen.getByRole('button', { name: 'Adjuntar archivo' }))
    expect(onAttach).toHaveBeenCalledOnce()
  })
})
