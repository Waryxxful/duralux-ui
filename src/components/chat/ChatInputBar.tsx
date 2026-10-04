import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFiniteNumber, isFunction, isObject, isString } from '../../utils/typeGuards'
import type { ChatInputBarProps } from '../../public/types'

const DEFAULT_LABELS = {
  input: 'Mensaje',
  attach: 'Adjuntar archivo',
  emoji: 'Insertar emoji',
  send: 'Enviar mensaje',
} as const

/** El contador de caracteres aparece desde este porcentaje del límite. */
const COUNTER_THRESHOLD = 0.8

const useIsomorphicLayoutEffect = globalThis.document ? useLayoutEffect : useEffect

type FieldElement = HTMLInputElement | HTMLTextAreaElement

function resolveLabel(labels: ChatInputBarProps['labels'], propLabel: string | number | undefined, key: keyof typeof DEFAULT_LABELS): string {
  let label: string | number | undefined
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

function supportsFieldSizing(): boolean {
  try {
    const css = globalThis.CSS
    return Boolean(css && isFunction(css.supports) && css.supports('field-sizing', 'content'))
  } catch {
    return false
  }
}

/**
 * ChatInputBar — compositor de mensajes.
 *
 * - onSend(text): contrato síncrono; recibe el texto recortado y el borrador solo se limpia si el callback retorna.
 * - Enter envía (respetando la composición IME). Sin `multiline` el campo es de una línea y Shift+Enter no hace nada;
 *   con `multiline` es un textarea que crece hasta `maxRows` y Shift+Enter salta de línea.
 * - onAttach / onEmoji: botones con nombre accesible; no se pintan sin su callback.
 * - maxLength: límite nativo y contador «480 / 500» desde el 80 %, asociado al campo con aria-describedby.
 * - value + onChange: borrador controlado; onChange también sirve en modo no controlado (aviso «escribiendo…»).
 * - disabledReason: explica por qué está deshabilitado («Sin conexión»).
 * - ref: el campo de texto (input o textarea).
 */
export const ChatInputBar = /* @__PURE__ */ forwardRef<FieldElement, ChatInputBarProps>(function ChatInputBar({
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
  multiline = false,
  maxRows = 6,
  maxLength,
  value,
  onChange,
  disabledReason,
  className,
}, ref) {
  const isControlled = value !== undefined
  const [innerText, setInnerText] = useState('')
  const text = isControlled ? (isString(value) ? value : '') : innerText
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const composingRef = useRef(false)
  const compositionEndGuardRef = useRef(false)
  const compositionGuardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const baseId = useId()
  const counterId = `${baseId}-count`
  const reasonId = `${baseId}-reason`
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
  const validMaxLength = isFiniteNumber(maxLength) && maxLength > 0 ? Math.floor(maxLength) : undefined
  const rows = isFiniteNumber(maxRows) && maxRows >= 1 ? Math.floor(maxRows) : 6
  const showCounter = validMaxLength !== undefined && text.length >= Math.ceil(validMaxLength * COUNTER_THRESHOLD)
  const showReason = isDisabled && disabledReason !== undefined && disabledReason !== null && disabledReason !== ''
  const describedBy = [showCounter ? counterId : null, showReason ? reasonId : null].filter(Boolean).join(' ') || undefined

  useImperativeHandle(ref, () => (multiline ? textareaRef.current : inputRef.current), [multiline])

  useEffect(() => {
    if (maxLength !== undefined && validMaxLength === undefined) {
      log.warn('ChatInputBar: maxLength debe ser un número positivo; se ignora.')
    }
  }, [maxLength, validMaxLength])

  useEffect(() => () => {
    if (compositionGuardTimerRef.current !== null) {
      clearTimeout(compositionGuardTimerRef.current)
    }
  }, [])

  // Autoexpansión: con `field-sizing: content` la resuelve el CSS; si no, se mide el scrollHeight.
  useIsomorphicLayoutEffect(() => {
    const field = textareaRef.current
    if (!multiline || !field || supportsFieldSizing()) return
    field.style.height = 'auto'
    field.style.height = `${field.scrollHeight}px`
  }, [multiline, text])

  function updateText(next: string) {
    if (!isControlled) setInnerText(next)
    if (isFunction(onChange)) onChange(next)
  }

  function handleSubmit(event?: React.SyntheticEvent) {
    event?.preventDefault()

    if (inputDisabled || !canSend) return

    const trimmed = text.trim()
    if (!trimmed) return

    onSend(trimmed)
    updateText('')
  }

  function handleKeyDown(event: React.KeyboardEvent<FieldElement>) {
    if (event.key !== 'Enter') return

    if (
      composingRef.current
      || event.nativeEvent?.isComposing
      || event.keyCode === 229
      || event.which === 229
    ) {
      return
    }

    // Algunos navegadores emiten un Enter sintético justo después de compositionend:
    // se consume ese único evento y el siguiente Enter envía con normalidad.
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
      // En multiline Shift+Enter inserta el salto de línea nativo; en una línea no hace nada.
      if (!multiline) event.preventDefault()
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

  const fieldProps = {
    name: 'message',
    autoComplete: 'off',
    className: cx('form-control', 'gcu-chat-composer__input'),
    'aria-label': resolvedInputLabel,
    'aria-describedby': describedBy,
    placeholder: resolvedPlaceholder,
    value: text,
    maxLength: validMaxLength,
    disabled: inputDisabled,
    onChange: (event: React.ChangeEvent<FieldElement>) => updateText(event.target.value),
    onKeyDown: handleKeyDown,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
  }

  return (
    <form
      className={cx('chat-input-bar', 'gcu-chat-composer', multiline && 'gcu-chat-composer--multiline', className)}
      onSubmit={handleSubmit}
    >
      {(canAttach || canInsertEmoji) ? (
        <div className="gcu-chat-composer__actions">
          {canAttach ? (
            <button
              type="button"
              className="chat-input-bar__action gcu-chat-composer__action"
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
              className="chat-input-bar__action gcu-chat-composer__action"
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
      <div className="chat-input-bar__field gcu-chat-composer__field">
        {multiline ? (
          <textarea
            {...fieldProps}
            ref={textareaRef}
            rows={1}
            style={{ maxHeight: `calc(${rows} * var(--gcu-line-height-base) + var(--gcu-space-6))` }}
          />
        ) : (
          <input {...fieldProps} ref={inputRef} type="text" />
        )}
      </div>
      <button
        type="submit"
        className="chat-input-bar__action chat-input-bar__send gcu-chat-composer__send"
        aria-label={resolvedSendLabel}
        title={resolvedSendLabel}
        disabled={inputDisabled || !text.trim()}
      >
        <i className="feather-send" aria-hidden="true"></i>
      </button>
      {(showCounter || showReason) ? (
        <div className="gcu-chat-composer__footer">
          {showReason ? <p id={reasonId} className="gcu-chat-composer__reason">{disabledReason}</p> : null}
          {showCounter ? (
            <span
              id={counterId}
              className={cx('gcu-chat-composer__count', text.length >= validMaxLength && 'gcu-chat-composer__count--limit')}
            >
              {text.length} / {validMaxLength}
            </span>
          ) : null}
        </div>
      ) : null}
    </form>
  )
})
