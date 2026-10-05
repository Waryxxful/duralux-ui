import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFiniteNumber } from '../../utils/typeGuards'
import type { AgentStepsProps } from '../../public/types'
import { AgentStatusBadge, AgentStatusIcon } from './internal/agentStatus'
import { formatArgs, resolveAgentStatus } from './internal/agentStatusModel'
import { ToolChip } from './ToolChip'

/**
 * AgentSteps — línea de tiempo de las herramientas que usa un agente: estado en texto, duración,
 * argumentos, resultado y llamadas en paralelo (como ToolChip).
 *
 * - Lista ordenada con nombre accesible; el paso en curso lleva `aria-current="step"`.
 * - compact: solo título, herramienta y estado.
 * - Solo muestra lo que ocurrió: no ejecuta nada.
 * Estilos: src/styles/components/ai-agent-steps.css.
 */
export const AgentSteps = /* @__PURE__ */ forwardRef<HTMLOListElement, AgentStepsProps>(function AgentSteps({
  steps,
  compact = false,
  label = 'Pasos del agente',
  className,
  ...rest
}, ref) {
  const list = isArray(steps) ? steps : []
  if (!isArray(steps)) log.warn('AgentSteps: `steps` debe ser un arreglo; se muestra vacío.')

  return (
    <ol {...rest} ref={ref} aria-label={label} className={cx('gcu-ai-steps', compact && 'gcu-ai-steps--compact', className)}>
      {list.map((step, index) => {
        const status = resolveAgentStatus(step.status, 'AgentSteps')
        const json = compact ? null : formatArgs(step.args, 'AgentSteps')
        const hasResult = !compact && step.result !== undefined && step.result !== null && step.result !== false
        return (
          <li
            key={step.id}
            className={cx('gcu-ai-steps__item', `gcu-ai-steps__item--${status}`)}
            aria-current={status === 'running' ? 'step' : undefined}
          >
            <span className="gcu-ai-steps__marker gcu-tabular" aria-hidden="true">
              {status === 'queued' ? index + 1 : <AgentStatusIcon status={status} />}
            </span>
            <div className="gcu-ai-steps__body">
              <div className="gcu-ai-steps__head">
                <span className="gcu-ai-steps__title">{step.title}</span>
                <span className="gcu-ai-steps__meta">
                  <AgentStatusBadge status={status} />
                  {isFiniteNumber(step.seconds) && <span className="gcu-ai-steps__time gcu-tabular">{step.seconds.toLocaleString('es-CL')} s</span>}
                </span>
              </div>
              <span className="gcu-ai-steps__tool">{step.tool}</span>
              {json !== null && <pre className="gcu-ai-steps__json">{json}</pre>}
              {hasResult && <div className="gcu-ai-steps__result">{step.result}</div>}
              {isArray(step.parallel) && step.parallel.length > 0 && (
                <div className="gcu-ai-steps__parallel" role="group" aria-label="En paralelo">
                  {step.parallel.map((call) => (
                    <ToolChip
                      key={call.id}
                      tool={call.tool}
                      status={call.status}
                      seconds={call.seconds}
                      args={compact ? undefined : call.args}
                      result={compact ? undefined : call.result}
                    />
                  ))}
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
})
