import { CodeBlock } from './CodeBlock'

export function ShowcaseSection({ title, description, preview, code }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h3 className="showcase-section__title">{title}</h3>
      {description && <p className="showcase-section__description">{description}</p>}
      <div className="showcase-preview">
        {preview}
      </div>
      {code && <CodeBlock code={code} />}
    </div>
  )
}
