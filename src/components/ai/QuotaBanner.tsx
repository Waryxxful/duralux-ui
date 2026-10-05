import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { isFunction } from '../../utils/typeGuards'
import type { QuotaBannerProps } from '../../public/types'
import { Button } from '../ui/Button'
import { clampPercent, formatCountdown } from './internal/aiFormat'
import { useCountdown } from './internal/useElapsed'

const HIGH = 90

/**
 * QuotaBanner — consultas usadas del día con cuenta regresiva hasta el reinicio.
 *
 * - Barra `role="meter"`; desde 90 % pasa a advertencia y al 100 % a peligro, siempre con texto
 *   («Llegaste al límite»), nunca solo color.
 * - La cuenta regresiva es visual (`aria-hidden`); el nombre accesible da los minutos que faltan.
 * - onRequestMore: «Pedir más cupo» emite la intención; la app decide.
 * Estilos: src/styles/components/ai-usage.css.
 */
export const QuotaBanner = /* @__PURE__ */ forwardRef<HTMLDivElement, QuotaBannerProps>(function QuotaBanner(
  { used, limit, resetInSeconds, onRequestMore, variant = 'banner', className, ...rest },
  ref,
) {
  const left = useCountdown(resetInSeconds)
  const pct = clampPercent(used, limit)
  const tone = pct >= 100 ? 'danger' : pct >= HIGH ? 'warning' : 'normal'
  const minutes = Math.max(1, Math.ceil(left / 60))
  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-quota', 'gcu-container', `gcu-ai-quota--${variant}`, `gcu-ai-quota--${tone}`, className)}>
      <span className="gcu-ai-quota__label">{tone === 'danger' ? 'Llegaste al límite de consultas de hoy' : 'Consultas de hoy'}</span>
      <span className="gcu-ai-quota__value">{used.toLocaleString('es-CL')}/{limit.toLocaleString('es-CL')}</span>
      <span
        className="gcu-ai-meter"
        role="meter"
        aria-label="Consultas usadas hoy"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        aria-valuetext={`${used} de ${limit}`}
      >
        <span className="gcu-ai-meter__fill" style={{ inlineSize: `${pct}%` }} />
      </span>
      <span className="gcu-ai-quota__reset">
        Se reinicia en <span className="gcu-ai-quota__timer" aria-hidden="true">{formatCountdown(left)}</span>
        <span className="visually-hidden">{minutes} {minutes === 1 ? 'minuto' : 'minutos'}</span>
      </span>
      {isFunction(onRequestMore) && variant === 'banner' && (
        <Button variant="light-brand" size="sm" className="gcu-ai-quota__action" onClick={onRequestMore}>Pedir más cupo</Button>
      )}
    </div>
  )
})
