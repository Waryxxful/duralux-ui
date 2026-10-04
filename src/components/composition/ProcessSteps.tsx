import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber } from '../../utils/typeGuards'
import type { ProcessStep, ProcessStepStatus, ProcessStepsProps } from '../../public/types'
import { hasIndicatorContent } from '../ui/internal/indicator'

const STATUS_TEXT = {
  done: 'Completado',
  current: 'En curso',
  failed: 'Con error',
  todo: 'Pendiente',
} satisfies Record<ProcessStepStatus, string>

const STATUS_ICON: Partial<Record<ProcessStepStatus, string>> = { done: 'feather-check', failed: 'feather-x' }

function statusOf(step: ProcessStep, index: number, current: number, failed: boolean): ProcessStepStatus {
  if (step.status) return step.status
  if (index < current) return 'done'
  if (index === current) return failed ? 'failed' : 'current'
  return 'todo'
}

/**
 * ProcessSteps — avance de un proceso por etapas (Transcripción → Análisis IA → Completado).
 *
 * - Cada paso dice su estado en texto («Completado», «En curso», «Con error», «Pendiente») además
 *   de la forma del marcador (check, número, cruz); el paso en curso lleva `aria-current="step"`.
 * - current + failed deducen los estados; `status` por paso los fija.
 * - orientation `horizontal` pasa a vertical en contenedores de menos de 36rem.
 * Estilos: src/styles/components/process-steps.css.
 */
export const ProcessSteps = /* @__PURE__ */ forwardRef<HTMLDivElement, ProcessStepsProps>(function ProcessSteps({
  steps,
  current = 0,
  failed = false,
  label,
  orientation = 'horizontal',
  className,
  ...rest
}, ref) {
  const list = isArray(steps) ? steps : []
  if (!isFiniteNumber(current)) log.warn(`ProcessSteps: current debe ser un número (recibido: ${String(current)}).`)
  const currentIndex = isFiniteNumber(current) ? current : 0

  return (
    <div {...rest} ref={ref} className={cx('gcu-process-steps', 'gcu-container', `gcu-process-steps--${orientation}`, className)}>
      <ol className="gcu-process-steps__list" aria-label={label}>
        {list.map((step, index) => {
          const status = statusOf(step, index, currentIndex, failed)
          const icon = STATUS_ICON[status]
          return (
            <li
              key={step.key}
              className={cx('gcu-process-steps__item', `gcu-process-steps__item--${status}`)}
              aria-current={status === 'current' || status === 'failed' ? 'step' : undefined}
            >
              <span className="gcu-process-steps__marker gcu-tabular" aria-hidden="true">
                {icon ? <i className={icon} /> : index + 1}
              </span>
              <span className="gcu-process-steps__text">
                <span className="gcu-process-steps__label">{step.label}</span>
                <span className="gcu-process-steps__status">{STATUS_TEXT[status]}</span>
                {hasIndicatorContent(step.description) && <span className="gcu-process-steps__description">{step.description}</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
})
