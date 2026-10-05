import { forwardRef, useEffect, useMemo, useRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { Button } from '../ui/Button'
import type { InlineEditProps } from '../../public/types'
import { keyedDiff, wordDiff } from './diffModel'

/**
 * InlineEdit — mejora sugerida por el asistente para un texto (respuesta a un cliente, guion,
 * correo), con diferencias palabra a palabra y aceptar/descartar.
 *
 * - Agregado en `<ins>` y quitado en `<del>` (los lectores de pantalla los distinguen; el color no es
 *   la única señal: lo quitado va tachado).
 * - Teclado: con el foco en la sugerencia, Enter acepta; Esc descarta desde cualquier parte del bloque.
 *   Enter sobre un botón activa ese botón, no acepta.
 * - Aceptar solo emite el texto con `onAccept(texto)`: quien consume decide dónde guardarlo.
 * Estilos: src/styles/components/ai-inline-edit.css.
 */
export const InlineEdit = /* @__PURE__ */ forwardRef<HTMLDivElement, InlineEditProps>(function InlineEdit({
  original,
  suggestion,
  instruction,
  onAccept,
  onReject,
  acceptLabel = 'Aceptar',
  rejectLabel = 'Descartar',
  autoFocus = false,
  className,
  onKeyDown,
  ...rest
}, ref) {
  const parts = useMemo(() => keyedDiff(wordDiff(original, suggestion)), [original, suggestion])
  const textRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    if (autoFocus) textRef.current?.focus()
  }, [autoFocus])

  const accept = () => {
    log.debug('InlineEdit: sugerencia aceptada.')
    onAccept(suggestion)
  }
  const reject = () => {
    log.debug('InlineEdit: sugerencia descartada.')
    onReject()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (event.key === 'Escape') {
      event.preventDefault()
      reject()
      return
    }
    if (event.key === 'Enter' && !event.shiftKey && event.target === textRef.current) {
      event.preventDefault()
      accept()
    }
  }

  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      aria-label="Sugerencia del asistente"
      className={cx('gcu-ai-inline', className)}
      onKeyDown={handleKeyDown}
    >
      <div className="gcu-ai-inline__bar">
        <i className="feather-edit-3" aria-hidden="true" />
        <span>{instruction ?? 'Sugerencia del asistente'}</span>
      </div>
      <p
        ref={textRef}
        className="gcu-ai-inline__text"
        role="textbox"
        aria-readonly="true"
        aria-multiline="true"
        aria-label="Texto sugerido"
        tabIndex={0}
        aria-keyshortcuts="Enter Escape"
      >
        {parts.map(({ key, text, kind }) => {
          if (kind === 'add') return <ins key={key} className="gcu-ai-inline__add">{text}</ins>
          if (kind === 'del') return <del key={key} className="gcu-ai-inline__del">{text}</del>
          return <span key={key}>{text}</span>
        })}
      </p>
      <p className="gcu-ai-inline__hint">Enter acepta · Esc descarta</p>
      <div className="gcu-ai-inline__actions">
        <Button variant="light-brand" size="sm" startIcon="x" onClick={reject}>{rejectLabel}</Button>
        <Button variant="primary" size="sm" startIcon="check" onClick={accept}>{acceptLabel}</Button>
      </div>
    </div>
  )
})
