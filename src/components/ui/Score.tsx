import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { isFiniteNumber } from '../../utils/typeGuards'
import type { ScoreHeroProps, ScoreProps } from '../../public/types'
import { formatDelta, formatIndicatorNumber } from './internal/indicator'
import { IndicatorDeltaChip } from './internal/IndicatorParts'
import { SCORE_RANGE_LABEL, checkScoreValue, resolveScoreMax, scoreRangeOf } from './internal/severity'

/**
 * Score — puntaje sobre un máximo (100 por defecto) con cifras tabulares y su rango en texto:
 * «Bueno» (≥ 80 %), «Medio» (≥ 50 %), «Bajo» o «Anulado». El color solo acompaña al texto.
 *
 * - voided: anulado por un error grave; la cifra se tacha y el rango dice «Anulado».
 * - thresholds: umbrales propios de ok y medio (en la escala de `max`).
 * - Sin valor: «—» con «Sin puntaje» para lectores de pantalla.
 * Estilos: src/styles/components/score.css.
 */
export const Score = /* @__PURE__ */ forwardRef<HTMLSpanElement, ScoreProps>(function Score({
  value,
  max: maxProp,
  voided = false,
  thresholds,
  showRange = true,
  size = 'md',
  className,
  ...rest
}, ref) {
  const max = resolveScoreMax('Score', maxProp)
  if (!isFiniteNumber(value)) {
    return (
      <span {...rest} ref={ref} className={cx('gcu-score', 'gcu-score--empty', `gcu-score--${size}`, className)}>
        <span className="gcu-score__value" aria-hidden="true">—</span>
        <span className="visually-hidden">Sin puntaje</span>
      </span>
    )
  }
  checkScoreValue('Score', value, max)
  const range = scoreRangeOf(value, max, thresholds, voided)
  const number = formatIndicatorNumber(value)

  return (
    <span {...rest} ref={ref} className={cx('gcu-score', `gcu-score--${range}`, `gcu-score--${size}`, className)} data-range={range}>
      <span className="gcu-score__figure gcu-tabular">
        {voided ? <s className="gcu-score__value">{number}</s> : <span className="gcu-score__value">{number}</span>}
        <span className="gcu-score__max">/{formatIndicatorNumber(max)}</span>
      </span>
      {showRange
        ? <span className="gcu-score__range">{SCORE_RANGE_LABEL[range]}</span>
        : <span className="visually-hidden">{SCORE_RANGE_LABEL[range]}</span>}
    </span>
  )
})

/**
 * ScoreHero — el puntaje protagonista de una cabecera de detalle (evaluación, auditoría).
 *
 * - Cifra grande tabular + rango en texto + contexto (meta, evaluaciones) o variación.
 * - previous: puntaje antes de la anulación; si existe, el puntaje se muestra anulado y el
 *   previo al lado («Antes del error»). Responde a su contenedor: angosto, se apilan.
 * - loading: skeleton y `aria-busy`.
 * Estilos: src/styles/components/score.css.
 */
export const ScoreHero = /* @__PURE__ */ forwardRef<HTMLDivElement, ScoreHeroProps>(function ScoreHero({
  value,
  max: maxProp,
  label = 'Puntaje final',
  previous,
  voided: voidedProp = false,
  thresholds,
  delta,
  context,
  loading = false,
  className,
  ...rest
}, ref) {
  const max = resolveScoreMax('ScoreHero', maxProp)
  const voided = voidedProp || isFiniteNumber(previous)
  const hasValue = isFiniteNumber(value)
  if (hasValue) checkScoreValue('ScoreHero', value, max)
  const range = hasValue ? scoreRangeOf(value, max, thresholds, voided) : null
  const formattedDelta = formatDelta('ScoreHero', delta)

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('gcu-score-hero', 'gcu-container', range && `gcu-score-hero--${range}`, className)}
      aria-busy={loading || rest['aria-busy'] || undefined}
    >
      <div className="gcu-score-hero__inner">
        <div className="gcu-score-hero__main">
          <p className="gcu-score-hero__label">{label}</p>
          <p className="gcu-score-hero__figure gcu-tabular">
            {loading ? (
              <>
                <span className="gcu-skeleton gcu-score-hero__skeleton" aria-hidden="true" />
                <span className="visually-hidden">Cargando</span>
              </>
            ) : hasValue ? (
              <>
                {voided ? <s className="gcu-score-hero__value">{formatIndicatorNumber(value)}</s> : <span className="gcu-score-hero__value">{formatIndicatorNumber(value)}</span>}
                <span className="gcu-score-hero__max">/{formatIndicatorNumber(max)}</span>
              </>
            ) : (
              <>
                <span className="gcu-score-hero__value" aria-hidden="true">—</span>
                <span className="visually-hidden">Sin puntaje</span>
              </>
            )}
          </p>
          {!loading && (range || formattedDelta || context) && (
            <div className="gcu-score-hero__meta">
              {range && <span className={cx('gcu-score-hero__range', `gcu-score-hero__range--${range}`)}>{SCORE_RANGE_LABEL[range]}</span>}
              {formattedDelta && <IndicatorDeltaChip delta={formattedDelta} label={delta?.label} />}
              {context && <span className="gcu-score-hero__context">{context}</span>}
            </div>
          )}
        </div>
        {!loading && isFiniteNumber(previous) && (
          <div className="gcu-score-hero__previous">
            <p className="gcu-score-hero__label">Antes del error</p>
            <p className="gcu-score-hero__figure gcu-score-hero__figure--sm gcu-tabular">
              <span className="gcu-score-hero__value">{formatIndicatorNumber(previous)}</span>
              <span className="gcu-score-hero__max">/{formatIndicatorNumber(max)}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
})
