import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { PLACEHOLDER_AVATAR } from '../../assets/placeholders'

const EMPTY_CONTACTS = []
const EMPTY_OBJECT = {}
const DIACRITICS_PATTERN = /\p{Diacritic}/gu

const DEFAULT_LABELS = {
  sidebar: 'Chat',
  search: 'Buscar conversaciones',
  searchPlaceholder: 'Buscar conversación...',
  edit: 'Editar conversación',
  list: 'Lista de conversaciones',
  online: 'En línea',
  offline: 'Fuera de línea',
  unread: 'sin leer',
  selected: 'Conversación seleccionada',
  noResults: 'No se encontraron conversaciones',
  results: 'conversaciones encontradas',
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

function normalizeUnread(value) {
  const numericValue = typeof value === 'number'
    ? value
    : (typeof value === 'string' && value.trim() ? Number(value) : 0)

  if (!Number.isFinite(numericValue) || numericValue <= 0) return 0
  return Math.floor(numericValue)
}

function normalizeIdentity(value, index) {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return `chat-contact-${index}`
}

function normalizeContacts(contacts) {
  if (!isArray(contacts)) return []

  let length
  try {
    length = contacts.length
  } catch {
    return []
  }

  const usedIds = new Set()
  const usedKeys = new Set()
  const normalizedContacts = []

  for (let index = 0; index < length; index += 1) {
    const rawContact = readProperty(contacts, index)
    const source = isRecord(rawContact) ? rawContact : EMPTY_OBJECT
    const initialId = normalizeIdentity(readProperty(source, 'id'), index)
    const initialIdKey = String(initialId)
    const id = usedIds.has(initialIdKey) ? `${initialIdKey}-${index}` : initialId
    const baseKey = String(id)
    let key = baseKey

    usedIds.add(initialIdKey)
    usedIds.add(String(id))
    if (usedKeys.has(key)) key = `${baseKey}-${index}`
    usedKeys.add(key)

    normalizedContacts.push({
      raw: rawContact,
      id,
      key,
      name: normalizeLabelText(readProperty(source, 'name'), 'Conversación sin nombre'),
      avatar: normalizeImageSource(readProperty(source, 'avatar')),
      preview: normalizeDisplayText(readProperty(source, 'preview')),
      time: normalizeDisplayText(readProperty(source, 'time')),
      online: readProperty(source, 'online') === true,
      unread: normalizeUnread(readProperty(source, 'unread')),
    })
  }

  return normalizedContacts
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

function normalizeSearchText(value) {
  const text = normalizeDisplayText(value)

  try {
    return text.normalize('NFD').replace(DIACRITICS_PATTERN, '').toLocaleLowerCase()
  } catch {
    return text.toLowerCase()
  }
}

function ContactVisual({ contact, description, descriptionId, nameId }) {
  return (
    <>
      <span className="d-inline-block position-relative flex-shrink-0">
        <span className="avatar-image avatar-md">
          <img src={contact.avatar} alt="" className="img-fluid rounded-circle" />
        </span>
        {contact.online ? (
          <span className="position-absolute bottom-0 end-0 wd-10 ht-10 bg-success rounded-circle border border-2 border-white" aria-hidden="true"></span>
        ) : null}
      </span>
      <span className="ms-3 flex-grow-1 overflow-hidden text-start">
        <span className="d-flex align-items-center justify-content-between mb-1">
          <span id={nameId} className="fw-semibold fs-13 text-truncate">{contact.name}</span>
          {contact.time ? (
            <span className="fs-10 text-muted flex-shrink-0 ms-2">{contact.time}</span>
          ) : null}
        </span>
        <span className="d-flex align-items-center justify-content-between">
          <span className="fs-12 text-muted mb-0 text-truncate">{contact.preview}</span>
          {contact.unread > 0 ? (
            <span className="badge bg-primary rounded-pill flex-shrink-0 ms-2">{contact.unread}</span>
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
 * ChatSidebar — lista de contactos/conversaciones.
 *
 * Cada contacto es un botón seleccionable solo cuando existe `onSelect`.
 * Sin ese callback la misma información se renderiza como una lista
 * view-only, sin controles deshabilitados que parezcan accionables.
 * `selectedId` mantiene la API controlada; si se omite, la selección es local.
 * El filtrado local por nombre y preview siempre está activo. `onSearch` es
 * un callback opcional para sincronizar una búsqueda externa; no sustituye
 * este filtrado, de modo que el campo nunca queda editable pero inerte.
 */
export function ChatSidebar({
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
}) {
  // Keep the O(n) normalization independent from local selection, search and
  // announcement state. Consumers should replace the contacts array when its
  // data changes, as with other React collection props.
  const normalizedContacts = useMemo(
    () => normalizeContacts(contacts ?? EMPTY_CONTACTS),
    [contacts],
  )
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState(undefined)
  const [announcement, setAnnouncement] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [rovingKey, setRovingKey] = useState(null)
  const itemRefs = useRef(new Map())
  const focusedContactRef = useRef(null)
  const searchRef = useRef(null)
  const descriptionPrefix = useId()
  const listId = useId()
  const canSelect = isCallable(onSelect)
  const canEdit = isCallable(onEdit)
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

  const filteredContacts = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery).trim()
    if (!normalizedQuery) return normalizedContacts

    return normalizedContacts.filter((contact) => {
      const name = normalizeSearchText(contact.name)
      const preview = normalizeSearchText(contact.preview)
      return name.includes(normalizedQuery) || preview.includes(normalizedQuery)
    })
  }, [normalizedContacts, searchQuery])

  const selectedIndex = filteredContacts.findIndex((contact) => contact.id === activeSelectedId)
  const selectedContact = selectedIndex >= 0 ? filteredContacts[selectedIndex] : null
  const focusedContact = focusedContactRef.current
  const focusIsTracked = Boolean(
    typeof document !== 'undefined'
    && focusedContact?.element
    && document.activeElement === focusedContact.element,
  )
  const focusedKeyIsVisible = focusIsTracked
    && filteredContacts.some((contact) => contact.key === focusedContact.key)
  const rovingKeyIsVisible = filteredContacts.some((contact) => contact.key === rovingKey)
  const tabbableKey = focusedKeyIsVisible
    ? focusedContact.key
    : (selectedContact?.key || (rovingKeyIsVisible ? rovingKey : filteredContacts[0]?.key))

  useEffect(() => {
    const currentFocus = focusedContactRef.current
    if (!currentFocus || !currentFocus.element) return
    if (filteredContacts.some((contact) => contact.key === currentFocus.key)) return

    // Only repair focus when this component had focus. Typing in search must
    // keep focus in the searchbox even if it removes a previously focused row.
    if (!focusIsTracked && (typeof document === 'undefined' || document.activeElement !== currentFocus.element)) return

    const fallback = selectedContact || filteredContacts[0]
    if (fallback) {
      setRovingKey(fallback.key)
      itemRefs.current.get(fallback.key)?.focus()
    } else {
      focusedContactRef.current = null
      setRovingKey(null)
      searchRef.current?.focus()
    }
  }, [filteredContacts, selectedContact, focusIsTracked])

  function registerItem(key, element) {
    if (element) {
      itemRefs.current.set(key, element)
    } else {
      itemRefs.current.delete(key)
    }
  }

  function handleItemFocus(contact, event) {
    focusedContactRef.current = { key: contact.key, element: event.currentTarget }
    setRovingKey(contact.key)
  }

  function selectContact(contact) {
    if (!canSelect) return

    if (!isControlled) setUncontrolledSelectedId(contact.id)
    setRovingKey(contact.key)
    setAnnouncement(`${resolvedSelectedLabel}: ${contact.name}`)
    onSelect(contact.raw)
  }

  function handleSearchChange(event) {
    const nextQuery = event.target.value
    setSearchQuery(nextQuery)
    setAnnouncement('')
    if (isCallable(onSearch)) onSearch(nextQuery)
  }

  function moveFocus(event, contact) {
    if (!canSelect || filteredContacts.length === 0) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectContact(contact)
      return
    }

    const index = filteredContacts.findIndex((item) => item.key === contact.key)
    if (index < 0) return

    let nextIndex = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = Math.min(index + 1, filteredContacts.length - 1)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = Math.max(index - 1, 0)
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = filteredContacts.length - 1
    } else {
      return
    }

    event.preventDefault()
    const nextContact = filteredContacts[nextIndex]
    setRovingKey(nextContact.key)
    itemRefs.current.get(nextContact.key)?.focus()
  }

  const hasSearchQuery = searchQuery.trim().length > 0
  const statusMessage = announcement || (hasSearchQuery
    ? (filteredContacts.length === 0
      ? resolvedNoResultsLabel
      : `${filteredContacts.length} ${resolvedResultsLabel}`)
    : '')

  return (
    <aside className="content-sidebar content-sidebar-xl chat-sidebar" aria-label={resolvedSidebarLabel}>
      <div className="content-sidebar-header px-4 py-3 border-bottom d-flex align-items-center gap-3">
        <div className="input-group flex-grow-1 chat-sidebar__search">
          <span className="input-group-text border-0 bg-transparent ps-0" aria-hidden="true">
            <i className="feather-search text-muted"></i>
          </span>
          <input
            ref={searchRef}
            type="search"
            name="chat-search"
            autoComplete="off"
            className="form-control border-0 bg-transparent"
            aria-label={resolvedSearchLabel}
            aria-controls={listId}
            placeholder={resolvedSearchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        {canEdit ? (
          <button
            type="button"
            className="chat-sidebar__action avatar-text avatar-sm bg-primary text-white border-0 flex-shrink-0"
            aria-label={resolvedEditLabel}
            title={resolvedEditLabel}
            onClick={() => onEdit()}
          >
            <i className="feather-edit" aria-hidden="true"></i>
          </button>
        ) : null}
      </div>
      <div className="content-sidebar-body chat-sidebar__body">
        <ul id={listId} className="content-sidebar-items chat-sidebar__items list-unstyled mb-0" aria-label={resolvedListLabel}>
          {filteredContacts.map((contact, index) => {
            const isSelected = activeSelectedId === contact.id
            const descriptionId = `${descriptionPrefix}-contact-${index}`
            const nameId = `${descriptionPrefix}-contact-name-${index}`
            const description = [
              contact.preview,
              contact.time,
              contact.unread > 0 ? `${contact.unread} ${resolvedUnreadLabel}` : null,
              contact.online ? resolvedOnlineLabel : resolvedOfflineLabel,
            ].filter(Boolean).join(', ')

            return (
              <li key={contact.key}>
                {canSelect ? (
                  <button
                    ref={(element) => registerItem(contact.key, element)}
                    type="button"
                    className={`chat-sidebar__contact p-4 d-flex position-relative border-bottom single-item${isSelected ? ' active bg-soft-primary' : ''}`}
                    aria-labelledby={nameId}
                    aria-describedby={description ? descriptionId : undefined}
                    aria-current={isSelected ? 'true' : undefined}
                    tabIndex={contact.key === tabbableKey ? 0 : -1}
                    onClick={() => selectContact(contact)}
                    onFocus={(event) => handleItemFocus(contact, event)}
                    onKeyDown={(event) => moveFocus(event, contact)}
                  >
                    <ContactVisual
                      contact={contact}
                      description={description}
                      descriptionId={descriptionId}
                      nameId={nameId}
                    />
                  </button>
                ) : (
                  <div
                    className={`chat-sidebar__contact chat-sidebar__contact--view p-4 d-flex position-relative border-bottom single-item${isSelected ? ' active bg-soft-primary' : ''}`}
                    role="group"
                    aria-labelledby={nameId}
                    aria-describedby={description ? descriptionId : undefined}
                  >
                    <ContactVisual
                      contact={contact}
                      description={description}
                      descriptionId={descriptionId}
                      nameId={nameId}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        {filteredContacts.length === 0 ? (
          <div className="chat-sidebar__empty p-4 text-muted">{resolvedNoResultsLabel}</div>
        ) : null}
        {statusMessage ? (
          <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
            {statusMessage}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
