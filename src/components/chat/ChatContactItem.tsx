import type * as React from 'react'
import { cx } from '../../utils/cx'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import type { ChatContact } from '../../public/types'
import type { NormalizedContact } from './chatModel'

/* Piezas internas de ChatSidebar: una conversación de la lista y su skeleton de carga. */

const SKELETON_ROWS = [0, 1, 2, 3]

interface ContactVisualProps {
  contact: NormalizedContact
  description: string
  descriptionId: string
  nameId: string
}

function ContactVisual({ contact, description, descriptionId, nameId }: ContactVisualProps) {
  return (
    <>
      <span className="gcu-chat-contact__avatar">
        <Avatar src={contact.hasAvatar ? contact.avatar : null} name={contact.name} size="md" />
        {contact.online ? <span className="gcu-chat-presence" aria-hidden="true" /> : null}
      </span>
      <span className="gcu-chat-contact__body">
        <span className="gcu-chat-contact__row">
          <span id={nameId} className="gcu-chat-contact__name" title={contact.name}>{contact.name}</span>
          {contact.time ? <span className="gcu-chat-contact__time">{contact.time}</span> : null}
        </span>
        <span className="gcu-chat-contact__row">
          <span className="gcu-chat-contact__preview" title={contact.preview || undefined}>{contact.preview}</span>
          {contact.unread > 0 ? (
            <Badge pill className="gcu-chat-contact__unread" aria-hidden="true">
              {contact.unread > 99 ? '99+' : contact.unread}
            </Badge>
          ) : null}
        </span>
      </span>
      {description ? (
        <span id={descriptionId} className="visually-hidden">{description}</span>
      ) : null}
    </>
  )
}

export function ContactSkeleton() {
  return (
    <ul className="gcu-chat-contacts" aria-hidden="true">
      {SKELETON_ROWS.map((row) => (
        <li key={row} className="gcu-chat-contact gcu-chat-contact--skeleton">
          <span className="gcu-skeleton gcu-chat-contact__skeleton-avatar" />
          <span className="gcu-chat-contact__body">
            <span className="gcu-skeleton gcu-chat-contact__skeleton-line" />
            <span className="gcu-skeleton gcu-chat-contact__skeleton-line gcu-chat-contact__skeleton-line--short" />
          </span>
        </li>
      ))}
    </ul>
  )
}

export interface ContactItemLabels {
  unread: string
  online: string
  offline: string
  selected: string
}

interface ContactItemProps {
  contact: NormalizedContact<ChatContact>
  index: number
  selectable: boolean
  selected: boolean
  tabbable: boolean
  idPrefix: string
  labels: ContactItemLabels
  registerItem: (key: string | number, element: HTMLButtonElement | null) => void
  onSelect: (contact: NormalizedContact<ChatContact>) => void
  onItemFocus: (contact: NormalizedContact<ChatContact>, event: React.FocusEvent<HTMLButtonElement>) => void
  onItemKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => void
}

/** Una conversación: `option` seleccionable (botón dentro del li) o grupo de solo lectura. */
export function ContactItem({
  contact,
  index,
  selectable,
  selected,
  tabbable,
  idPrefix,
  labels,
  registerItem,
  onSelect,
  onItemFocus,
  onItemKeyDown,
}: ContactItemProps) {
  const descriptionId = `${idPrefix}-desc-${contact.key}`
  const nameId = `${idPrefix}-name-${contact.key}`
  const description = [
    contact.preview,
    contact.time,
    contact.unread > 0 ? `${contact.unread} ${labels.unread}` : null,
    contact.online ? labels.online : labels.offline,
    selected ? labels.selected : null,
  ].filter(Boolean).join(', ')
  const className = cx(
    'gcu-chat-contact',
    selected && 'gcu-chat-contact--selected',
    contact.unread > 0 && 'gcu-chat-contact--unread',
  )
  const visual = <ContactVisual contact={contact} description={description} descriptionId={descriptionId} nameId={nameId} />

  return (
    <li className="gcu-chat-contacts__item" role={selectable ? 'presentation' : undefined}>
      {selectable ? (
        <button
          ref={(node) => registerItem(contact.key, node)}
          type="button"
          role="option"
          tabIndex={tabbable ? 0 : -1}
          className={className}
          aria-selected={selected}
          aria-current={selected ? 'true' : undefined}
          aria-labelledby={nameId}
          aria-describedby={descriptionId}
          onClick={() => onSelect(contact)}
          onFocus={(event) => onItemFocus(contact, event)}
          onKeyDown={(event) => onItemKeyDown(event, index)}
        >
          {visual}
        </button>
      ) : (
        <div
          role="group"
          className={cx(className, 'gcu-chat-contact--view')}
          aria-labelledby={nameId}
          aria-describedby={descriptionId}
        >
          {visual}
        </div>
      )}
    </li>
  )
}
