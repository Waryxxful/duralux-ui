import { isArray, isString } from '../../utils/typeGuards'

function hasContent(value) {
  if (value === null || value === undefined || value === false || value === true) return false
  if (isString(value)) return value.trim() !== ''
  return true
}

function safeString(value, fallback) {
  try {
    const result = String(value)
    return result || fallback
  } catch {
    return fallback
  }
}

function safeToken(value, fallback) {
  let token = safeString(value, fallback)
  try {
    token = token.normalize('NFKD')
  } catch {
    // Keep the string when an exotic value cannot be normalized.
  }
  token = token
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return token || fallback
}

function isDevelopment() {
  return globalThis.process?.env?.NODE_ENV !== 'production'
}

function itemIdentity(item, index) {
  const id = item?.id
  const hasId = id !== undefined && id !== null && safeString(id, '').trim() !== ''
  return hasId ? safeString(id, `item-${index}`) : null
}

function buildKeys(items) {
  const seen = new Map()
  return items.map((item, index) => {
    const identity = itemIdentity(item, index)
    if (identity === null && isDevelopment()) {
      console.warn(`[duralux/ui] Timeline item at index ${index} is missing an id; using a deterministic fallback key.`)
    }

    const base = safeToken(identity ?? `missing-${index}`, `item-${index}`)
    const occurrence = seen.get(base) ?? 0
    if (occurrence > 0 && isDevelopment()) {
      console.warn(`[duralux/ui] Timeline item identity "${identity}" is duplicated; suffixing its key.`)
    }
    seen.set(base, occurrence + 1)
    return `timeline-${base}-${occurrence}`
  })
}

/**
 * Timeline — línea de tiempo de actividad estilo Duralux.
 *
 * Props:
 *   items — [{
 *     id, title, description, time,
 *     icon, iconBg,
 *     user: { name, avatar }
 *   }]
 */
export function Timeline({ items = [], className = '', 'aria-label': ariaLabel = undefined }) {
  const list = isArray(items) ? items : []
  const keys = buildKeys(list)

  return (
    <ul className={`list-unstyled mb-0${className ? ` ${className}` : ''}`} aria-label={ariaLabel}>
      {list.map((item, i) => (
        <li key={keys[i]} className={`d-flex gap-3${i < list.length - 1 ? ' mb-4' : ''}`}>
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className={`avatar-text avatar-sm rounded-circle ${item?.iconBg || 'bg-soft-primary'} text-${item?.color || 'primary'}`}>
              <i className={item?.icon || 'feather-activity'} aria-hidden="true"></i>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                {hasContent(item?.title) && <p className="fw-semibold fs-13 mb-0">{item.title}</p>}
                {hasContent(item?.description) && (
                  <p className="fs-12 text-muted mb-1">{item.description}</p>
                )}
                {item?.user && (
                  <div className="d-flex align-items-center gap-2 mt-1">
                    {item.user.avatar && (
                      <div className="avatar-image avatar-xs">
                        <img src={item.user.avatar} alt="" className="img-fluid rounded-circle" />
                      </div>
                    )}
                    {hasContent(item.user.name) && <span className="fs-11 text-muted">{item.user.name}</span>}
                  </div>
                )}
              </div>
              {hasContent(item?.time) && (
                <time className="fs-11 text-muted flex-shrink-0 ms-3" dateTime={item.dateTime || undefined}>
                  {item.time}
                </time>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
