import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber } from '../../utils/typeGuards'
import type { InsightCardProps } from '../../public/types'

type BarStyle = React.CSSProperties & { '--gcu-ai-bar': string }

const barStyle = (height: string): BarStyle => ({ '--gcu-ai-bar': height })

/** Alturas relativas al rango real (20–100 %) para que la variación se vea aunque los valores sean parecidos. */
function barHeights(series: ReadonlyArray<number>): Array<{ key: string; height: string; last: boolean }> {
  const values = series.filter((value) => isFiniteNumber(value))
  if (values.length !== series.length) log.warn('InsightCard: la serie trae valores no numéricos; se omiten.')
  if (values.length === 0) return []
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  return values.map((value, position) => ({
    key: `b${position}-${value}`,
    height: `${Math.round(20 + ((value - min) / span) * 80)}%`,
    last: position === values.length - 1,
  }))
}

/**
 * InsightCard — métrica con tendencia y una explicación de la IA de por qué cambió.
 *
 * - La variación lleva flecha (forma) y texto con signo; el tono dice si es buena o mala, no la dirección.
 * - Las barras son decorativas: la tendencia se describe en `seriesLabel` (texto para lectores).
 * - La explicación va marcada como generada por el asistente; sin `sources`, la tarjeta lo dice.
 * Estilos: src/styles/components/ai-insight-card.css.
 */
export const InsightCard = /* @__PURE__ */ forwardRef<HTMLElement, InsightCardProps>(function InsightCard({
  label,
  value,
  delta,
  series,
  seriesLabel,
  note,
  sources,
  action,
  className,
  ...rest
}, ref) {
  const bars = isArray(series) ? barHeights(series) : []
  const hasSources = sources !== undefined && sources !== null && sources !== false

  return (
    <article {...rest} ref={ref} className={cx('gcu-ai-insight', 'gcu-container', className)}>
      <span className="gcu-ai-insight__label">{label}</span>
      <div className="gcu-ai-insight__figure">
        <span className="gcu-ai-insight__value gcu-tabular">{value}</span>
        {delta && (
          <span className={cx('gcu-ai-insight__delta', delta.good ? 'gcu-ai-insight__delta--good' : 'gcu-ai-insight__delta--bad')}>
            <i className={delta.direction === 'up' ? 'feather-arrow-up-right' : 'feather-arrow-down-right'} aria-hidden="true" />
            <span className="gcu-tabular">{delta.value}</span>
            <span className="visually-hidden">{delta.good ? ' (favorable)' : ' (desfavorable)'}</span>
          </span>
        )}
      </div>
      {bars.length > 0 && (
        <>
          <span className="gcu-ai-insight__spark" aria-hidden="true">
            {bars.map((bar) => (
              <span
                key={bar.key}
                className={cx('gcu-ai-insight__bar', bar.last && 'gcu-ai-insight__bar--last')}
                style={barStyle(bar.height)}
              />
            ))}
          </span>
          {seriesLabel && <span className="visually-hidden">{seriesLabel}</span>}
        </>
      )}
      <div className="gcu-ai-insight__note">
        <span className="gcu-ai-insight__by">
          <i className="feather-zap" aria-hidden="true" />
          Explicación del asistente
        </span>
        <p className="gcu-ai-insight__text">{note}</p>
        <div className="gcu-ai-insight__sources">
          {hasSources ? sources : 'Sin fuentes citadas: verifica la cifra antes de decidir.'}
        </div>
      </div>
      {action !== undefined && action !== null && <div className="gcu-ai-insight__action">{action}</div>}
    </article>
  )
})
