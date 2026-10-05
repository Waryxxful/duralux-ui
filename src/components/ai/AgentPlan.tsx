import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFunction } from '../../utils/typeGuards'
import { Button, IconButton } from '../ui/Button'
import type { AgentPlanProps } from '../../public/types'

/**
 * AgentPlan — plan de varios pasos propuesto por el agente, revisable antes de aprobarlo.
 *
 * - El componente NUNCA ejecuta: «Aprobar plan» emite `onApprove(pasos)` con los pasos ya
 *   editados; «Descartar» emite `onReject()`. Quien consume ejecuta en el servidor.
 * - Con `onChange`, cada paso tiene «Quitar paso N» (botón real con nombre accesible).
 * - running: el consumidor está ejecutando; se bloquean edición y decisión y se anuncia en `status`.
 * - Sin pasos, «Aprobar plan» queda deshabilitado y se explica por qué.
 * Estilos: src/styles/components/ai-agent-plan.css.
 */
export const AgentPlan = /* @__PURE__ */ forwardRef<HTMLElement, AgentPlanProps>(function AgentPlan({
  steps,
  title = 'Antes de continuar, revisa los pasos',
  onApprove,
  onReject,
  onChange,
  running = false,
  approveLabel = 'Aprobar plan',
  className,
  ...rest
}, ref) {
  const baseId = `gcu-ai-plan-${useId().replace(/:/g, '')}`
  const list = isArray(steps) ? steps : []
  if (!isArray(steps)) log.warn('AgentPlan: `steps` debe ser un arreglo; se muestra vacío.')
  const editable = isFunction(onChange) && !running
  const empty = list.length === 0

  const remove = (id: string) => {
    if (!editable) return
    log.debug('AgentPlan: paso quitado del plan.')
    onChange(list.filter((step) => step.id !== id))
  }

  const approve = () => {
    if (running || empty) return
    log.info(`AgentPlan: intención de ejecutar un plan de ${list.length} pasos.`)
    onApprove([...list])
  }

  return (
    <section {...rest} ref={ref} aria-labelledby={`${baseId}-title`} className={cx('gcu-ai-plan', 'gcu-container', className)} aria-busy={running || undefined}>
      <header className="gcu-ai-plan__header">
        <span className="gcu-ai-plan__eyebrow gcu-tabular">Plan propuesto · {list.length} {list.length === 1 ? 'paso' : 'pasos'}</span>
        <h3 id={`${baseId}-title`} className="gcu-ai-plan__title">{title}</h3>
      </header>
      {empty ? (
        <p className="gcu-ai-plan__empty">El plan no tiene pasos. Pídele al asistente una propuesta nueva.</p>
      ) : (
        <ol className="gcu-ai-plan__list">
          {list.map((step, index) => (
            <li key={step.id} className="gcu-ai-plan__item">
              <span className="gcu-ai-plan__n gcu-tabular" aria-hidden="true">{index + 1}</span>
              <span className="gcu-ai-plan__text">
                {step.text}
                {step.tool && <span className="gcu-ai-plan__tool"> · {step.tool}</span>}
              </span>
              {editable && (
                <IconButton icon="x" label={`Quitar paso ${index + 1}`} size="sm" className="gcu-ai-plan__remove" onClick={() => remove(step.id)} />
              )}
            </li>
          ))}
        </ol>
      )}
      <div className="gcu-ai-plan__footer">
        <p className="gcu-ai-plan__status" role="status">
          {running ? 'Plan aprobado. Se está ejecutando; te avisaremos al terminar.' : ''}
        </p>
        {!running && (
          <div className="gcu-ai-plan__actions">
            {isFunction(onReject) && (
              <Button variant="light-brand" size="sm" onClick={() => { log.info('AgentPlan: plan descartado.'); onReject() }}>Descartar</Button>
            )}
            <Button variant="primary" size="sm" startIcon="check" onClick={approve} disabled={empty} title={empty ? 'No hay pasos que aprobar' : undefined}>
              {approveLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
})
