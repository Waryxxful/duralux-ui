import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isFunction } from '../../utils/typeGuards'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../feedback/EmptyState'
import type { ChatWindowContact, ChatWindowProps } from '../../public/types'
import {
  customLabel,
  normalizeContact,
  resolveChatSlots,
  resolveLabel,
} from './chatModel'

const SKELETON_MESSAGES = ['incoming', 'outgoing', 'incoming'] as const

interface HeaderActionProps {
  icon: string
  label: string
  onClick: () => void
  className?: string
}

function HeaderAction({ icon, label, onClick, className }: HeaderActionProps) {
  return (
    <button
      type="button"
      className={cx('chat-window__action', 'gcu-chat-window__action', className)}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <i className={icon} aria-hidden="true"></i>
    </button>
  )
}

/**
 * ChatWindow — área principal del chat: encabezado del contacto, historial y compositor.
 *
 * - `messages` y `composer` son los slots preferidos. La forma legada `children={[...mensajes, composer]}`
 *   se mantiene cuando no se pasan slots; `legacyChildren={false}` evita que el último mensaje se tome por compositor.
 * - El historial es un `role="log"` con `aria-live="polite"`: los mensajes nuevos se anuncian sin interrumpir.
 * - onPhone / onVideo / onMenu: acciones del encabezado; no se pintan sin callback.
 * - onBack: botón «Volver a las conversaciones», visible cuando el contenedor `.gcu-chat` pasa a una columna.
 * - loading: skeleton de mensajes y `aria-busy`. Sin `contact`: EmptyState en `.chat-window-empty`.
 */
const ChatWindowBase = /* @__PURE__ */ forwardRef<HTMLElement, ChatWindowProps<ChatWindowContact>>(function ChatWindow({
  contact,
  children,
  messages,
  composer,
  legacyChildren = true,
  onPhone,
  onVideo,
  onMenu,
  onBack,
  loading = false,
  windowLabel,
  emptyLabel,
  phoneLabel,
  videoLabel,
  menuLabel,
  messagesLabel,
  onlineLabel,
  offlineLabel,
  labels = undefined,
  className,
}, ref) {
  const resolvedWindowLabel = resolveLabel(labels, windowLabel, 'window')
  const resolvedEmptyLabel = resolveLabel(labels, emptyLabel, 'empty')
  const resolvedPhoneLabel = resolveLabel(labels, phoneLabel, 'phone')
  const resolvedVideoLabel = resolveLabel(labels, videoLabel, 'video')
  const resolvedMenuLabel = resolveLabel(labels, menuLabel, 'menu')
  const resolvedMessagesLabel = resolveLabel(labels, messagesLabel, 'messages')
  const resolvedOnlineLabel = resolveLabel(labels, onlineLabel, 'online')
  const resolvedOfflineLabel = resolveLabel(labels, offlineLabel, 'offline')
  const resolvedBackLabel = resolveLabel(labels, undefined, 'back')
  const resolvedLoadingLabel = customLabel(labels, 'loading') ?? 'Cargando mensajes'

  if (!contact) {
    return (
      <section
        ref={ref}
        className={cx('chat-window-empty', 'gcu-chat-window', 'gcu-chat-window--empty', className)}
        aria-label={resolvedWindowLabel}
      >
        <EmptyState
          icon="message-circle"
          title={resolvedEmptyLabel}
          message="Elige una conversación de la lista para ver sus mensajes."
        />
      </section>
    )
  }

  const normalizedContact = normalizeContact(contact)
  const resolvedSlots = resolveChatSlots(children, messages, composer, legacyChildren !== false)
  const canPhone = isFunction(onPhone)
  const canVideo = isFunction(onVideo)
  const canMenu = isFunction(onMenu)
  const hasHeaderActions = canPhone || canVideo || canMenu

  return (
    <section
      ref={ref}
      className={cx('chat-window', 'gcu-chat-window', className)}
      aria-label={`${resolvedWindowLabel}: ${normalizedContact.name}`}
    >
      <div className="gcu-chat-window__header">
        {isFunction(onBack) ? (
          <HeaderAction
            icon="feather-chevron-left"
            label={resolvedBackLabel}
            onClick={() => onBack()}
            className="gcu-chat-window__back"
          />
        ) : null}
        <span className="gcu-chat-window__avatar">
          <Avatar src={normalizedContact.hasAvatar ? normalizedContact.avatar : null} name={normalizedContact.name} size="md" />
          {normalizedContact.online ? <span className="gcu-chat-presence" aria-hidden="true" /> : null}
        </span>
        <div className="gcu-chat-window__identity">
          <div className="gcu-chat-window__name" title={normalizedContact.name}>{normalizedContact.name}</div>
          <div className="gcu-chat-window__status">
            {normalizedContact.online ? (
              <span className="chat-online-status">{resolvedOnlineLabel}</span>
            ) : (
              normalizedContact.role || resolvedOfflineLabel
            )}
          </div>
        </div>
        {hasHeaderActions ? (
          <div className="chat-window__actions gcu-chat-window__actions">
            {canPhone ? <HeaderAction icon="feather-phone" label={resolvedPhoneLabel} onClick={() => onPhone(contact)} /> : null}
            {canVideo ? <HeaderAction icon="feather-video" label={resolvedVideoLabel} onClick={() => onVideo(contact)} /> : null}
            {canMenu ? <HeaderAction icon="feather-more-vertical" label={resolvedMenuLabel} onClick={() => onMenu(contact)} /> : null}
          </div>
        ) : null}
      </div>

      <div className="chat-window__body gcu-chat-window__body">
        <div
          className="chat-window__messages gcu-chat-window__messages"
          role="log"
          aria-label={resolvedMessagesLabel}
          aria-live="polite"
          aria-relevant="additions"
          aria-atomic="false"
          aria-busy={loading || undefined}
          // El historial desplaza: con tabIndex se recorre con teclado (flechas, Re Pág/Av Pág).
          tabIndex={0}
        >
          {loading ? (
            <div className="gcu-chat-window__skeleton" aria-hidden="true">
              {SKELETON_MESSAGES.map((side, index) => (
                <span key={index} className={cx('gcu-skeleton', 'gcu-chat-window__skeleton-bubble', `gcu-chat-window__skeleton-bubble--${side}`)} />
              ))}
            </div>
          ) : resolvedSlots.messages}
        </div>
        {loading ? (
          <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{resolvedLoadingLabel}</span>
        ) : null}
        {resolvedSlots.composer}
      </div>
    </section>
  )
})

type ChatWindowComponent = (<TContact extends ChatWindowContact = ChatWindowContact>(
  props: ChatWindowProps<TContact> & React.RefAttributes<HTMLElement>,
) => React.ReactElement | null) & { displayName?: string }

export const ChatWindow =
  // SAFETY: forwardRef borra el genérico TContact; el contacto se devuelve tal cual en los callbacks del encabezado.
  ChatWindowBase as ChatWindowComponent
