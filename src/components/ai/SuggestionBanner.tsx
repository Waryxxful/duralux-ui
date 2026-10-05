import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import type { SuggestionBannerProps } from '../../public/types'
import { Button } from '../ui/Button'
import { AiAvatar } from './AiAvatar'

/**
 * SuggestionBanner — sugerencia del asistente dentro de una pantalla, con su fundamento.
 *
 * - Nunca ejecuta: «Aplicar» emite `onApply` (intención). Si la acción tiene efecto de negocio,
 *   la app la presenta en ApprovalCard antes de hacer nada (regla de IA 2.8).
 * - `basis` dice en qué se basa la sugerencia (cifras); sin fundamento, mejor no sugerir.
 * - `role="status"`: se anuncia sin interrumpir. Acciones bajo el texto en contenedores angostos.
 * Estilos: src/styles/components/ai-memory.css.
 */
export const SuggestionBanner = /* @__PURE__ */ forwardRef<HTMLDivElement, SuggestionBannerProps>(function SuggestionBanner(
  { title, basis, onApply, onDismiss, applyLabel = 'Aplicar', variant = 'inline', className, ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} role="status" className={cx('gcu-ai-suggest', `gcu-ai-suggest--${variant}`, className)}>
      <AiAvatar size="sm" />
      <div className="gcu-ai-suggest__text">
        <p className="gcu-ai-suggest__title"><span className="visually-hidden">Sugerencia del asistente: </span>{title}</p>
        {basis && <p className="gcu-ai-suggest__basis">{basis}</p>}
      </div>
      <div className="gcu-ai-suggest__actions">
        <Button variant="light-brand" size="sm" onClick={onDismiss}>Descartar</Button>
        <Button variant="primary" size="sm" onClick={onApply}>{applyLabel}</Button>
      </div>
    </div>
  )
})
