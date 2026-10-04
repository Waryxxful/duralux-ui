import { Children, isValidElement } from 'react'
import type * as React from 'react'
import { PLACEHOLDER_AVATAR } from '../../assets/placeholders'
import { isArray, isBoolean, isFiniteNumber, isObject, isString } from '../../utils/typeGuards'
import { formatDate, toDate } from '../../utils/format'
import type { ChatContact, ChatLabels, ChatMessage, ChatTimelineEntry, EventDate } from '../../public/types'

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
  emptyList: 'Todavía no hay conversaciones',
  back: 'Volver a las conversaciones',
  loading: 'Cargando',
} as const

export type ChatLabelKey = keyof typeof DEFAULT_CHAT_LABELS

/** Contacto normalizado: lo que la UI pinta, más el original para devolverlo en callbacks. */
export interface NormalizedContact<T = unknown> {
  raw: T
  id: string | number
  key: string | number
  name: string
  avatar: string
  /** true si el contacto trae foto propia; sin ella la UI usa iniciales. */
  hasAvatar: boolean
  online: boolean
  preview: string
  time: string
  unread: number
  role: string
}

/** Texto que llega de las apps: el contrato pide string o número, pero en runtime puede venir cualquier cosa. */
type LooseText = string | number | null | undefined

/** Contacto tal como lo pasan las apps: `key` y `role` son alias legados. */
interface LooseContact extends ChatContact {
  key?: string | number
  role?: string | number
}

/** Lee una propiedad sin romper con getters hostiles (Proxy) ni valores nulos. */
export function readProperty<T extends object, K extends keyof T>(value: T | null | undefined, key: K): T[K] | undefined {
  if (value === null || value === undefined) return undefined

  try {
    return value[key]
  } catch {
    return undefined
  }
}

export function normalizeDisplayText(value: LooseText, fallback = ''): string {
  if (isString(value)) return value
  if (isFiniteNumber(value)) return String(value)
  return fallback
}

export function normalizeLabelText(value: LooseText, fallback: string): string {
  const text = normalizeDisplayText(value).trim()
  return text || fallback
}

export function normalizeImageSource(value: LooseText): string {
  const source = normalizeDisplayText(value).trim()
  return source || PLACEHOLDER_AVATAR
}

export function normalizeUnread(value: LooseText): number {
  const numericValue = isFiniteNumber(value)
    ? value
    : (isString(value) && value.trim() ? Number(value) : 0)

  if (!isFiniteNumber(numericValue) || numericValue <= 0) return 0
  return Math.floor(numericValue)
}

export function normalizeIdentity(value: LooseText, index: number): string | number {
  if (isString(value) && value.trim()) return value
  if (isFiniteNumber(value)) return value
  return `chat-contact-${index}`
}

export function resolveLabel(labels: ChatLabels | undefined | null, propLabel: LooseText, key: ChatLabelKey): string {
  const label = labels && isObject(labels) ? readProperty(labels, key) : undefined
  const candidate = label ?? propLabel

  if (isString(candidate) || isFiniteNumber(candidate)) {
    const normalized = String(candidate).trim()
    if (normalized) return normalized
  }

  return DEFAULT_CHAT_LABELS[key]
}

/** Etiqueta personalizada por el consumidor, o `undefined` si usa la de fábrica. */
export function customLabel(labels: ChatLabels | undefined | null, key: ChatLabelKey): string | undefined {
  const label = labels && isObject(labels) ? readProperty(labels, key) : undefined
  if (isString(label) || isFiniteNumber(label)) {
    const normalized = String(label).trim()
    if (normalized) return normalized
  }
  return undefined
}

export function normalizeSearchText(value: LooseText): string {
  const text = normalizeDisplayText(value)

  try {
    return text.normalize('NFD').replace(DIACRITICS_PATTERN, '').toLocaleLowerCase()
  } catch {
    return text.toLowerCase()
  }
}

export function isRenderableNode(value: React.ReactNode): boolean {
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

export function normalizeContact<T extends LooseContact | null | undefined>(item: T, index = 0): NormalizedContact<T> {
  if (item === null || item === undefined || !isObject(item)) {
    const fallbackId = `chat-contact-${index}`
    return {
      raw: item,
      id: fallbackId,
      key: fallbackId,
      name: `Contacto ${index + 1}`,
      avatar: PLACEHOLDER_AVATAR,
      hasAvatar: false,
      online: false,
      preview: '',
      time: '',
      unread: 0,
      role: '',
    }
  }

  const source: LooseContact = item
  const id = normalizeIdentity(readProperty(source, 'id') ?? readProperty(source, 'key'), index)
  const nameCandidate = normalizeDisplayText(readProperty(source, 'name')).trim()

  return {
    raw: item,
    id,
    key: id,
    name: nameCandidate || `Contacto ${index + 1}`,
    avatar: normalizeImageSource(readProperty(source, 'avatar')),
    hasAvatar: normalizeDisplayText(readProperty(source, 'avatar')).trim() !== '',
    online: Boolean(readProperty(source, 'online')),
    preview: normalizeDisplayText(readProperty(source, 'preview')),
    time: normalizeDisplayText(readProperty(source, 'time')),
    unread: normalizeUnread(readProperty(source, 'unread')),
    role: normalizeDisplayText(readProperty(source, 'role')),
  }
}

export function normalizeContacts<T extends ChatContact>(contacts: ReadonlyArray<T> | null | undefined): NormalizedContact<T>[] {
  if (!isArray(contacts)) return []
  return contacts.map((item, index) => normalizeContact(item, index))
}

export function normalizeSlot(value: React.ReactNode): React.ReactNode {
  if (isArray(value)) {
    let safeChildren: React.ReactNode[]
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

export function normalizeLegacyChildren(children: React.ReactNode): React.ReactNode[] {
  if (children === null || children === undefined) return []
  try {
    return Children.toArray(children).filter(isRenderableNode)
  } catch {
    return []
  }
}

/** Slots resueltos de ChatWindow. */
export interface ChatSlots {
  messages: React.ReactNode
  composer: React.ReactNode
}

export function resolveChatSlots(
  children: React.ReactNode,
  messages: React.ReactNode,
  composer: React.ReactNode,
  legacyChildren = true,
): ChatSlots {
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

// ── Días y agrupación ───────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000
/** Mensajes del mismo autor separados por menos de esto se agrupan. */
export const CHAT_GROUP_WINDOW_MS = 5 * 60 * 1000

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function safeToDate(value: EventDate | null | undefined): Date | null {
  try {
    return toDate(value)
  } catch {
    return null
  }
}

/** «Hoy», «Ayer» o dd-mm-aaaa; cadena vacía si la fecha no es válida. */
export function formatChatDay(value: EventDate | null | undefined, now: Date = new Date()): string {
  const date = safeToDate(value)
  if (!date) return ''
  const diff = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return formatDate(date)
}

function authorKey(message: ChatMessage): string {
  if (readProperty(message, 'mine') === true) return 'mine'
  const sender = readProperty(message, 'sender')
  const id = readProperty(sender, 'id')
  if (isString(id) || isFiniteNumber(id)) return `id:${id}`
  const name = readProperty(sender, 'name')
  if (isString(name) || isFiniteNumber(name)) return `name:${name}`
  return 'contact'
}

/**
 * Prepara una conversación para pintarla: inserta un separador por día («Hoy», «Ayer», dd-mm-aaaa)
 * y marca `grouped` en los mensajes consecutivos del mismo autor (mismo día, menos de 5 minutos).
 * Los mensajes del sistema nunca se agrupan ni cortan por sí mismos un grupo de días.
 */
export function groupChatMessages(
  messages: ReadonlyArray<ChatMessage> | null | undefined,
  options: { now?: Date } = {},
): ChatTimelineEntry[] {
  if (!isArray(messages)) return []
  const now = options.now ?? new Date()
  const entries: ChatTimelineEntry[] = []
  let lastDay: number | null = null
  let previous: { author: string; time: number | null } | null = null

  messages.forEach((raw, index) => {
    const message: ChatMessage = isObject(raw) ? raw : {}
    const id = readProperty(message, 'id')
    const key = isString(id) || isFiniteNumber(id) ? String(id) : `chat-message-${index}`
    const date = safeToDate(readProperty(message, 'date'))

    if (date) {
      const day = startOfDay(date)
      if (day !== lastDay) {
        entries.push({ type: 'day', key: `day-${day}`, date, label: formatChatDay(date, now) })
        lastDay = day
        previous = null
      }
    }

    if (readProperty(message, 'system') === true) {
      entries.push({ type: 'message', key, message, grouped: false })
      previous = null
      return
    }

    const author = authorKey(message)
    const time = date ? date.getTime() : null
    const grouped = previous !== null
      && previous.author === author
      && (time === null || previous.time === null || time - previous.time < CHAT_GROUP_WINDOW_MS)
    entries.push({ type: 'message', key, message, grouped })
    previous = { author, time }
  })

  return entries
}
