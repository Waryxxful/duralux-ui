import { forwardRef, useId, useState } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { Button } from '../ui/Button'
import type { ApprovalCardProps, ApprovalIntent, ApprovalStatus } from '../../public/types'
import { formatArgs } from './internal/agentStatus'

const DECIDED_TEXT = {
  approved: 'Aprobado. El sistema hará la acción y te avisará el resultado.',
  rejected: 'Descartado. No se hará ningún cambio.',
} satisfies Record<Exclude<ApprovalStatus, 'pending'>, string>

/**
 * ApprovalCard — aprobación humana antes de una acción con efecto (enviar, actualizar, reasignar).
 *
 * - El componente NUNCA ejecuta la acción: muestra qué se hará y emite la intención con
 *   `onApprove(intent)` u `onReject(intent)`. Quien consume decide y ejecuta en el servidor.
 * - Después de decidir, los botones desaparecen y una región `status` anuncia la decisión (evita
 *   doble emisión). Con `status` controlado, manda el consumidor.
 * - destructive: el botón de aprobar usa tono de peligro. disabledReason: deshabilita y explica.
 * - Logging: solo la decisión y el nombre de la herramienta; nunca los parámetros.
 * Estilos: src/styles/components/ai-approval-card.css.
 */
export const ApprovalCard = /* @__PURE__ */ forwardRef<HTMLElement, ApprovalCardProps>(function ApprovalCard({
  title,
  description,
  children,
  intentId,
  tool,
  params,
  showParams = false,
  drafter = 'Asistente',
  onApprove,
  onReject,
  approveLabel = 'Aprobar',
  rejectLabel = 'Descartar',
  status: controlledStatus,
  destructive = false,
  disabledReason,
  className,
  ...rest
}, ref) {
  const baseId = `gcu-ai-approval-${useId().replace(/:/g, '')}`
  const [innerStatus, setInnerStatus] = useState<ApprovalStatus>('pending')
  const status = controlledStatus ?? innerStatus
  const blocked = disabledReason !== undefined && disabledReason !== null && disabledReason !== false
  const json = showParams ? formatArgs(params, 'ApprovalCard') : null

  const decide = (next: Exclude<ApprovalStatus, 'pending'>) => {
    if (status !== 'pending' || blocked) return
    const intent: ApprovalIntent = { id: intentId, tool, params }
    if (controlledStatus === undefined) setInnerStatus(next)
    log.info(`ApprovalCard: intención ${next === 'approved' ? 'aprobada' : 'descartada'}${tool ? ` (${tool})` : ''}.`)
    if (next === 'approved') onApprove(intent)
    else onReject(intent)
  }

  return (
    <section
      {...rest}
      ref={ref}
      aria-labelledby={`${baseId}-title`}
      className={cx('gcu-ai-approval', 'gcu-container', `gcu-ai-approval--${status}`, destructive && 'gcu-ai-approval--destructive', className)}
    >
      <span className="gcu-ai-approval__eyebrow">
        <i className="feather-alert-triangle" aria-hidden="true" />
        {status === 'pending' ? 'Necesita tu aprobación' : 'Decisión registrada'}
      </span>
      <h3 id={`${baseId}-title`} className="gcu-ai-approval__title">{title}</h3>
      {description !== undefined && description !== null && <p className="gcu-ai-approval__description">{description}</p>}
      {children !== undefined && children !== null && <div className="gcu-ai-approval__detail">{children}</div>}
      {json !== null && <pre className="gcu-ai-approval__params" aria-label="Parámetros de la acción">{json}</pre>}
      <p className="gcu-ai-approval__by">
        Preparado por {drafter}
        {tool && <> · <span className="gcu-ai-approval__tool">{tool}</span></>}
      </p>
      {status === 'pending' ? (
        <div className="gcu-ai-approval__actions">
          {blocked && <p id={`${baseId}-blocked`} className="gcu-ai-approval__blocked">{disabledReason}</p>}
          <Button variant="light-brand" size="sm" onClick={() => decide('rejected')} disabled={blocked} aria-describedby={blocked ? `${baseId}-blocked` : undefined}>
            {rejectLabel}
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} size="sm" onClick={() => decide('approved')} disabled={blocked} aria-describedby={blocked ? `${baseId}-blocked` : undefined}>
            {approveLabel}
          </Button>
        </div>
      ) : (
        <p className="gcu-ai-approval__decided" role="status">
          <i className={status === 'approved' ? 'feather-check' : 'feather-x'} aria-hidden="true" />
          {DECIDED_TEXT[status]}
        </p>
      )}
    </section>
  )
})
