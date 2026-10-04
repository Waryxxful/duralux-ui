import type * as React from 'react'
import { cx } from '../../../utils/cx'
import { formatDateTime, formatRelative, toDate } from '../../../utils/format'
import { log } from '../../../utils/log'

export interface EventTimeProps {
  /** Fecha del evento: tiempo relativo visible y fecha completa (dd-mm-aaaa HH:mm) en `title`. */
  date?: Date | string | number | null
  /** Instante de referencia (determinismo en tests y capturas); por defecto, ahora. */
  now?: Date
  /** Texto legado cuando no hay `date`. */
  fallback?: React.ReactNode
  /** `dateTime` explícito para el texto legado. */
  dateTime?: string
  className?: string
}

/** Hora de un evento de Timeline/ActivityFeed en `<time>`, cifras tabulares. */
export function EventTime({ date, now, fallback, dateTime, className }: EventTimeProps) {
  const parsed = toDate(date)
  if (date !== undefined && date !== null && !parsed) {
    log.warn(`Fecha de evento inválida: "${String(date)}"; se muestra el texto alternativo.`)
  }
  if (parsed) {
    return (
      <time className={cx('gcu-event-time', className)} dateTime={parsed.toISOString()} title={formatDateTime(parsed)}>
        {formatRelative(parsed, now)}
      </time>
    )
  }
  if (fallback === null || fallback === undefined || fallback === false || fallback === '') return null
  return <time className={cx('gcu-event-time', className)} dateTime={dateTime || undefined}>{fallback}</time>
}
