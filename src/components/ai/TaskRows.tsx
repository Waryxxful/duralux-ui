import { forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray } from '../../utils/typeGuards'
import type { TaskRowsProps } from '../../public/types'
import { AgentStatusBadge, AgentStatusIcon, resolveAgentStatus } from './internal/agentStatus'

/**
 * TaskRows — tareas en vivo de un agente con métrica, estado en texto y notas plegables.
 *
 * - Con notas, cada fila es un `<details>` nativo; sin notas (o en compacto), una fila simple.
 * - Vacío: dice que no hay tareas (prop `empty` para personalizarlo).
 * Estilos: src/styles/components/ai-task-rows.css.
 */
export const TaskRows = /* @__PURE__ */ forwardRef<HTMLUListElement, TaskRowsProps>(function TaskRows({
  tasks,
  compact = false,
  label = 'Tareas del agente',
  empty,
  className,
  ...rest
}, ref) {
  const list = isArray(tasks) ? tasks : []
  if (!isArray(tasks)) log.warn('TaskRows: `tasks` debe ser un arreglo; se muestra vacío.')

  if (list.length === 0) {
    return (
      <ul {...rest} ref={ref} aria-label={label} className={cx('gcu-ai-tasks', className)}>
        <li className="gcu-ai-tasks__empty">{empty ?? 'El agente no tiene tareas en curso.'}</li>
      </ul>
    )
  }

  return (
    <ul {...rest} ref={ref} aria-label={label} className={cx('gcu-ai-tasks', 'gcu-container', compact && 'gcu-ai-tasks--compact', className)}>
      {list.map((task) => {
        const status = resolveAgentStatus(task.status, 'TaskRows')
        const row = (
          <>
            <AgentStatusIcon status={status} />
            <span className="gcu-ai-tasks__title">{task.title}</span>
            {task.metric !== undefined && task.metric !== null && <span className="gcu-ai-tasks__metric gcu-tabular">{task.metric}</span>}
            <AgentStatusBadge status={status} />
          </>
        )
        const hasNotes = !compact && task.notes !== undefined && task.notes !== null && task.notes !== false
        return (
          <li key={task.id} className={cx('gcu-ai-tasks__item', `gcu-ai-tasks__item--${status}`)}>
            {hasNotes ? (
              <details className="gcu-ai-tasks__details">
                <summary className="gcu-ai-tasks__row">
                  {row}
                  <i className="feather-chevron-down gcu-ai-tasks__chevron" aria-hidden="true" />
                </summary>
                <div className="gcu-ai-tasks__notes">{task.notes}</div>
              </details>
            ) : (
              <div className="gcu-ai-tasks__row">{row}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
})
