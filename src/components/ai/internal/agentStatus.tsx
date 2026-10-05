import { Badge } from '../../ui/Badge'
import { log } from '../../../utils/log'
import type { AgentStepStatus, SemanticTone } from '../../../public/types'

/** Texto de cada estado: el estado nunca va solo en color. */
export const AGENT_STATUS_TEXT = {
  queued: 'En cola',
  running: 'En curso',
  done: 'Listo',
  failed: 'Falló',
} satisfies Record<AgentStepStatus, string>

const STATUS_TONE = {
  queued: 'secondary',
  running: 'primary',
  done: 'success',
  failed: 'danger',
} satisfies Record<AgentStepStatus, SemanticTone>

const STATUS_GLYPH = {
  queued: 'feather-clock',
  running: 'feather-loader',
  done: 'feather-check',
  failed: 'feather-x',
} satisfies Record<AgentStepStatus, string>

const warned = new Set<string>()

/** Normaliza un estado desconocido a `queued` con un aviso (una vez por valor). */
export function resolveAgentStatus(status: string | undefined, owner: string): AgentStepStatus {
  if (status === 'queued' || status === 'running' || status === 'done' || status === 'failed') return status
  const key = `${owner}:${String(status)}`
  if (!warned.has(key)) {
    warned.add(key)
    log.warn(`${owner}: estado "${String(status)}" desconocido; se usa "queued".`)
  }
  return 'queued'
}

/** Ícono decorativo del estado (el texto lo da AgentStatusBadge). `running` gira salvo reduced-motion. */
export function AgentStatusIcon({ status, className }: { status: AgentStepStatus; className?: string }) {
  const spin = status === 'running' ? ' gcu-ai-status-icon--spin' : ''
  return <i className={`${STATUS_GLYPH[status]} gcu-ai-status-icon gcu-ai-status-icon--${status}${spin}${className ? ` ${className}` : ''}`} aria-hidden="true" />
}

/** Estado en texto sobre fondo suave (Badge soft, AA por tokens). */
export function AgentStatusBadge({ status }: { status: AgentStepStatus }) {
  return <Badge variant={STATUS_TONE[status]} soft>{AGENT_STATUS_TEXT[status]}</Badge>
}

/** JSON legible de argumentos; nunca lanza (valores circulares o BigInt). */
export function formatArgs(args: Record<string, unknown> | undefined, owner: string): string | null {
  if (!args) return null
  try {
    return JSON.stringify(args, null, 2)
  } catch {
    log.warn(`${owner}: los argumentos no se pueden mostrar como JSON.`)
    return null
  }
}
