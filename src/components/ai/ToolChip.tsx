import { forwardRef, useId, useState } from 'react'
import { cx } from '../../utils/cx'
import { isFiniteNumber } from '../../utils/typeGuards'
import type { ToolChipProps } from '../../public/types'
import { AGENT_STATUS_TEXT, AgentStatusIcon, formatArgs, resolveAgentStatus } from './internal/agentStatus'

/**
 * ToolChip — llamada a una herramienta del agente, compacta y expandible.
 *
 * - Botón con `aria-expanded` / `aria-controls` que abre argumentos (JSON) y resultado.
 * - Sin argumentos ni resultado no es un botón: es un chip estático.
 * - El estado se dice en texto («En curso», «Falló») además del ícono.
 * - Los argumentos solo se muestran; nunca se registran en logs.
 * Estilos: src/styles/components/ai-tool-chip.css.
 */
export const ToolChip = /* @__PURE__ */ forwardRef<HTMLDivElement, ToolChipProps>(function ToolChip({
  tool,
  status,
  seconds,
  args,
  result,
  defaultOpen = false,
  className,
  ...rest
}, ref) {
  const resolved = resolveAgentStatus(status, 'ToolChip')
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `gcu-ai-tool-${useId().replace(/:/g, '')}`
  const json = formatArgs(args, 'ToolChip')
  const hasResult = result !== undefined && result !== null && result !== false
  const expandable = json !== null || hasResult

  const content = (
    <>
      <i className="feather-tool gcu-ai-tool__glyph" aria-hidden="true" />
      <span className="gcu-ai-tool__name">{tool}</span>
      {isFiniteNumber(seconds) && <span className="gcu-ai-tool__time gcu-tabular">{seconds.toLocaleString('es-CL')} s</span>}
      <AgentStatusIcon status={resolved} />
      <span className="visually-hidden">{AGENT_STATUS_TEXT[resolved]}</span>
      {expandable && <i className="feather-chevron-down gcu-ai-tool__chevron" aria-hidden="true" />}
    </>
  )

  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-tool', `gcu-ai-tool--${resolved}`, open && 'gcu-ai-tool--open', className)}>
      {expandable ? (
        <button
          type="button"
          className="gcu-ai-tool__chip"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {content}
        </button>
      ) : (
        <span className="gcu-ai-tool__chip">{content}</span>
      )}
      {expandable && (
        <div id={panelId} className="gcu-ai-tool__panel" hidden={!open}>
          {json !== null && <pre className="gcu-ai-tool__json">{json}</pre>}
          {hasResult && <div className="gcu-ai-tool__result">{result}</div>}
        </div>
      )}
    </div>
  )
})
