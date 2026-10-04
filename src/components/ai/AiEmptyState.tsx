import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { AiEmptyStateProps } from '../../public/types'
import { AiAvatar } from './AiAvatar'
import { SuggestionChips } from './internal/SuggestionChips'

/**
 * AiEmptyState — primer contacto con el asistente: qué puede hacer y preguntas sugeridas.
 *
 * - suggestions: 3 a 4 preguntas concretas del dominio; elegir una emite `onPick` (no envía sola).
 * - align `center` para un panel vacío; `start` dentro de un hilo.
 * Estilos: src/styles/components/ai-empty-state.css.
 */
export const AiEmptyState = /* @__PURE__ */ forwardRef<HTMLDivElement, AiEmptyStateProps>(function AiEmptyState(
  { title, description, suggestions = [], onPick, align = 'start', headingLevel = 2, className, ...rest },
  ref,
) {
  if (suggestions.length > 4) log.warn(`AiEmptyState: ${suggestions.length} sugerencias; muestra 3 o 4 para no abrumar.`)
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4'
  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-empty', 'gcu-container', align === 'center' && 'gcu-ai-empty--center', className)}>
      <AiAvatar size="lg" />
      <Heading className="gcu-ai-empty__title">{title}</Heading>
      {description && <p className="gcu-ai-empty__text">{description}</p>}
      <SuggestionChips items={suggestions} onPick={onPick} label="Preguntas sugeridas" />
    </div>
  )
})
