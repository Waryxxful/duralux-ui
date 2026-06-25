import React from 'react'

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
      <div className={`d-flex justify-content-center mb-2 ${className || ''}`.trim()}>
        <div className="bg-secondary-subtle text-muted small text-center rounded p-2">
          {children}
        </div>
      </div>
    )
  }

  const isOutgoing = variant === 'outgoing'
  const justifyContent = isOutgoing ? 'justify-content-end' : 'justify-content-start'

  const bubbleClasses = [
    'rounded',
    'p-2',
    isOutgoing ? 'bg-primary text-white' : 'bg-light',
    highlighted ? 'border border-warning' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`d-flex ${justifyContent} mb-2`}>
      <div ref={bubbleRef} className={bubbleClasses} data-raw={dataRaw}>
        {header && <div className="fw-bold small mb-1">{header}</div>}
        {children}
        {meta && <div className="small text-muted mt-1">{meta}</div>}
      </div>
    </div>
  )
}
