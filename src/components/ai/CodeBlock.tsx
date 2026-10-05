import { forwardRef, useEffect, useId, useMemo, useState } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isFiniteNumber, isFunction, isString } from '../../utils/typeGuards'
import { Button, IconButton } from '../ui/Button'
import type { CodeBlockProps } from '../../public/types'

const COPIED_MS = 1600

/** Copia con un textarea oculto y `execCommand` (navegadores sin Clipboard API o sin contexto seguro). */
function copyWithFallback(text: string): boolean {
  const doc = globalThis.document
  if (!doc?.body) return false
  const area = doc.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  area.style.insetInlineStart = '-100vw'
  doc.body.appendChild(area)
  try {
    area.select()
    return isFunction(doc.execCommand) && doc.execCommand('copy')
  } catch {
    return false
  } finally {
    area.remove()
  }
}

/** Intenta `navigator.clipboard`; si falta o rechaza, usa el fallback. Nunca registra el contenido. */
async function copyText(text: string): Promise<boolean> {
  const clipboard = globalThis.navigator?.clipboard
  if (clipboard && isFunction(clipboard.writeText)) {
    try {
      await clipboard.writeText(text)
      return true
    } catch {
      log.warn('CodeBlock: el portapapeles rechazó la copia; se intenta el método alternativo.')
    }
  }
  return copyWithFallback(text)
}

/** Líneas con número y desplazamiento (clave estable: posición en el texto, no índice del arreglo). */
function splitLines(source: string): Array<{ number: number; offset: number; text: string }> {
  let offset = 0
  return source.replace(/\n$/, '').split('\n').map((text, position) => {
    const line = { number: position + 1, offset, text }
    offset += text.length + 1
    return line
  })
}

type CopyState ='idle' | 'copied' | 'failed'
const COPY_MESSAGE = { idle: '', copied: 'Código copiado.', failed: 'No se pudo copiar. Selecciona el texto y cópialo con Ctrl+C.' } satisfies Record<CopyState, string>

interface CodeCaptionProps {
  filename?: string
  language?: string
  copy: CopyState
  onCopy: () => void
}

/** Encabezado: nombre o lenguaje, botón copiar y el resultado anunciado en `status`. */
function CodeCaption({ filename, language, copy, onCopy }: CodeCaptionProps) {
  return (
    <figcaption className="gcu-ai-code__caption">
      <span className="gcu-ai-code__name">{filename ?? language ?? 'Código'}</span>
      {filename && language && <span className="gcu-ai-code__lang">{language}</span>}
      <IconButton
        icon={copy === 'copied' ? 'check' : 'copy'}
        label={copy === 'copied' ? 'Copiado' : 'Copiar código'}
        size="sm"
        className="gcu-ai-code__copy"
        onClick={onCopy}
      />
      <span className="visually-hidden" role="status">{COPY_MESSAGE[copy]}</span>
    </figcaption>
  )
}

/**
 * CodeBlock — bloque de código o texto técnico con nombre de archivo, copiar, números de línea y plegado.
 *
 * - Sin resaltado de sintaxis (sin dependencias): monoespaciada, con números opcionales que no se copian.
 * - Copiar: Clipboard API con fallback (textarea + execCommand). El resultado se anuncia en `status`.
 * - Más de `maxLines` líneas: «Mostrar N líneas más» con `aria-expanded`.
 * Estilos: src/styles/components/ai-code-block.css.
 */
export const CodeBlock = /* @__PURE__ */ forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock({
  code,
  filename,
  language,
  numbered = false,
  maxLines = 12,
  onCopy,
  className,
  ...rest
}, ref) {
  const source = isString(code) ? code : ''
  if (!isString(code)) log.warn('CodeBlock: `code` debe ser texto; se muestra vacío.')
  const limit = isFiniteNumber(maxLines) && maxLines > 0 ? Math.trunc(maxLines) : 12
  const [copy, setCopy] = useState<CopyState>('idle')
  const [expanded, setExpanded] = useState(false)
  const codeId = `gcu-ai-code-${useId().replace(/:/g, '')}`

  useEffect(() => {
    if (copy === 'idle') return undefined
    const timer = setTimeout(() => setCopy('idle'), COPIED_MS * (copy === 'failed' ? 3 : 1))
    return () => clearTimeout(timer)
  }, [copy])

  const lines = useMemo(() => splitLines(source), [source])
  const shown = expanded ? lines : lines.slice(0, limit)
  const hidden = lines.length - limit

  const handleCopy = async () => {
    const ok = await copyText(source)
    if (!ok) log.warn('CodeBlock: no se pudo copiar el código.')
    setCopy(ok ? 'copied' : 'failed')
    onCopy?.(ok)
  }

  return (
    <figure {...rest} ref={ref} className={cx('gcu-ai-code', numbered && 'gcu-ai-code--numbered', className)}>
      <CodeCaption filename={filename} language={language} copy={copy} onCopy={() => { void handleCopy() }} />
      {copy === 'failed' && <p className="gcu-ai-code__error">{COPY_MESSAGE.failed}</p>}
      <pre id={codeId} className="gcu-ai-code__pre" tabIndex={0} aria-label={filename ? `Código de ${filename}` : 'Código'}>
        <code>
          {shown.map((line) => (
            <span key={line.offset} className="gcu-ai-code__line">
              {numbered && <span className="gcu-ai-code__n gcu-tabular" aria-hidden="true">{line.number}</span>}
              {line.text}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
      {hidden > 0 && (
        <Button variant="link" size="sm" className="gcu-ai-code__more" aria-expanded={expanded} aria-controls={codeId} onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Mostrar menos' : `Mostrar ${hidden} ${hidden === 1 ? 'línea' : 'líneas'} más`}
        </Button>
      )}
    </figure>
  )
})
