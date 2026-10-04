import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { isArray, isString } from '../../utils/typeGuards'
import type { ActivityFeedProps } from '../../public/types'
import { EventTime } from './internal/EventTime'
import { resolveTone } from './internal/tones'

export type { ActivityFeedItem, ActivityFeedProps, ActivityFeedVariant } from '../../public/types'

/**
 * ActivityFeed — feed de eventos con riel y punto de color por tipo de evento.
 *
 * - items: [{ key, variant, title, description, date | time, extra }]
 * - date: «hace 5 minutos» con la fecha completa (dd-mm-aaaa HH:mm) en `title`; `time` es texto legado.
 * - now: instante de referencia del tiempo relativo (tests, capturas).
 * Tokens por tema (sin overrides oscuros); en contenedores angostos la hora pasa bajo el título.
 */
export const ActivityFeed = forwardRef<HTMLUListElement, ActivityFeedProps>(function ActivityFeed(
  { items, className, now },
  ref,
) {
  const list = isArray(items) ? items : []
  return (
    <ul ref={ref} className={cx('gcu-activity-feed', 'list-unstyled', 'mb-0', className)}>
      {list.map((item) => {
        const { tone } = resolveTone(item.variant, 'ActivityFeed')
        return (
          <li key={item.key} className={cx('gcu-activity-feed__item', `gcu-activity-feed__item--${tone}`)}>
            <div className="gcu-activity-feed__body">
              <div className="gcu-activity-feed__main">
                <div className="gcu-activity-feed__title" title={isString(item.title) ? item.title : undefined}>{item.title}</div>
                {item.description != null && <p className="gcu-activity-feed__description">{item.description}</p>}
                {item.extra}
              </div>
              <EventTime className="gcu-activity-feed__time" date={item.date} now={now} fallback={item.time} />
            </div>
          </li>
        )
      })}
    </ul>
  )
})
