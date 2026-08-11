import { Children, isValidElement } from 'react'
import { PLACEHOLDER_AVATAR } from '../../assets/placeholders'

const DEFAULT_LABELS = {
  window: 'Ventana de chat',
  empty: 'Selecciona una conversación',
  phone: 'Llamar',
  video: 'Videollamada',
  menu: 'Más opciones',
  messages: 'Mensajes',
  online: 'En línea',
  offline: 'Fuera de línea',
}

function isCallable(value) {
  return typeof value === 'function'
}

function isArray(value) {
  try {
    return Array.isArray(value)
  } catch {
    return false
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !isArray(value)
}

function readProperty(value, key) {
  if (value === null || value === undefined) return undefined

  try {
    return value[key]
  } catch {
    return undefined
  }
}

function normalizeDisplayText(value, fallback = '') {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

function normalizeLabelText(value, fallback) {
  const text = normalizeDisplayText(value).trim()
  return text || fallback
}

function normalizeImageSource(value) {
  const source = normalizeDisplayText(value).trim()
  return source || PLACEHOLDER_AVATAR
}

function resolveLabel(labels, propLabel, key) {
  const label = labels && typeof labels === 'object' ? readProperty(labels, key) : undefined
  const candidate = label ?? propLabel

  if (typeof candidate === 'string' || typeof candidate === 'number') {
    const normalized = String(candidate).trim()
    if (normalized) return normalized
  }

  return DEFAULT_LABELS[key]
}

function normalizeContact(contact) {
  const source = isRecord(contact) ? contact : {}

  return {
    name: normalizeLabelText(readProperty(source, 'name'), 'Contacto'),
    avatar: normalizeImageSource(readProperty(source, 'avatar')),
    online: readProperty(source, 'online') === true,
    role: normalizeLabelText(readProperty(source, 'role'), ''),
  }
}

function isRenderableNode(value) {
  if (value === null || value === undefined || typeof value === 'boolean') return true
  if (typeof value === 'string' || typeof value === 'number') return true
  if (isArray(value)) {
    try {
      return value.every(isRenderableNode)
    } catch {
      return false
    }
  }

  try {
    return isValidElement(value)
  } catch {
    return false
  }
}

function normalizeSlot(value) {
  if (isArray(value)) {
    let safeChildren
    try {
      safeChildren = value.filter(isRenderableNode)
    } catch {
      safeChildren = []
    }

    try {
      return Children.toArray(safeChildren)
    } catch {
      return []
    }
  }

  return isRenderableNode(value) ? value : null
}

function normalizeLegacyChildren(children) {
  try {
    return Children.toArray(children).filter(isRenderableNode)
  } catch {
    return []
  }
}

/**
 * Legacy children are interpreted only when neither explicit slot is passed
 * and `legacyChildren` is enabled: a sequence of two or more children uses
 * the last child as `composer`; a single child remains a message. Explicit
 * `messages`/`composer` slots are unambiguous, and `legacyChildren={false}`
 * treats every child as a message with no composer.
 */
function resolveChatSlots(children, messages, composer, legacyChildren) {
  const hasMessagesSlot = messages !== undefined
  const hasComposerSlot = composer !== undefined

  if (hasMessagesSlot || hasComposerSlot) {
    return {
      messages: hasMessagesSlot ? normalizeSlot(messages) : null,
      composer: hasComposerSlot ? normalizeSlot(composer) : null,
    }
  }

  if (!legacyChildren) {
    return { messages: normalizeSlot(children), composer: null }
  }

  const legacyChildNodes = normalizeLegacyChildren(children)
  if (legacyChildNodes.length > 1) {
    return {
      messages: normalizeSlot(legacyChildNodes.slice(0, -1)),
      composer: normalizeSlot(legacyChildNodes[legacyChildNodes.length - 1]),
    }
  }

  return { messages: normalizeSlot(legacyChildNodes), composer: null }
}

/**
 * ChatWindow — área principal de chat (header + mensajes + composer).
 *
 * `messages` y `composer` son los slots preferidos. La forma legacy
 * `children={[...mensajes, composer]}` se mantiene por compatibilidad cuando
 * no se pasan slots explícitos. Use `legacyChildren={false}` o los slots para
 * que dos mensajes nunca se interpreten como compositor.
 */
export function ChatWindow({
  contact,
  children,
  messages,
  composer,
  legacyChildren = true,
  onPhone,
  onVideo,
  onMenu,
  windowLabel,
  emptyLabel,
  phoneLabel,
  videoLabel,
  menuLabel,
  messagesLabel,
  onlineLabel,
  offlineLabel,
  labels = undefined,
}) {
  const resolvedWindowLabel = resolveLabel(labels, windowLabel, 'window')
  const resolvedEmptyLabel = resolveLabel(labels, emptyLabel, 'empty')
  const resolvedPhoneLabel = resolveLabel(labels, phoneLabel, 'phone')
  const resolvedVideoLabel = resolveLabel(labels, videoLabel, 'video')
  const resolvedMenuLabel = resolveLabel(labels, menuLabel, 'menu')
  const resolvedMessagesLabel = resolveLabel(labels, messagesLabel, 'messages')
  const resolvedOnlineLabel = resolveLabel(labels, onlineLabel, 'online')
  const resolvedOfflineLabel = resolveLabel(labels, offlineLabel, 'offline')

  if (!contact) {
    return (
      <section className="chat-window-empty flex-grow-1 d-flex align-items-center justify-content-center" aria-label={resolvedWindowLabel}>
        <div className="text-center text-muted">
          <i className="chat-window-empty__icon feather-message-circle" aria-hidden="true"></i>
          <p className="mt-3 fs-14 mb-0">{resolvedEmptyLabel}</p>
        </div>
      </section>
    )
  }

  const normalizedContact = normalizeContact(contact)
  const resolvedSlots = resolveChatSlots(children, messages, composer, legacyChildren !== false)
  const canPhone = isCallable(onPhone)
  const canVideo = isCallable(onVideo)
  const canMenu = isCallable(onMenu)
  const hasHeaderActions = canPhone || canVideo || canMenu

  return (
    <section className="chat-window flex-grow-1 d-flex flex-column" aria-label={`${resolvedWindowLabel}: ${normalizedContact.name}`}>
      <div className="border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <div className="avatar-image avatar-md">
              <img
                src={normalizedContact.avatar}
                alt=""
                className="img-fluid rounded-circle"
              />
            </div>
            {normalizedContact.online ? (
              <span className="position-absolute bottom-0 end-0 wd-10 ht-10 bg-success rounded-circle border border-2 border-white" aria-hidden="true"></span>
            ) : null}
          </div>
          <div>
            <div className="fw-semibold fs-14">{normalizedContact.name}</div>
            <div className="fs-11 text-muted">
              {normalizedContact.online ? (
                <span className="chat-online-status">{resolvedOnlineLabel}</span>
              ) : (
                normalizedContact.role || resolvedOfflineLabel
              )}
            </div>
          </div>
        </div>
        {hasHeaderActions ? (
          <div className="chat-window__actions d-flex align-items-center gap-2">
            {canPhone ? (
              <button
                type="button"
                className="chat-window__action avatar-text avatar-sm bg-transparent border-0 text-muted"
                aria-label={resolvedPhoneLabel}
                title={resolvedPhoneLabel}
                onClick={() => onPhone(contact)}
              >
                <i className="feather-phone" aria-hidden="true"></i>
              </button>
            ) : null}
            {canVideo ? (
              <button
                type="button"
                className="chat-window__action avatar-text avatar-sm bg-transparent border-0 text-muted"
                aria-label={resolvedVideoLabel}
                title={resolvedVideoLabel}
                onClick={() => onVideo(contact)}
              >
                <i className="feather-video" aria-hidden="true"></i>
              </button>
            ) : null}
            {canMenu ? (
              <button
                type="button"
                className="chat-window__action avatar-text avatar-sm bg-transparent border-0 text-muted"
                aria-label={resolvedMenuLabel}
                title={resolvedMenuLabel}
                onClick={() => onMenu(contact)}
              >
                <i className="feather-more-vertical" aria-hidden="true"></i>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="chat-window__body flex-grow-1 d-flex flex-column">
        <div
          className="chat-window__messages p-4"
          role="log"
          aria-label={resolvedMessagesLabel}
          aria-live="polite"
          aria-relevant="additions"
          aria-atomic="false"
        >
          {resolvedSlots.messages}
        </div>
        {resolvedSlots.composer}
      </div>
    </section>
  )
}
