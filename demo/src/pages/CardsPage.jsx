import { Card, Button, Badge } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function CardsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Card</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>title, headerRight, footer, stretch, noPad, className, children</code></p>

      <ShowcaseSection
        title="Card básica"
        preview={
          <Card title="Título de la Card">
            <p className="text-muted mb-0">Contenido de la card. Puede ser cualquier elemento React.</p>
          </Card>
        }
        code={`<Card title="Título de la Card">
  <p>Contenido</p>
</Card>`}
      />

      <ShowcaseSection
        title="Con headerRight (acción)"
        preview={
          <Card title="Con Acción" headerRight={<Button variant="primary" size="sm" icon="feather-plus">Agregar</Button>}>
            <p className="text-muted mb-0">El slot <code>headerRight</code> acepta cualquier JSX — botones, badges, dropdowns.</p>
          </Card>
        }
        code={`<Card
  title="Con Acción"
  headerRight={<Button size="sm" icon="feather-plus">Agregar</Button>}
>
  Contenido
</Card>`}
      />

      <ShowcaseSection
        title="Con footer"
        preview={
          <Card title="Con Footer" footer={<div className="d-flex justify-content-end gap-2"><Button variant="light-brand" size="sm">Cancelar</Button><Button variant="primary" size="sm">Guardar</Button></div>}>
            <p className="text-muted mb-0">Footer para acciones de formulario o navegación.</p>
          </Card>
        }
        code={`<Card title="Con Footer" footer={
  <div className="d-flex gap-2 justify-content-end">
    <Button variant="light-brand" size="sm">Cancelar</Button>
    <Button variant="primary" size="sm">Guardar</Button>
  </div>
}>
  Contenido
</Card>`}
      />
    </div>
  )
}
