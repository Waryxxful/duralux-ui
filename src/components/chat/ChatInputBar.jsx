import { useState } from 'react'

/**
 * ChatInputBar — barra de entrada de mensajes.
 *
 * Props:
 *   onSend     — (text) => void
 *   placeholder — string
 */
export function ChatInputBar({ onSend, placeholder = 'Escribe un mensaje...' }) {
  const [text, setText] = useState('')

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend?.(trimmed)
    setText('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-top p-3 d-flex align-items-center gap-3">
      <div className="d-flex align-items-center gap-2">
        <button type="button" className="avatar-text avatar-sm bg-transparent border-0 text-muted">
          <i className="feather-paperclip"></i>
        </button>
        <button type="button" className="avatar-text avatar-sm bg-transparent border-0 text-muted">
          <i className="feather-smile"></i>
        </button>
      </div>
      <div className="flex-grow-1">
        <input
          type="text"
          className="form-control border-0 bg-gray-100 rounded-pill"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
        />
      </div>
      <button
        type="button"
        className="avatar-text avatar-md bg-primary text-white border-0 rounded-circle flex-shrink-0"
        onClick={handleSend}
        disabled={!text.trim()}
      >
        <i className="feather-send"></i>
      </button>
    </div>
  )
}
