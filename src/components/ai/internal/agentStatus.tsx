import { Badge } from '../../ui/Badge'
import type { AgentStepStatus } from '../../../public/types'
import { AGENT_STATUS_TEXT, STATUS_GLYPH, STATUS_TONE } from './agentStatusModel'

/** Ícono decorativo del estado (el texto lo da AgentStatusBadge). `running` gira salvo reduced-motion. */
export function AgentStatusIcon({ status, className }: { status: AgentStepStatus; className?: string }) {
  const spin = status === 'running' ? ' gcu-ai-status-icon--spin' : ''
  return <i className={`${STATUS_GLYPH[status]} gcu-ai-status-icon gcu-ai-status-icon--${status}${spin}${className ? ` ${className}` : ''}`} aria-hidden="true" />
}

/** Estado en texto sobre fondo suave (Badge soft, AA por tokens). */
export function AgentStatusBadge({ status }: { status: AgentStepStatus }) {
  return <Badge variant={STATUS_TONE[status]} soft>{AGENT_STATUS_TEXT[status]}</Badge>
}
