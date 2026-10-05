import { forwardRef, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isFunction } from '../../utils/typeGuards'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { DiffFile, DiffViewProps } from '../../public/types'
import { diffStats, keyedDiff, lineDiff } from './diffModel'

const LINE_SIGN = { add: '+', del: '−', same: ' ' } as const
const LINE_TEXT = { add: 'Agregada: ', del: 'Quitada: ', same: '' } as const

interface DiffFileBlockProps {
  file: DiffFile
  summary: boolean
  decided: boolean | undefined
  onDecide?: (name: string, accepted: boolean) => void
}

function DiffFileBlock({ file, summary, decided, onDecide }: DiffFileBlockProps) {
  const lines = useMemo(() => keyedDiff(lineDiff(file.before, file.after)), [file.before, file.after])
  const { added, removed } = diffStats(lines)
  return (
    <section className="gcu-ai-diff__file" aria-label={`Cambios en ${file.name}`}>
      <header className="gcu-ai-diff__header">
        <span className="gcu-ai-diff__name">{file.name}</span>
        <span className="gcu-ai-diff__count gcu-ai-diff__count--add gcu-tabular" aria-label={`${added} líneas agregadas`}>+{added}</span>
        <span className="gcu-ai-diff__count gcu-ai-diff__count--del gcu-tabular" aria-label={`${removed} líneas quitadas`}>−{removed}</span>
        <span className="gcu-ai-diff__spacer" />
        {isFunction(onDecide) && (decided === undefined ? (
          <span className="gcu-ai-diff__actions">
            <Button variant="light-brand" size="sm" onClick={() => onDecide(file.name, false)}>Rechazar</Button>
            <Button variant="light-primary" size="sm" onClick={() => onDecide(file.name, true)}>Aceptar</Button>
          </span>
        ) : (
          <Badge variant={decided ? 'success' : 'secondary'} soft>{decided ? 'Aceptado' : 'Rechazado'}</Badge>
        ))}
      </header>
      {!summary && (
        <pre className="gcu-ai-diff__code">
          {lines.map((line) => (
            <span key={line.key} className={cx('gcu-ai-diff__line', `gcu-ai-diff__line--${line.kind}`)}>
              <span className="gcu-ai-diff__sign" aria-hidden="true">{LINE_SIGN[line.kind]}</span>
              {LINE_TEXT[line.kind] && <span className="visually-hidden">{LINE_TEXT[line.kind]}</span>}
              {line.text}
              {'\n'}
            </span>
          ))}
        </pre>
      )}
    </section>
  )
}

/**
 * DiffView — cambios propuestos por archivo o registro (plantillas, reglas, pautas de calidad)
 * con diferencia línea a línea (LCS: respeta orden y líneas repetidas) y aceptar/rechazar por archivo.
 *
 * - Líneas agregadas y quitadas con signo (+/−) y texto oculto para lectores; no solo color.
 * - La decisión solo se emite con `onDecide(nombre, aceptado)`; el componente no aplica cambios.
 *   `decisions` la controla; sin ella, se recuerda localmente.
 * - summary: solo el encabezado con +/− por archivo.
 * Estilos: src/styles/components/ai-diff-view.css.
 */
export const DiffView = /* @__PURE__ */ forwardRef<HTMLDivElement, DiffViewProps>(function DiffView({
  files,
  onDecide,
  decisions,
  summary = false,
  className,
  ...rest
}, ref) {
  const list = isArray(files) ? files : []
  if (!isArray(files)) log.warn('DiffView: `files` debe ser un arreglo; se muestra vacío.')
  const [inner, setInner] = useState<Record<string, boolean | undefined>>({})
  const state = decisions ?? inner

  const decide = isFunction(onDecide)
    ? (name: string, accepted: boolean) => {
      if (decisions === undefined) setInner((current) => ({ ...current, [name]: accepted }))
      log.debug(`DiffView: archivo ${accepted ? 'aceptado' : 'rechazado'}.`)
      onDecide(name, accepted)
    }
    : undefined

  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-diff', className)}>
      {list.length === 0 && <p className="gcu-ai-diff__empty">No hay cambios propuestos.</p>}
      {list.map((file) => (
        <DiffFileBlock key={file.name} file={file} summary={summary} decided={state[file.name]} onDecide={decide} />
      ))}
    </div>
  )
})
