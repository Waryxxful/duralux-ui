import { forwardRef, useEffect } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFunction } from '../../utils/typeGuards'
import type { AiLoaderProps } from '../../public/types'
import { Button } from '../ui/Button'
import { AiAvatar } from './AiAvatar'
import { formatElapsed } from './internal/aiFormat'
import { useElapsed } from './internal/useElapsed'

/**
 * AiLoader — espera larga del asistente con tiempo transcurrido: «Analizando 1.284 llamadas · 8 s».
 *
 * - `role="status"` anuncia la tarea una vez; el contador es visual (`aria-hidden`): anunciarlo
 *   cada segundo satura al lector de pantalla.
 * - startedAt: inicio real de la tarea (para no reiniciar al remontar); por defecto, el montaje.
 * - onCancel: «Cancelar» emite la intención; la app detiene la tarea.
 * Estilos: src/styles/components/ai-loader.css.
 */
export const AiLoader = /* @__PURE__ */ forwardRef<HTMLDivElement, AiLoaderProps>(function AiLoader(
  { label, startedAt, onCancel, className, ...rest },
  ref,
) {
  const seconds = useElapsed(true, startedAt)
  useEffect(() => {
    log.debug('AiLoader: inicia una espera larga del asistente.')
    return () => log.debug('AiLoader: termina la espera.')
  }, [])
  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-loader', className)} aria-busy="true">
      <AiAvatar size="sm" busy />
      <span role="status" className="gcu-ai-loader__label">{label}</span>
      <span className="gcu-ai-loader__time" aria-hidden="true" data-testid="ai-loader-time">{formatElapsed(seconds)}</span>
      {isFunction(onCancel) && (
        <Button variant="light-brand" size="sm" className="gcu-ai-loader__cancel" onClick={onCancel}>Cancelar</Button>
      )}
    </div>
  )
})
