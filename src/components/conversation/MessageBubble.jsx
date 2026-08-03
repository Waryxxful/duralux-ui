import React from 'react'
import { cx } from '../../utils/cx'

/**
 * MessageBubble — portable chat/transcript bubble.
 *
 * Uses gcu-message-* classes (token-driven via grancrm-ui CSS) instead of raw
 * Bootstrap bg-light/bg-primary, which lose contrast under light and dark hosts.
 *
 * variant: "incoming" | "outgoing" | "system"
 */
export function MessageBubble({
  variant,
  children,
  header,
  meta,
  highlighted,
  bubbleRef,
  className,
  'data-raw': dataRaw,
}) {
  if (variant === 'system') {
    return (
      <div className={cx('gcu-message-row', className)}>
        <div className="gcu-message-system">{children}</div>
      </div>
    )
  }

  const side = variant === 'outgoing' ? 'outgoing' : 'incoming'
  const bubbleClass = [
    'gcu-message-bubble',
    `gcu-message-bubble--${side}`,
    highlighted ? 'gcu-message-bubble--highlighted' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`gcu-message-row gcu-message-row--${side}`}>
      <div ref={bubbleRef} className={bubbleClass} data-raw={dataRaw}>
        {header ? <div className="gcu-message-bubble__header">{header}</div> : null}
        {children}
        {meta ? <div className="gcu-message-bubble__meta">{meta}</div> : null}
      </div>
    </div>
  )
}
