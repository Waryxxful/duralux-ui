import { forwardRef } from 'react'
import { cx } from '../../../utils/cx'
import { log } from '../../../utils/log'
import { isFiniteNumber, isFunction } from '../../../utils/typeGuards'
import type { CriterionResult, CriterionRowProps, QualityCriterion } from '../../../public/types'
import { CRITERION_LABEL, GRAVE_LABEL, WEAK_EVIDENCE, toCriterionResult } from './qualityModel'

const GLYPH = {
  cumple: 'feather-check',
  no_cumple: 'feather-x',
  no_aplica: 'feather-minus',
} as const

/**
 * CriterionRow — una fila de la pauta de calidad: resultado, justificación, cita y evidencia.
 *
 * - result: `cumple` | `no_cumple` | `no_aplica`. Cada uno con ícono propio (✓, ✕, –) y texto:
 *   el resultado nunca va solo en color.
 * - grave: criterio de error grave; «No cumple» se lee «Error grave» y no muestra puntos.
 * - quote + turn + onShowTurn: «Ver en la transcripción» avisa el turno citado.
 * - evidence < 40: «Evidencia débil» en texto (la IA tiene poca confianza en el resultado).
 * Estilos: src/styles/components/criterion-row.css.
 */
export const CriterionRow = /* @__PURE__ */ forwardRef<HTMLDivElement, CriterionRowProps>(function CriterionRow({
  criterion,
  onShowTurn,
  className,
  ...rest
}, ref) {
  const result = toCriterionResult(criterion.result) ?? 'no_aplica'
  if (result !== criterion.result) log.warn(`CriterionRow: resultado desconocido "${String(criterion.result)}"; se usa "no_aplica".`)
  const canShowTurn = isFiniteNumber(criterion.turn) && isFunction(onShowTurn)

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('gcu-criterion', `gcu-criterion--${result}`, criterion.grave && 'gcu-criterion--grave', 'gcu-container', className)}
      data-result={result}
    >
      <span className="gcu-criterion__glyph" aria-hidden="true"><i className={GLYPH[result]} /></span>
      <div className="gcu-criterion__body">
        <div className="gcu-criterion__name">{criterion.name}</div>
        {criterion.justification && <p className="gcu-criterion__why">{criterion.justification}</p>}
        {criterion.quote && (
          <p className="gcu-criterion__quote">
            <q>{criterion.quote}</q>
            {canShowTurn && (
              <button
                type="button"
                className="gcu-criterion__turn"
                onClick={() => {
                  if (isFiniteNumber(criterion.turn)) onShowTurn?.(criterion.turn)
                }}
              >
                Ver en la transcripción
              </button>
            )}
          </p>
        )}
      </div>
      <CriterionMeta criterion={criterion} result={result} />
    </div>
  )
})

/** Resultado en texto, puntos y evidencia (columna derecha; abajo cuando la fila es angosta). */
function CriterionMeta({ criterion, result }: { criterion: QualityCriterion; result: CriterionResult }) {
  const label = criterion.grave ? GRAVE_LABEL[result] : CRITERION_LABEL[result]
  const showPoints = !criterion.grave && result !== 'no_aplica' && isFiniteNumber(criterion.points)
  const maxPoints = isFiniteNumber(criterion.maxPoints) ? `/${criterion.maxPoints}` : ''
  const evidence = isFiniteNumber(criterion.evidence) ? Math.round(criterion.evidence) : null
  const weak = evidence !== null && evidence < WEAK_EVIDENCE
  return (
    <div className="gcu-criterion__meta">
      <span className="gcu-criterion__result">{label}</span>
      {showPoints && <span className="gcu-criterion__points gcu-tabular">{criterion.points}{maxPoints} pts</span>}
      {evidence !== null && (
        <span className={cx('gcu-criterion__evidence', 'gcu-tabular', weak && 'gcu-criterion__evidence--weak')}>
          {weak ? `Evidencia débil (${evidence} %)` : `Evidencia ${evidence} %`}
        </span>
      )}
    </div>
  )
}
