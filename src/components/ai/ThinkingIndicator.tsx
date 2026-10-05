import { forwardRef, useEffect } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { ThinkingIndicatorProps } from '../../public/types'

/** Más allá de esto la espera necesita AiLoader con tiempo transcurrido (spec 2.8). */
export const THINKING_MAX_MS = 3000

/**
 * ThinkingIndicator — «el asistente está pensando» para esperas cortas (< 3 s).
 *
 * - `role="status"`: se anuncia una vez; la animación es decorativa (`aria-hidden`) y se detiene
 *   con reduced-motion.
 * - Si sigue visible después de 3 s, avisa por log: esa espera debe pasar a AiLoader.
 * Estilos: src/styles/components/ai-loader.css.
 */
export const ThinkingIndicator = /* @__PURE__ */ forwardRef<HTMLDivElement, ThinkingIndicatorProps>(function ThinkingIndicator(
  { label = 'El asistente está pensando', variant = 'dots', className, ...rest },
  ref,
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      log.warn('ThinkingIndicator: la espera superó 3 s; usa AiLoader con tiempo transcurrido.')
    }, THINKING_MAX_MS)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div {...rest} ref={ref} role="status" className={cx('gcu-ai-thinking', `gcu-ai-thinking--${variant}`, className)}>
      <span className="gcu-ai-thinking__anim" aria-hidden="true">
        {variant === 'dots' ? <><i /><i /><i /></> : <i />}
      </span>
      <span className="gcu-ai-thinking__label">{label}</span>
    </div>
  )
})
