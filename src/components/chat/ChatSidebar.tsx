import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isFunction } from '../../utils/typeGuards'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../feedback/EmptyState'
import type { ChatContact, ChatSidebarProps } from '../../public/types'
import {
  customLabel,
  normalizeContacts,
  normalizeSearchText,
  resolveLabel,
} from './chatModel'
import type { NormalizedContact } from './chatModel'

const EMPTY_CONTACTS: ReadonlyArray<ChatContact> = []
const SKELETON_ROWS = [0, 1, 2, 3]

function filterContacts<T>(contacts: NormalizedContact<T>[], query: string): NormalizedContact<T>[] {
  const normalizedQuery = normalizeSearchText(query).trim()
  if (!normalizedQuery) return contacts

  return contacts.filter((contact) => (
    normalizeSearchText(contact.name).includes(normalizedQuery)
    || normalizeSearchText(contact.preview).includes(normalizedQuery)
  ))
}

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
        <Avatar src={contact.avatar} name={contact.name} size="md" />
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

/**
 * ChatSidebar — lista de conversaciones con búsqueda, no leídos y selección con teclado.
 *
 * - Con `onSelect` la lista es un `listbox`: cada conversación es un `option` (botón nativo dentro de un `li`)
 *   con tabindex itinerante; ↑/↓/Inicio/Fin mueven el foco, Enter o Espacio seleccionan.
 *   Sin `onSelect` es una lista de solo lectura, sin controles que parezcan accionables.
 * - `selectedId` mantiene la API controlada; si se omite, la selección es local.
 * - El filtrado local por nombre y vista previa siempre está activo; `onSearch` solo sincroniza una búsqueda externa.
 * - Vacío y sin resultados con EmptyState; `loading` pinta filas skeleton con `aria-busy`.
 */
const ChatSidebarBase = /* @__PURE__ */ forwardRef<HTMLElement, ChatSidebarProps<ChatContact>>(function ChatSidebar({
  contacts,
  selectedId,
  onSelect,
  onSearch,
  onEdit,
  sidebarLabel,
  searchLabel,
  searchPlaceholder,
  editLabel,
  listLabel,
  onlineLabel,
  unreadLabel,
  selectedLabel,
  labels = undefined,
  loading = false,
  className,
}, ref) {
  const normalizedContacts = useMemo(
    () => normalizeContacts(contacts ?? EMPTY_CONTACTS),
    [contacts],
  )
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState<string | number | undefined>(undefined)
  const [announcement, setAnnouncement] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [rovingKey, setRovingKey] = useState<string | number | null>(null)
  const itemRefs = useRef(new Map<string | number, HTMLButtonElement>())
  const focusedContactRef = useRef<{ key: string | number; element: HTMLElement } | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const descriptionPrefix = useId()
  const listId = useId()
  const canSelect = isFunction(onSelect)
  const canEdit = isFunction(onEdit)
  const isControlled = selectedId !== undefined
  const activeSelectedId = isControlled ? selectedId : uncontrolledSelectedId
  const resolvedSidebarLabel = resolveLabel(labels, sidebarLabel, 'sidebar')
  const resolvedSearchLabel = resolveLabel(labels, searchLabel, 'search')
  const resolvedSearchPlaceholder = resolveLabel(labels, searchPlaceholder, 'searchPlaceholder')
  const resolvedEditLabel = resolveLabel(labels, editLabel, 'edit')
  const resolvedListLabel = resolveLabel(labels, listLabel, 'list')
  const resolvedOnlineLabel = resolveLabel(labels, onlineLabel, 'online')
  const resolvedOfflineLabel = resolveLabel(labels, undefined, 'offline')
  const resolvedUnreadLabel = resolveLabel(labels, unreadLabel, 'unread')
  const resolvedSelectedLabel = resolveLabel(labels, selectedLabel, 'selected')
  const resolvedNoResultsLabel = resolveLabel(labels, undefined, 'noResults')
  const resolvedResultsLabel = resolveLabel(labels, undefined, 'results')
  // Compatibilidad: antes `noResults` cubría también la lista vacía; si la app lo personalizó, se respeta.
  const resolvedEmptyListLabel = customLabel(labels, 'emptyList') ?? customLabel(labels, 'noResults') ?? resolveLabel(labels, undefined, 'emptyList')
  const resolvedLoadingLabel = customLabel(labels, 'loading') ?? 'Cargando conversaciones'

  const filteredContacts = useMemo(
    () => filterContacts(normalizedContacts, searchQuery),
    [normalizedContacts, searchQuery],
  )

  // DX-017: el contacto tabulable se deriva en render (enfocado → seleccionado → itinerante visible → primero);
  // ningún efecto ajusta estado después de que cambian las props.
  const selectedIndex = filteredContacts.findIndex((contact) => contact.id === activeSelectedId)
  const selectedContact = selectedIndex >= 0 ? filteredContacts[selectedIndex] : null
  const focusedContact = focusedContactRef.current
  const focusIsTracked = Boolean(
    globalThis.document
    && focusedContact?.element
    && document.activeElement === focusedContact.element,
  )
  const focusedKeyIsVisible = focusIsTracked
    && filteredContacts.some((contact) => contact.key === focusedContact.key)
  const rovingKeyIsVisible = filteredContacts.some((contact) => contact.key === rovingKey)
  const tabbableKey = focusedKeyIsVisible
    ? focusedContact.key
    : (selectedContact?.key ?? (rovingKeyIsVisible ? rovingKey : filteredContacts[0]?.key))

  // Si el contacto enfocado desaparece (filtro o props), el foco pasa al seleccionado, al primero o a la búsqueda.
  // Solo mueve el foco del DOM; el estado itinerante lo actualiza el evento focus del nuevo elemento.
  useEffect(() => {
    const currentFocus = focusedContactRef.current
    if (!currentFocus || !currentFocus.element) return
    if (filteredContacts.some((contact) => contact.key === currentFocus.key)) return
    if (!focusIsTracked && (!globalThis.document || document.activeElement !== currentFocus.element)) return

    const fallback = selectedContact || filteredContacts[0]
    if (fallback) {
      itemRefs.current.get(fallback.key)?.focus()
    } else {
      focusedContactRef.current = null
      searchRef.current?.focus()
    }
  }, [filteredContacts, selectedContact, focusIsTracked])

  function registerItem(key: string | number, element: HTMLButtonElement | null) {
    if (element) {
      itemRefs.current.set(key, element)
    } else {
      itemRefs.current.delete(key)
    }
  }

  function handleItemFocus(contact: NormalizedContact, event: React.FocusEvent<HTMLButtonElement>) {
    focusedContactRef.current = { key: contact.key, element: event.currentTarget }
    setRovingKey(contact.key)
  }

  function selectContact(contact: NormalizedContact<ChatContact>) {
    if (!canSelect) return

    if (!isControlled) setUncontrolledSelectedId(contact.id)
    setRovingKey(contact.key)
    setAnnouncement(`${resolvedSelectedLabel}: ${contact.name}`)
    onSelect(contact.raw)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    if (!canSelect || !filteredContacts.length) return

    let nextIndex: number | null = null

    if (event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % filteredContacts.length
    } else if (event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + filteredContacts.length) % filteredContacts.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = filteredContacts.length - 1
    }

    if (nextIndex === null) return

    event.preventDefault()
    const targetContact = filteredContacts[nextIndex]
    if (!targetContact) return

    setRovingKey(targetContact.key)
    itemRefs.current.get(targetContact.key)?.focus()
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const query = event.target.value
    setSearchQuery(query)

    if (isFunction(onSearch)) onSearch(query)

    const nextCount = filterContacts(normalizedContacts, query).length
    setAnnouncement(nextCount === 0 ? resolvedNoResultsLabel : `${nextCount} ${resolvedResultsLabel}`)
  }

  const hasQuery = normalizeSearchText(searchQuery).trim() !== ''

  function renderBody() {
    if (loading) {
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

    if (filteredContacts.length === 0) {
      return hasQuery ? (
        <EmptyState
          compact
          icon="search"
          title={resolvedNoResultsLabel}
          message="Prueba con otro nombre o con una palabra del mensaje."
        />
      ) : (
        <EmptyState
          compact
          icon="message-circle"
          title={resolvedEmptyListLabel}
          message="Cuando inicies o recibas una conversación, aparecerá aquí."
        />
      )
    }

    return (
      <ul
        id={listId}
        className="gcu-chat-contacts list-unstyled mb-0"
        role={canSelect ? 'listbox' : undefined}
        aria-label={resolvedListLabel}
      >
        {filteredContacts.map((contact, index) => {
          const isSelected = activeSelectedId !== undefined && contact.id === activeSelectedId
          const itemDescriptionId = `${descriptionPrefix}-desc-${contact.key}`
          const itemNameId = `${descriptionPrefix}-name-${contact.key}`
          const description = [
            contact.preview,
            contact.time,
            contact.unread > 0 ? `${contact.unread} ${resolvedUnreadLabel}` : null,
            contact.online ? resolvedOnlineLabel : resolvedOfflineLabel,
            isSelected ? resolvedSelectedLabel : null,
          ].filter(Boolean).join(', ')
          const itemClassName = cx(
            'gcu-chat-contact',
            isSelected && 'gcu-chat-contact--selected',
            contact.unread > 0 && 'gcu-chat-contact--unread',
          )

          return (
            <li key={contact.key} className="gcu-chat-contacts__item" role={canSelect ? 'presentation' : undefined}>
              {canSelect ? (
                <button
                  ref={(node) => registerItem(contact.key, node)}
                  type="button"
                  role="option"
                  tabIndex={contact.key === tabbableKey ? 0 : -1}
                  className={itemClassName}
                  aria-selected={isSelected}
                  aria-current={isSelected ? 'true' : undefined}
                  aria-labelledby={itemNameId}
                  aria-describedby={itemDescriptionId}
                  onClick={() => selectContact(contact)}
                  onFocus={(event) => handleItemFocus(contact, event)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <ContactVisual
                    contact={contact}
                    description={description}
                    descriptionId={itemDescriptionId}
                    nameId={itemNameId}
                  />
                </button>
              ) : (
                <div
                  role="group"
                  className={cx(itemClassName, 'gcu-chat-contact--view')}
                  aria-labelledby={itemNameId}
                  aria-describedby={itemDescriptionId}
                >
                  <ContactVisual
                    contact={contact}
                    description={description}
                    descriptionId={itemDescriptionId}
                    nameId={itemNameId}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <aside
      ref={ref}
      className={cx('content-sidebar', 'content-sidebar-md', 'gcu-chat-sidebar', className)}
      aria-label={resolvedSidebarLabel}
    >
      <div className="content-sidebar-header gcu-chat-sidebar__header">
        <h4 className="gcu-chat-sidebar__title">{resolvedSidebarLabel}</h4>
        {canEdit ? (
          <button
            type="button"
            className="avatar-text avatar-md gcu-chat-sidebar__action"
            aria-label={resolvedEditLabel}
            title={resolvedEditLabel}
            onClick={() => onEdit()}
          >
            <i className="feather-edit" aria-hidden="true"></i>
          </button>
        ) : null}
      </div>

      <div className="content-sidebar-header gcu-chat-sidebar__search">
        <i className="feather-search gcu-chat-sidebar__search-icon" aria-hidden="true"></i>
        <input
          ref={searchRef}
          type="search"
          name="chat-contact-search"
          autoComplete="off"
          className="form-control gcu-chat-sidebar__search-input"
          placeholder={resolvedSearchPlaceholder}
          aria-label={resolvedSearchLabel}
          aria-controls={filteredContacts.length > 0 && !loading ? listId : undefined}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{resolvedLoadingLabel}</span>
      ) : null}
      {announcement ? (
        <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      ) : null}

      <div className="content-sidebar-body gcu-chat-sidebar__body" aria-busy={loading || undefined}>
        {renderBody()}
      </div>
    </aside>
  )
})

type ChatSidebarComponent = (<TContact extends ChatContact = ChatContact>(
  props: ChatSidebarProps<TContact> & React.RefAttributes<HTMLElement>,
) => React.ReactElement | null) & { displayName?: string }

export const ChatSidebar =
  // SAFETY: forwardRef borra el genérico TContact; la implementación trata el contacto como dato opaco y lo devuelve en onSelect.
  ChatSidebarBase as ChatSidebarComponent
