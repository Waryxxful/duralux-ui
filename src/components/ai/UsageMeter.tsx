import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isFiniteNumber } from '../../utils/typeGuards'
import type { UsageMeterProps } from '../../public/types'
import { clampPercent, formatCost, formatPercent, formatTokens } from './internal/aiFormat'

/**
 * UsageMeter — uso de la ventana de contexto con desglose (pregunta / respuesta) y costo estimado.
 *
 * - bar: barra `role="meter"` con cifras tabulares. inline: una línea para la barra del compositor.
 * - El costo solo aparece si se pasa `costPer1k` (dólares por 1.000 tokens).
 * Estilos: src/styles/components/ai-usage.css.
 */
export const UsageMeter = /* @__PURE__ */ forwardRef<HTMLElement, UsageMeterProps>(function UsageMeter(
  { promptTokens, completionTokens, limit, costPer1k, variant = 'bar', className, ...rest },
  ref,
) {
  const used = Math.max(0, (promptTokens || 0) + (completionTokens || 0))
  const pct = limit > 0 ? clampPercent(used, limit) : 0
  const cost = isFiniteNumber(costPer1k) ? `≈ ${formatCost((used / 1000) * costPer1k)}` : null
  const summary = `${formatTokens(used)} de ${formatTokens(limit)} tokens · ${formatPercent(pct)}`

  if (variant === 'inline') {
    return (
      // SAFETY: el ref público es HTMLElement; en línea la raíz es un <span>.
      <span {...rest} ref={ref as React.Ref<HTMLSpanElement>} className={cx('gcu-ai-usage', 'gcu-ai-usage--inline', className)}>
        <span className="visually-hidden">Uso de contexto: </span>
        {summary}{cost && ` · ${cost}`}
      </span>
    )
  }
  return (
    // SAFETY: el ref público es HTMLElement; en barra la raíz es un <div>.
    <div {...rest} ref={ref as React.Ref<HTMLDivElement>} className={cx('gcu-ai-usage', className)}>
      <div className="gcu-ai-usage__row">
        <span className="gcu-ai-usage__label">Contexto</span>
        <span className="gcu-ai-usage__value">{formatTokens(used)} / {formatTokens(limit)}</span>
      </div>
      <span
        className={cx('gcu-ai-meter', pct >= 90 && 'gcu-ai-meter--warning')}
        role="meter"
        aria-label="Uso de contexto"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        aria-valuetext={summary}
      >
        <span className="gcu-ai-meter__fill" style={{ inlineSize: `${Math.max(1, pct)}%` }} />
      </span>
      <div className="gcu-ai-usage__row gcu-ai-usage__detail">
        <span>Pregunta {formatTokens(promptTokens)} · Respuesta {formatTokens(completionTokens)}</span>
        {cost && <span className="gcu-ai-usage__value">{cost}</span>}
      </div>
    </div>
  )
})
