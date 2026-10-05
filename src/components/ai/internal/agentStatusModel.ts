/** Modelo de estados del agente (texto, tono, ícono) y formato de argumentos. Sin componentes. */
import { log } from '../../../utils/log'
import type { AgentStepStatus, AiToolArgs, SemanticTone } from '../../../public/types'

/** Texto de cada estado: el estado nunca va solo en color. */
export const AGENT_STATUS_TEXT = {
  queued: 'En cola',
  running: 'En curso',
  done: 'Listo',
  failed: 'Falló',
} satisfies Record<AgentStepStatus, string>

export const STATUS_TONE = {
  queued: 'secondary',
  running: 'primary',
  done: 'success',
  failed: 'danger',
} satisfies Record<AgentStepStatus, SemanticTone>

export const STATUS_GLYPH = {
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

/** JSON legible de argumentos; nunca lanza (valores circulares o BigInt). */
export function formatArgs(args: AiToolArgs | undefined, owner: string): string | null {
  if (!args) return null
  try {
    return JSON.stringify(args, null, 2)
  } catch {
    log.warn(`${owner}: los argumentos no se pueden mostrar como JSON.`)
    return null
  }
}
