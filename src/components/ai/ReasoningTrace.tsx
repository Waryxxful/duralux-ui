import { forwardRef, useEffect, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray } from '../../utils/typeGuards'
import type { ReasoningTraceProps } from '../../public/types'

/** Segundos transcurridos mientras `active`; vuelve a 0 al reactivarse. Privado de este archivo. */
function useLiveSeconds(active: boolean): number {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!active) return undefined
    setSeconds(0)
    const startedAt = Date.now()
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [active])
  return seconds
}

/**
 * ReasoningTrace — razonamiento del asistente, plegable, con tiempo y pasos numerados.
 *
 * - `<details>` nativo: teclado y lector de pantalla sin ARIA extra.
 * - thinking: se abre solo, cuenta el tiempo en vivo y muestra un paso pendiente; si la persona
 *   lo cierra, se respeta su decisión hasta el siguiente razonamiento.
 * - Al terminar muestra «Razonó N s» (prop `seconds`).
 * Estilos: src/styles/components/ai-reasoning-trace.css.
 */
export const ReasoningTrace = /* @__PURE__ */ forwardRef<HTMLDetailsElement, ReasoningTraceProps>(function ReasoningTrace({
  steps,
  seconds,
  thinking = false,
  defaultOpen = false,
  summary,
  onOpenChange,
  className,
  ...rest
}, ref) {
  const list = isArray(steps) ? steps : []
  if (!isArray(steps)) log.warn('ReasoningTrace: `steps` debe ser un arreglo; se muestra vacío.')
  const live = useLiveSeconds(thinking)
  const shownSeconds = thinking ? live : seconds ?? 0
  const [open, setOpen] = useState(defaultOpen || thinking)

  useEffect(() => {
    if (thinking) setOpen(true)
  }, [thinking])

  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const next = event.currentTarget.open
    if (next === open) return
    setOpen(next)
    onOpenChange?.(next)
  }

  return (
    <details
      {...rest}
      ref={ref}
      className={cx('gcu-ai-reasoning', thinking && 'gcu-ai-reasoning--thinking', className)}
      open={open}
      onToggle={handleToggle}
      aria-busy={thinking || undefined}
    >
      <summary className="gcu-ai-reasoning__summary">
        <i className="feather-cpu gcu-ai-reasoning__icon" aria-hidden="true" />
        <span className="gcu-ai-reasoning__time gcu-tabular">{thinking ? 'Pensando' : 'Razonó'} {shownSeconds} s</span>
        {summary !== undefined && summary !== null && <span className="gcu-ai-reasoning__hint">· {summary}</span>}
        <i className="feather-chevron-down gcu-ai-reasoning__chevron" aria-hidden="true" />
      </summary>
      <ol className="gcu-ai-reasoning__steps">
        {list.map((step, index) => (
          // Los pasos del razonamiento no tienen id propio y solo se agregan al final: el índice es estable.
          <li key={`paso-${index}`} className="gcu-ai-reasoning__step">
            <span className="gcu-ai-reasoning__n gcu-tabular" aria-hidden="true">{index + 1}</span>
            <span className="gcu-ai-reasoning__text">{step}</span>
          </li>
        ))}
        {thinking && (
          <li className="gcu-ai-reasoning__step gcu-ai-reasoning__step--live">
            <span className="gcu-ai-reasoning__n gcu-tabular" aria-hidden="true">{list.length + 1}</span>
            <span className="gcu-ai-reasoning__pending">
              <span className="visually-hidden">Pensando el siguiente paso</span>
            </span>
          </li>
        )}
      </ol>
    </details>
  )
})
