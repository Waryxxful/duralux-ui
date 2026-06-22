import { CodeBlock } from './CodeBlock'

export function ShowcaseSection({ title, description, preview, code }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#1e293b' }}>{title}</h3>
      {description && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.6 }}>{description}</p>}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, marginBottom: 4 }}>
        {preview}
      </div>
      {code && <CodeBlock code={code} />}
    </div>
  )
}
