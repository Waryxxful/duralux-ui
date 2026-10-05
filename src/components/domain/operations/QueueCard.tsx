import { forwardRef } from 'react'
import { cx } from '../../../utils/cx'
import type { QueueCardProps } from '../../../public/types'
import { headingTag } from '../../ui/internal/indicator'
import { Severity } from '../../ui/Severity'
import { formatDuration } from '../internal/duration'
import { TargetBar } from './TargetBar'

/**
 * QueueCard — estado en vivo de una cola: en espera, espera más larga, agentes libres y nivel
 * de servicio contra su meta (TargetBar).
 *
 * - Crítica cuando la espera máxima supera `umbral × criticalWaitFactor` (120 s con 80/20) o hay
 *   contactos esperando sin agentes libres. Se dice en texto («Atiende esta cola») con forma
 *   (Severity) y borde de inicio; las cifras fuera de rango también llevan su texto.
 * Estilos: src/styles/components/queue-card.css.
 */
export const QueueCard = /* @__PURE__ */ forwardRef<HTMLElement, QueueCardProps>(function QueueCard({
  name,
  waiting,
  longestWait,
  agentsAvailable,
  serviceLevel,
  target = 80,
  thresholdSeconds = 20,
  criticalWaitFactor = 6,
  channel,
  headingLevel = 3,
  className,
  ...rest
}, ref) {
  const Heading = headingTag(headingLevel, 'h3')
  const maxWait = thresholdSeconds * criticalWaitFactor
  const waitTooLong = longestWait > maxWait
  const noAgents = waiting > 0 && agentsAvailable === 0
  const critical = waitTooLong || noAgents
  const reason = noAgents ? 'Sin agentes libres con contactos en espera' : waitTooLong ? `Espera sobre ${formatDuration(maxWait)}` : null

  return (
    <article
      {...rest}
      ref={ref}
      className={cx('card', 'gcu-queue', 'gcu-container', critical && 'gcu-queue--critical', className)}
      aria-label={rest['aria-label'] ?? `Cola ${name}`}
    >
      <div className="card-body gcu-queue__body">
        <div className="gcu-queue__head">
          <Heading className="gcu-queue__name" title={name}>{name}</Heading>
          {channel}
        </div>
        {reason && <Severity level="critical" label={`Atiende esta cola: ${reason.toLowerCase()}`} size="sm" />}
        <dl className="gcu-queue__stats">
          <div className="gcu-queue__stat">
            <dt><i className="feather-phone-incoming" aria-hidden="true" />En espera</dt>
            <dd className="gcu-tabular">{waiting}</dd>
          </div>
          <div className={cx('gcu-queue__stat', waitTooLong && 'gcu-queue__stat--bad')}>
            <dt><i className="feather-clock" aria-hidden="true" />Espera máx.</dt>
            <dd className="gcu-tabular">{formatDuration(longestWait)}</dd>
          </div>
          <div className={cx('gcu-queue__stat', agentsAvailable === 0 && 'gcu-queue__stat--bad')}>
            <dt><i className="feather-headphones" aria-hidden="true" />Libres</dt>
            <dd className="gcu-tabular">{agentsAvailable}</dd>
          </div>
        </dl>
        <TargetBar label="Nivel de servicio" value={serviceLevel} target={target} hint={`${target}/${thresholdSeconds}`} />
      </div>
    </article>
  )
})
