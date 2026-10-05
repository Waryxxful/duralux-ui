import { Fragment, forwardRef, useEffect, useId, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { AiSource, StreamingAnswerProps } from '../../public/types'
import { Citation } from './Citation'
import { SourceList } from './SourceList'
import { SuggestionChips } from './internal/SuggestionChips'
import { completedBlocks, parseCitations, splitBlocks, spokenBlock } from './internal/answerBlocks'

const NO_SOURCES: ReadonlyArray<AiSource> = []
const NO_FOLLOW_UPS: ReadonlyArray<string> = []

/**
 * StreamingAnswer — respuesta del asistente que llega por partes, con citas `[n]`, fuentes y
 * preguntas de seguimiento.
 *
 * - Bloques = párrafos separados por una línea en blanco. Mientras `streaming`, el último bloque
 *   sigue creciendo con un cursor visual.
 * - Anuncio: una región `aria-live="polite"` aparte recibe solo los bloques TERMINADOS (nunca cada
 *   token). Solo anuncia si la respuesta se generó a la vista: un mensaje del historial no se lee solo.
 * - Al terminar: SourceList con las fuentes; sin fuentes, el texto lo dice. Después, seguimientos.
 * - Una marca `[n]` sin fuente se muestra como texto y se avisa por log (sin el contenido).
 * Estilos: src/styles/components/ai-answer.css.
 */
export const StreamingAnswer = /* @__PURE__ */ forwardRef<HTMLDivElement, StreamingAnswerProps>(function StreamingAnswer({
  text,
  sources = NO_SOURCES,
  streaming = false,
  followUps = NO_FOLLOW_UPS,
  onFollowUp,
  noSourcesText,
  className,
  ...rest
}, ref) {
  const idPrefix = `gcu-ai-src-${useId().replace(/:/g, '')}`
  const byId = useMemo(() => new Map(sources.map((source) => [source.id, source])), [sources])
  // Respuesta que crece por el final: la posición de cada bloque es su identidad.
  const blocks = splitBlocks(text).map((value, order) => ({ id: `bloque-${order}`, value }))
  // Solo se anuncian bloques de una respuesta que se vio generarse (no de una ya completa al montar).
  const [wasStreaming, setWasStreaming] = useState(streaming)
  if (streaming && !wasStreaming) setWasStreaming(true)
  const announced = wasStreaming
    ? completedBlocks(text, streaming).map((value, order) => ({ id: `anuncio-${order}`, value }))
    : []

  useEffect(() => {
    if (streaming) return
    const missing = new Set<number>()
    for (const block of splitBlocks(text)) {
      for (const part of parseCitations(block)) if (part.kind === 'cite' && !byId.has(part.id)) missing.add(part.id)
    }
    if (missing.size > 0) log.warn(`StreamingAnswer: ${missing.size} cita(s) sin fuente; se muestran como texto.`)
  }, [byId, streaming, text])

  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-answer', 'gcu-container', className)}>
      {/* aria-busy solo en el texto visible: en la región viva callaría los anuncios por bloque. */}
      <div className="gcu-ai-answer__text" aria-busy={streaming || undefined}>
        {blocks.map((block, index) => {
          const last = index === blocks.length - 1
          const parts = parseCitations(block.value).map((part, order) => ({ ...part, key: `${block.id}-${order}` }))
          return (
            <p key={block.id} className="gcu-ai-answer__block">
              {parts.map((part) => {
                if (part.kind === 'text') return <Fragment key={part.key}>{part.value}</Fragment>
                const source = byId.get(part.id)
                return source
                  ? <Citation key={part.key} source={source} targetId={streaming ? undefined : `${idPrefix}-${source.id}`} />
                  : <Fragment key={part.key}>[{part.id}]</Fragment>
              })}
              {streaming && last && <span className="gcu-ai-answer__caret" aria-hidden="true" />}
            </p>
          )
        })}
        {streaming && blocks.length === 0 && <span className="gcu-ai-answer__caret" aria-hidden="true" />}
      </div>
      <div className="visually-hidden" aria-live="polite" data-testid="ai-answer-live">
        {announced.map((block) => <p key={block.id}>{spokenBlock(block.value)}</p>)}
      </div>
      {!streaming && blocks.length > 0 && (
        <SourceList sources={sources} idPrefix={idPrefix} emptyText={noSourcesText} className="gcu-ai-answer__sources" />
      )}
      {!streaming && <SuggestionChips items={followUps} onPick={onFollowUp} label="Preguntas de seguimiento" />}
    </div>
  )
})
