import { Badge } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

const VARIANTS = ['primary','success','danger','warning','info','secondary']

export function BadgesPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Badge</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>variant, soft, pill, children</code></p>

      <ShowcaseSection
        title="Colores sólidos"
        preview={
          <div className="d-flex flex-wrap gap-2">
            {VARIANTS.map(v => <Badge key={v} variant={v}>{v}</Badge>)}
          </div>
        }
        code={`<Badge variant="primary">primary</Badge>
<Badge variant="success">success</Badge>
<Badge variant="danger">danger</Badge>`}
      />

      <ShowcaseSection
        title="Soft (bg-soft-*)"
        description="Fondo suave — ideal para tablas y estados"
        preview={
          <div className="d-flex flex-wrap gap-2">
            {VARIANTS.map(v => <Badge key={v} variant={v} soft>{v}</Badge>)}
          </div>
        }
        code={`<Badge variant="success" soft>Activo</Badge>
<Badge variant="danger" soft>Eliminado</Badge>
<Badge variant="warning" soft>Pendiente</Badge>`}
      />

      <ShowcaseSection
        title="Pill (redondeado)"
        preview={
          <div className="d-flex flex-wrap gap-2">
            {VARIANTS.map(v => <Badge key={v} variant={v} pill>{v}</Badge>)}
          </div>
        }
        code={`<Badge variant="primary" pill>primary</Badge>`}
      />
    </div>
  )
}
