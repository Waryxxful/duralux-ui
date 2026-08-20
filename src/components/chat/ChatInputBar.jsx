import { useEffect, useRef, useState } from 'react'
import { isFiniteNumber, isFunction, isObject, isString } from '../../utils/typeGuards'

const DEFAULT_LABELS = {
  input: 'Mensaje',
  attach: 'Adjuntar archivo',
  emoji: 'Insertar emoji',
  send: 'Enviar mensaje',
}

function resolveLabel(labels, propLabel, key) {
  let label
  if (labels && isObject(labels)) {
    try {
      label = labels[key]
    } catch {
      label = undefined
    }
  }
  const candidate = label ?? propLabel

  if (isString(candidate) || isFiniteNumber(candidate)) {
    const normalized = String(candidate).trim()
    if (normalized) return normalized
  }

  return DEFAULT_LABELS[key]
}

/**
 * ChatInputBar — barra de entrada de mensajes.
 *
 * `onSend`, `onAttach` y `onEmoji` son callbacks independientes. Las acciones
 * de adjuntar/emoji no se renderizan sin su callback; el envío permanece
 * visible pero deshabilitado cuando no existe `onSend` o no hay texto.
 *
 * La API legacy de `onSend(text)` se conserva como contrato síncrono. Enter
 * envía el texto recortado mediante el formulario; el botón de envío usa el
 * mismo camino y el draft solo se limpia si el callback retorna. Shift+Enter
 * es intencionalmente un no-op porque este control es de una sola línea y no
 * puede prometer un salto de línea.
 */
export function ChatInputBar({
  onSend,
  onAttach,
  onEmoji,
  placeholder = 'Escribe un mensaje...',
  disabled = false,
  inputLabel,
  attachLabel,
  emojiLabel,
  sendLabel,
  labels = undefined,
}) {
  const [text, setText] = useState('')
  const composingRef = useRef(false)
  const compositionEndGuardRef = useRef(false)
  const compositionGuardTimerRef = useRef(null)
  const resolvedInputLabel = resolveLabel(labels, inputLabel, 'input')
  const resolvedAttachLabel = resolveLabel(labels, attachLabel, 'attach')
  const resolvedEmojiLabel = resolveLabel(labels, emojiLabel, 'emoji')
  const resolvedSendLabel = resolveLabel(labels, sendLabel, 'send')
  const canSend = isFunction(onSend)
  const canAttach = isFunction(onAttach)
  const canInsertEmoji = isFunction(onEmoji)
  const isDisabled = Boolean(disabled)
  const inputDisabled = isDisabled || !canSend
  const resolvedPlaceholder = isString(placeholder) || isFiniteNumber(placeholder)
    ? String(placeholder)
    : 'Escribe un mensaje...'

  useEffect(() => () => {
    if (compositionGuardTimerRef.current !== null) {
      clearTimeout(compositionGuardTimerRef.current)
    }
  }, [])

  function handleSubmit(event) {
    event?.preventDefault()

    if (inputDisabled || !canSend) return

    const trimmed = text.trim()
    if (!trimmed) return

    onSend(trimmed)
    setText('')
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter') return

    if (
      composingRef.current
      || event.isComposing
      || event.nativeEvent?.isComposing
      || event.keyCode === 229
      || event.which === 229
    ) {
      return
    }

    // Some browsers dispatch a synthetic Enter immediately after
    // compositionend. Consume that one event, but let a later ordinary
    // Enter submit normally once the short guard expires.
    if (compositionEndGuardRef.current) {
      compositionEndGuardRef.current = false
      if (compositionGuardTimerRef.current !== null) {
        clearTimeout(compositionGuardTimerRef.current)
        compositionGuardTimerRef.current = null
      }
      event.preventDefault()
      return
    }

    if (event.shiftKey) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    handleSubmit(event)
  }

  function handleCompositionStart() {
    composingRef.current = true
  }

  function handleCompositionEnd() {
    const wasComposing = composingRef.current
    composingRef.current = false

    if (!wasComposing) return

    compositionEndGuardRef.current = true
    if (compositionGuardTimerRef.current !== null) {
      clearTimeout(compositionGuardTimerRef.current)
    }
    compositionGuardTimerRef.current = setTimeout(() => {
      compositionEndGuardRef.current = false
      compositionGuardTimerRef.current = null
    }, 0)
  }

  return (
    <form className="chat-input-bar border-top p-3 d-flex align-items-center gap-3" onSubmit={handleSubmit}>
      {(canAttach || canInsertEmoji) ? (
        <div className="d-flex align-items-center gap-2">
          {canAttach ? (
            <button
              type="button"
              className="chat-input-bar__action avatar-text avatar-sm bg-transparent border-0 text-muted"
              aria-label={resolvedAttachLabel}
              title={resolvedAttachLabel}
              onClick={() => onAttach()}
              disabled={isDisabled}
            >
              <i className="feather-paperclip" aria-hidden="true"></i>
            </button>
          ) : null}
          {canInsertEmoji ? (
            <button
              type="button"
              className="chat-input-bar__action avatar-text avatar-sm bg-transparent border-0 text-muted"
              aria-label={resolvedEmojiLabel}
              title={resolvedEmojiLabel}
              onClick={() => onEmoji()}
              disabled={isDisabled}
            >
              <i className="feather-smile" aria-hidden="true"></i>
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="chat-input-bar__field flex-grow-1">
        <input
          type="text"
          name="message"
          autoComplete="off"
          className="form-control border-0 bg-gray-100 rounded-pill"
          aria-label={resolvedInputLabel}
          placeholder={resolvedPlaceholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          disabled={inputDisabled}
        />
      </div>
      <button
        type="submit"
        className="chat-input-bar__action chat-input-bar__send avatar-text avatar-md bg-primary text-white border-0 rounded-circle flex-shrink-0"
        aria-label={resolvedSendLabel}
        title={resolvedSendLabel}
        disabled={inputDisabled || !text.trim()}
      >
        <i className="feather-send" aria-hidden="true"></i>
      </button>
    </form>
  )
}
