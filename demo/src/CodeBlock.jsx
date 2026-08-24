import { useState } from 'react'

export function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="showcase-code-block">
      <pre>
        <code>{code}</code>
      </pre>
      <button type="button" aria-live="polite" onClick={copy} className={copied ? 'is-copied' : undefined}>
        {copied ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  )
}
