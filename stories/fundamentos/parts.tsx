// Piezas de documentación de Fundamentos. Solo para Storybook: no forman parte del paquete.
import type { ReactNode } from 'react'

export function Page({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <div className="sb-page">
      <header className="sb-page__header">
        <p className="sb-eyebrow">Fundamentos</p>
        <h1 className="sb-page__title">{title}</h1>
        <p className="sb-page__lead">{lead}</p>
      </header>
      {children}
    </div>
  )
}

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="sb-section">
      <h2 className="sb-section__title">{title}</h2>
      {description ? <p className="sb-section__description">{description}</p> : null}
      {children}
    </section>
  )
}

export function ContrastBadge({ ratio, min = 4.5 }: { ratio: number | null; min?: number }) {
  if (ratio === null) return <span className="sb-chip">—</span>
  const pass = ratio >= min
  return (
    <span className={`sb-chip ${pass ? 'sb-chip--pass' : 'sb-chip--fail'}`} title={`Mínimo ${min}:1`}>
      {ratio.toFixed(2)}:1 {pass ? 'AA' : 'No AA'}
    </span>
  )
}

export function Token({ name }: { name: string }) {
  return <code className="sb-token">{name}</code>
}
