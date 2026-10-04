import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { ChatDeliveryStatus, MessageBubbleProps } from '../../public/types'

const DELIVERY: Record<ChatDeliveryStatus, { icon: string; label: string }> = {
  sending: { icon: 'feather-clock', label: 'Enviando' },
  sent: { icon: 'feather-check', label: 'Enviado' },
  delivered: { icon: 'feather-check-circle', label: 'Entregado' },
  read: { icon: 'feather-eye', label: 'Leído' },
  failed: { icon: 'feather-alert-circle', label: 'No se envió' },
}

/** Estado de entrega: ícono decorativo + texto (oculto salvo en el error, que siempre se lee). */
export function DeliveryStatusMark({ status }: { status?: ChatDeliveryStatus }) {
  if (!status) return null
  const entry = DELIVERY[status]
  if (!entry) {
    log.warn(`MessageBubble: estado de entrega desconocido "${String(status)}"; se omite.`)
    return null
  }
  const failed = status === 'failed'
  return (
    <span className={cx('gcu-message-status', `gcu-message-status--${status}`)} title={failed ? undefined : entry.label}>
      <i className={entry.icon} aria-hidden="true" />
      <span className={failed ? 'gcu-message-status__text' : 'visually-hidden'}>{entry.label}</span>
    </span>
  )
}

function hasNode(value: React.ReactNode): boolean {
  return value !== null && value !== undefined && value !== false && value !== ''
}

/**
 * MessageBubble — burbuja portable de chat o transcripción, con tokens (sin Bootstrap bg-light/bg-primary).
 *
 * - variant: "incoming" (superficie elevada, izquierda) | "outgoing" (primario con texto AA, derecha) | "system" (discreto, centrado).
 * - header / meta: encabezado y pie libres; `time` y `status` arman la meta con cifras tabulares.
 * - grouped: continuación del mismo autor (menos aire, sin cola).
 * - ref: la fila; `bubbleRef`: la burbuja (scroll a la evidencia en call_reviews).
 */
export const MessageBubble = /* @__PURE__ */ forwardRef<HTMLDivElement, MessageBubbleProps>(function MessageBubble({
  variant,
  children,
  header,
  meta,
  time,
  status,
  grouped = false,
  highlighted,
  bubbleRef,
  className,
  'data-raw': dataRaw,
}, ref) {
  if (variant === 'system') {
    return (
      <div ref={ref} className={cx('gcu-message-row', 'gcu-message-row--system', className)}>
        <div className="gcu-message-system">{children}</div>
      </div>
    )
  }

  const side = variant === 'outgoing' ? 'outgoing' : 'incoming'
  const hasMeta = hasNode(meta) || hasNode(time) || Boolean(status)

  return (
    <div ref={ref} className={cx('gcu-message-row', `gcu-message-row--${side}`, grouped && 'gcu-message-row--grouped')}>
      <div
        ref={bubbleRef}
        className={cx(
          'gcu-message-bubble',
          `gcu-message-bubble--${side}`,
          highlighted && 'gcu-message-bubble--highlighted',
          className,
        )}
        data-raw={dataRaw}
      >
        {hasNode(header) ? <div className="gcu-message-bubble__header">{header}</div> : null}
        {children}
        {hasMeta ? (
          <div className="gcu-message-bubble__meta">
            {meta}
            {hasNode(time) ? <time className="gcu-message-bubble__time">{time}</time> : null}
            <DeliveryStatusMark status={status} />
          </div>
        ) : null}
      </div>
    </div>
  )
})
