import { useState } from 'react'

export function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div style={{ position: 'relative', marginTop: 12 }}>
      <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: '16px 20px', borderRadius: 10, fontSize: 13, overflowX: 'auto', lineHeight: 1.6, margin: 0 }}>
        <code>{code}</code>
      </pre>
      <button onClick={copy} style={{ position: 'absolute', top: 10, right: 10, background: copied ? '#22c55e' : '#1e293b', border: '1px solid #334155', color: copied ? '#fff' : '#94a3b8', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', transition: 'all .2s' }}>
        {copied ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  )
}
