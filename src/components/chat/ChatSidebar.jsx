import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  normalizeContacts,
  normalizeDisplayText,
  normalizeLabelText,
  normalizeSearchText,
  resolveLabel,
} from './chatModel'
import { isFunction } from '../../utils/typeGuards'

const EMPTY_CONTACTS = []

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
    globalThis.document
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

    if (!focusIsTracked && (!globalThis.document || document.activeElement !== currentFocus.element)) return

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

  function handleKeyDown(event, currentIndex) {
    if (!canSelect || !filteredContacts.length) return

    let nextIndex = null

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

  function handleSearchChange(event) {
    const query = event.target.value
    setSearchQuery(query)

    if (isFunction(onSearch)) onSearch(query)

    const normalizedQuery = normalizeSearchText(query).trim()
    const nextCount = normalizedQuery
      ? normalizedContacts.filter((contact) => {
        const name = normalizeSearchText(contact.name)
        const preview = normalizeSearchText(contact.preview)
        return name.includes(normalizedQuery) || preview.includes(normalizedQuery)
      }).length
      : normalizedContacts.length

    setAnnouncement(
      nextCount === 0
        ? resolvedNoResultsLabel
        : `${nextCount} ${resolvedResultsLabel}`,
    )
  }

  return (
    <aside className="content-sidebar content-sidebar-md" aria-label={resolvedSidebarLabel}>
      <div className="content-sidebar-header bg-white sticky-top hstack justify-content-between">
        <h4 className="fw-bolder mb-0">{resolvedSidebarLabel}</h4>
        {canEdit ? (
          <button
            type="button"
            className="avatar-text avatar-md"
            aria-label={resolvedEditLabel}
            title={resolvedEditLabel}
            onClick={() => onEdit()}
          >
            <i className="feather-edit" aria-hidden="true"></i>
          </button>
        ) : null}
      </div>

      <div className="content-sidebar-header">
        <div className="input-group">
          <span className="input-group-text bg-transparent border-0" id={`${descriptionPrefix}-search-icon`}>
            <i className="feather-search text-muted fs-12" aria-hidden="true"></i>
          </span>
          <input
            ref={searchRef}
            type="search"
            name="chat-contact-search"
            autoComplete="off"
            className="form-control border-0 ps-0"
            placeholder={resolvedSearchPlaceholder}
            aria-label={resolvedSearchLabel}
            aria-controls={listId}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {announcement ? (
        <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      ) : null}

      <div className="content-sidebar-body">
        {filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-muted fs-13">
            {resolvedNoResultsLabel}
          </div>
        ) : (
          <ul id={listId} className="list-unstyled mb-0" aria-label={resolvedListLabel}>
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
              const tabIndex = !canSelect ? undefined : (contact.key === tabbableKey ? 0 : -1)

              return (
                <li key={contact.key} className="p-0 border-bottom border-gray-100">
                  {canSelect ? (
                    <button
                      ref={(node) => registerItem(contact.key, node)}
                      type="button"
                      tabIndex={tabIndex}
                      className={`w-100 p-3 d-flex align-items-center bg-transparent border-0 text-decoration-none text-reset text-start cursor-pointer${isSelected ? ' bg-gray-100' : ''}`}
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
                      className={`p-3 d-flex align-items-center${isSelected ? ' bg-gray-100' : ''}`}
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
        )}
      </div>
    </aside>
  )
}
