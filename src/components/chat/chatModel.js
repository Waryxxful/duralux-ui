import { Children, isValidElement } from 'react'
import { PLACEHOLDER_AVATAR } from '../../assets/placeholders'
import { isArray, isBoolean, isFiniteNumber, isFunction, isObject, isString } from '../../utils/typeGuards'

export const DIACRITICS_PATTERN = /\p{Diacritic}/gu

export const DEFAULT_CHAT_LABELS = {
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
  window: 'Ventana de chat',
  empty: 'Selecciona una conversación',
  phone: 'Llamar',
  video: 'Videollamada',
  menu: 'Más opciones',
  messages: 'Mensajes',
}

export function readProperty(value, key) {
  if (value === null || value === undefined) return undefined

  try {
    return value[key]
  } catch {
    return undefined
  }
}

export function normalizeDisplayText(value, fallback = '') {
  if (isString(value)) return value
  if (isFiniteNumber(value)) return String(value)
  return fallback
}

export function normalizeLabelText(value, fallback) {
  const text = normalizeDisplayText(value).trim()
  return text || fallback
}

export function normalizeImageSource(value) {
  const source = normalizeDisplayText(value).trim()
  return source || PLACEHOLDER_AVATAR
}

export function normalizeUnread(value) {
  const numericValue = isFiniteNumber(value)
    ? value
    : (isString(value) && value.trim() ? Number(value) : 0)

  if (!isFiniteNumber(numericValue) || numericValue <= 0) return 0
  return Math.floor(numericValue)
}

export function normalizeIdentity(value, index) {
  if (isString(value) && value.trim()) return value
  if (isFiniteNumber(value)) return value
  return `chat-contact-${index}`
}

export function resolveLabel(labels, propLabel, key) {
  const label = labels && isObject(labels) ? readProperty(labels, key) : undefined
  const candidate = label ?? propLabel

  if (isString(candidate) || isFiniteNumber(candidate)) {
    const normalized = String(candidate).trim()
    if (normalized) return normalized
  }

  return DEFAULT_CHAT_LABELS[key]
}

export function normalizeSearchText(value) {
  const text = normalizeDisplayText(value)

  try {
    return text.normalize('NFD').replace(DIACRITICS_PATTERN, '').toLocaleLowerCase()
  } catch {
    return text.toLowerCase()
  }
}

export function isRenderableNode(value) {
  if (value === null || value === undefined || isBoolean(value)) return true
  if (isString(value) || isFiniteNumber(value)) return true
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

export function normalizeContact(item, index = 0) {
  if (item === null || item === undefined || !isObject(item)) {
    const fallbackId = `chat-contact-${index}`
    return {
      raw: item,
      id: fallbackId,
      key: fallbackId,
      name: `Contacto ${index + 1}`,
      avatar: PLACEHOLDER_AVATAR,
      online: false,
      preview: '',
      time: '',
      unread: 0,
      role: '',
    }
  }

  const id = normalizeIdentity(readProperty(item, 'id') ?? readProperty(item, 'key'), index)
  const nameCandidate = normalizeDisplayText(readProperty(item, 'name')).trim()
  const name = nameCandidate || `Contacto ${index + 1}`
  const avatar = normalizeImageSource(readProperty(item, 'avatar'))
  const online = Boolean(readProperty(item, 'online'))
  const preview = normalizeDisplayText(readProperty(item, 'preview'))
  const time = normalizeDisplayText(readProperty(item, 'time'))
  const unread = normalizeUnread(readProperty(item, 'unread'))
  const role = normalizeDisplayText(readProperty(item, 'role'))

  return {
    raw: item,
    id,
    key: id,
    name,
    avatar,
    online,
    preview,
    time,
    unread,
    role,
  }
}

export function normalizeContacts(contacts) {
  if (!isArray(contacts)) return []
  return contacts.map((item, index) => normalizeContact(item, index))
}

export function normalizeSlot(value) {
  if (isArray(value)) {
    let safeChildren
    try {
      safeChildren = Children.toArray(value).filter(isRenderableNode)
    } catch {
      safeChildren = []
    }
    return safeChildren.length > 0 ? safeChildren : null
  }

  if (isRenderableNode(value)) return value
  return null
}

export function normalizeLegacyChildren(children) {
  if (children === null || children === undefined) return []
  try {
    return Children.toArray(children).filter(isRenderableNode)
  } catch {
    return []
  }
}

export function resolveChatSlots(children, messages, composer, legacyChildren = true) {
  if (messages !== undefined || composer !== undefined) {
    return {
      messages: normalizeSlot(messages),
      composer: normalizeSlot(composer),
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
