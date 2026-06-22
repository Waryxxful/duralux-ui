import { Button } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function ButtonsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Button</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>variant, size, loading, disabled, icon, onClick, href, as, className, children, type</code></p>

      <ShowcaseSection
        title="Variantes"
        description="Cada variant corresponde a una clase Bootstrap btn-*"
        preview={
          <div className="d-flex flex-wrap gap-2">
            {['primary','secondary','success','danger','warning','info','light-brand'].map(v => (
              <Button key={v} variant={v}>{v}</Button>
            ))}
          </div>
        }
        code={`import { Button } from '@duralux/ui'

<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="light-brand">Light Brand</Button>`}
      />

      <ShowcaseSection
        title="Tamaños"
        preview={
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary">Medium (default)</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        }
        code={`<Button size="sm">Small</Button>
<Button>Medium</Button>
<Button size="lg">Large</Button>`}
      />

      <ShowcaseSection
        title="Estados"
        preview={
          <div className="d-flex flex-wrap gap-2">
            <Button variant="primary" loading>Loading...</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" icon="feather-plus">Con Icono</Button>
            <Button variant="light-brand" icon="feather-download">Exportar</Button>
          </div>
        }
        code={`<Button variant="primary" loading>Loading...</Button>
<Button variant="primary" disabled>Disabled</Button>
<Button variant="primary" icon="feather-plus">Con Icono</Button>`}
      />

      <ShowcaseSection
        title="Icono solo (btn-icon)"
        preview={
          <div className="d-flex gap-2">
            {['feather-edit','feather-trash-2','feather-eye','feather-download','feather-filter'].map(icon => (
              <Button key={icon} variant="light-brand" className="btn-icon"><i className={icon}></i></Button>
            ))}
          </div>
        }
        code={`<Button variant="light-brand" className="btn-icon">
  <i className="feather-edit"></i>
</Button>`}
      />
    </div>
  )
}
