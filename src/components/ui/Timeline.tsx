import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { deprecate, log } from '../../utils/log'
import { isArray, isString } from '../../utils/typeGuards'
import type { TimelineItem, TimelineProps } from '../../public/types'
import { EventTime } from './internal/EventTime'
import { resolveTone } from './internal/tones'

function hasContent(value: unknown): boolean {
  if (value === null || value === undefined || value === false || value === true) return false
  if (isString(value)) return value.trim() !== ''
  return true
}

function safeString(value: unknown, fallback: string): string {
  try {
    const result = String(value)
    return result || fallback
  } catch {
    return fallback
  }
}

function safeToken(value: unknown, fallback: string): string {
  let token = safeString(value, fallback)
  try {
    token = token.normalize('NFKD')
  } catch {
    // Se conserva el texto si un valor exótico no se puede normalizar.
  }
  token = token
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return token || fallback
}

function itemIdentity(item: TimelineItem | null | undefined, index: number): string | null {
  const id = item?.id
  const hasId = id !== undefined && id !== null && safeString(id, '').trim() !== ''
  return hasId ? safeString(id, `item-${index}`) : null
}

function buildKeys(items: ReadonlyArray<TimelineItem>): string[] {
  const seen = new Map<string, number>()
  return items.map((item, index) => {
    const identity = itemIdentity(item, index)
    if (identity === null) {
      log.warn(`Timeline: el ítem ${index} no tiene id; se usa una clave determinista de respaldo.`)
    }
    const base = safeToken(identity ?? `missing-${index}`, `item-${index}`)
    const occurrence = seen.get(base) ?? 0
    if (occurrence > 0) log.warn(`Timeline: la identidad "${identity}" está repetida; se agrega un sufijo a la clave.`)
    seen.set(base, occurrence + 1)
    return `timeline-${base}-${occurrence}`
  })
}

/**
 * Timeline — línea de tiempo de actividad.
 *
 * items: [{ id, title, description, date | time, icon, variant (alias legado: color), user: { name, avatar } }]
 * - date: Date | ISO | epoch → «hace 5 minutos», con la fecha completa (dd-mm-aaaa HH:mm) en `title`.
 * - time: texto libre legado (se respeta tal cual).
 * - variant: tono del marcador con tokens suaves. `iconBg` (clase) está deprecado.
 * - now: instante de referencia para el tiempo relativo (tests, capturas).
 * En contenedores angostos la hora pasa bajo el título (container query).
 */
export const Timeline = forwardRef<HTMLUListElement, TimelineProps>(function Timeline(
  { items = [], className = '', now, 'aria-label': ariaLabel = undefined },
  ref,
) {
  const list: ReadonlyArray<TimelineItem> = isArray(items) ? items : []
  const keys = buildKeys(list)

  return (
    <ul ref={ref} className={cx('gcu-timeline', 'list-unstyled', 'mb-0', className)} aria-label={ariaLabel}>
      {list.map((item, i) => {
        const { tone } = resolveTone(item?.variant ?? item?.color ?? 'primary', 'Timeline')
        if (item?.iconBg) deprecate('timeline-iconBg', 'el campo `iconBg` de Timeline; usa `variant`.')
        return (
          <li key={keys[i]} className="gcu-timeline__item">
            <div className={cx('gcu-timeline__marker', `gcu-timeline__marker--${tone}`, item?.iconBg)}>
              <i className={item?.icon || 'feather-activity'} aria-hidden="true"></i>
            </div>
            <div className="gcu-timeline__body">
              <div className="gcu-timeline__main">
                {hasContent(item?.title) && <p className="gcu-timeline__title">{item.title}</p>}
                {hasContent(item?.description) && <p className="gcu-timeline__description">{item.description}</p>}
                {item?.user && (
                  <div className="gcu-timeline__user">
                    {item.user.avatar && (
                      <div className="avatar-image avatar-xs gcu-avatar gcu-avatar--image">
                        <img src={item.user.avatar} alt="" className="img-fluid rounded-circle" />
                      </div>
                    )}
                    {hasContent(item.user.name) && <span>{item.user.name}</span>}
                  </div>
                )}
              </div>
              <EventTime
                className="gcu-timeline__time"
                date={item?.date}
                now={now}
                fallback={item?.time}
                dateTime={item?.dateTime}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
})
