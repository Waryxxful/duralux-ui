import { forwardRef, useId, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { PromptComposerProps } from '../../public/types'
import { IconButton } from '../ui/Button'

/** Aviso fijo bajo el compositor (spec 2.8, regla obligatoria de IA). No es configurable. */
export const AI_DISCLAIMER = 'El asistente puede equivocarse. Revisa las fuentes antes de tomar decisiones.'

const DEFAULT_MAX = 2000
const NEAR_LIMIT = 0.9

function fileSizeKb(file: File): string {
  return `${Math.max(1, Math.round(file.size / 1024)).toLocaleString('es-CL')} KB`
}

/**
 * PromptComposer — caja para preguntar al asistente.
 *
 * - Enter envía; Shift+Enter salta de línea; durante la composición IME, Enter no envía.
 * - busy: el botón pasa a «Detener respuesta» (emite `onStop`); no se puede enviar otra pregunta.
 * - Adjuntos con su nombre y tamaño, cada uno con «Quitar». Contador visible; se anuncia solo cerca del límite.
 * - tools: controles extra en la barra (ModelSelector segmentado, VoiceInput).
 * - Aviso fijo, siempre visible y asociado al campo: «El asistente puede equivocarse. Revisa las fuentes…».
 * - El texto nunca va a logs; solo eventos (enviado, adjuntos) con conteos.
 * Estilos: src/styles/components/prompt-composer.css.
 */
export const PromptComposer = /* @__PURE__ */ forwardRef<HTMLFormElement, PromptComposerProps>(function PromptComposer({
  onSubmit,
  busy = false,
  onStop,
  label = 'Pregunta al asistente',
  placeholder = 'Pregunta por llamadas, campañas o indicadores…',
  defaultValue = '',
  onTextChange,
  maxLength = DEFAULT_MAX,
  allowAttachments = true,
  accept,
  tools,
  disabled = false,
  disabledReason,
  variant = 'default',
  className,
  ...rest
}, ref) {
  const [text, setText] = useState(defaultValue)
  const [files, setFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const uid = useId().replace(/:/g, '')
  const noticeId = `gcu-ai-composer-notice-${uid}`
  const reasonId = `gcu-ai-composer-reason-${uid}`
  const trimmed = text.trim()
  const canSend = trimmed !== '' && !busy && !disabled

  const updateText = (next: string) => {
    setText(next)
    onTextChange?.(next)
  }

  const send = () => {
    if (!canSend) return
    log.debug(`PromptComposer: pregunta enviada (${trimmed.length} caracteres, ${files.length} adjuntos).`)
    onSubmit(trimmed, files)
    updateText('')
    setFiles([])
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    send()
  }

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? [])
    if (picked.length > 0) setFiles((current) => [...current, ...picked])
    event.target.value = ''
  }

  const nearLimit = text.length >= maxLength * NEAR_LIMIT
  const describedBy = [noticeId, disabled && disabledReason ? reasonId : undefined].filter(Boolean).join(' ')

  return (
    <form
      {...rest}
      ref={ref}
      className={cx('gcu-ai-composer', 'gcu-container', variant === 'minimal' && 'gcu-ai-composer--minimal', disabled && 'gcu-ai-composer--disabled', className)}
      aria-busy={busy || undefined}
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      <div className="gcu-ai-composer__box">
        {files.length > 0 && (
          <ul className="gcu-ai-composer__files" aria-label="Adjuntos">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${file.lastModified}`} className="gcu-ai-composer__file">
                <i className="feather-paperclip" aria-hidden="true" />
                <span className="gcu-ai-composer__file-name">{file.name}</span>
                <span className="gcu-ai-composer__file-size">{fileSizeKb(file)}</span>
                <button
                  type="button"
                  className="gcu-ai-composer__file-remove"
                  aria-label={`Quitar ${file.name}`}
                  onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                >
                  <i className="feather-x" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <textarea
          className="gcu-ai-composer__input"
          rows={variant === 'minimal' ? 1 : 2}
          value={text}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label={label}
          aria-describedby={describedBy}
          disabled={disabled}
          onChange={(event) => updateText(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="gcu-ai-composer__bar">
          {allowAttachments && (
            <>
              <input ref={fileRef} type="file" multiple hidden accept={accept} tabIndex={-1} onChange={handleFiles} />
              <IconButton size="sm" icon="paperclip" label="Adjuntar archivo" disabled={disabled} onClick={() => fileRef.current?.click()} />
            </>
          )}
          {tools && <div className="gcu-ai-composer__tools">{tools}</div>}
          <span className="gcu-ai-composer__spacer" />
          <span className="gcu-ai-composer__count" aria-hidden="true">
            {text.length.toLocaleString('es-CL')}/{maxLength.toLocaleString('es-CL')}
          </span>
          <span className="visually-hidden" aria-live="polite">
            {nearLimit ? `Quedan ${Math.max(0, maxLength - text.length)} caracteres` : ''}
          </span>
          {busy
            ? <IconButton size="sm" icon="square" label="Detener respuesta" onClick={onStop} />
            : <IconButton type="submit" size="sm" variant="primary" icon="arrow-up" label="Enviar pregunta" disabled={!canSend} />}
        </div>
      </div>
      {disabled && disabledReason && <p id={reasonId} className="gcu-ai-composer__reason">{disabledReason}</p>}
      <p id={noticeId} className="gcu-ai-composer__notice">{AI_DISCLAIMER}</p>
    </form>
  )
})
