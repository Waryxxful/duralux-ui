import { Button, LinkButton, IconButton, Icon } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function ButtonsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Button</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>variant, size, outline, loading, disabled, icon, startIcon, endIcon, onClick, href, as, className, children, type</code></p>

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
        title="Iconos (startIcon/endIcon)"
        description="startIcon/endIcon usan nombre feather bare. outline está deprecado (la plantilla no usa variantes outline; usá light-brand)."
        preview={
          <div className="d-flex flex-wrap gap-2">
            <Button variant="primary" startIcon="plus">Nuevo</Button>
            <Button variant="danger" startIcon="trash-2">Eliminar</Button>
            <Button variant="light-brand" endIcon="external-link">Ver más</Button>
          </div>
        }
        code={`<Button variant="primary" startIcon="plus">Nuevo</Button>
<Button variant="danger" startIcon="trash-2">Eliminar</Button>
<Button variant="light-brand" endIcon="external-link">Ver más</Button>`}
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

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, marginTop: 48 }}>Icon</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>name, size, aria-label, className, style</code></p>

      <ShowcaseSection
        title="Tamaños"
        description="El prop size mapea a font-size inline (xs→0.625rem … xl→1.5rem)"
        preview={
          <div className="d-flex align-items-center gap-3">
            {['xs','sm','md','lg','xl'].map(s => (
              <Icon key={s} name="star" size={s} aria-label={`estrella ${s}`} />
            ))}
          </div>
        }
        code={`<Icon name="star" size="xs" />
<Icon name="star" size="sm" />
<Icon name="star" size="md" />
<Icon name="star" size="lg" />
<Icon name="star" size="xl" />`}
      />

      <ShowcaseSection
        title="Iconos decorativos (aria-hidden)"
        preview={
          <div className="d-flex gap-3">
            {['home','user','settings','bell','mail'].map(n => (
              <Icon key={n} name={n} size="lg" />
            ))}
          </div>
        }
        code={`<Icon name="home" size="lg" />
<Icon name="user" size="lg" />`}
      />

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, marginTop: 48 }}>LinkButton</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: mismas que Button + <code>href</code>. Renderiza como <code>&lt;a&gt;</code>.</p>

      <ShowcaseSection
        title="Variantes"
        preview={
          <div className="d-flex flex-wrap gap-2">
            {['primary','secondary','success','danger','warning','info'].map(v => (
              <LinkButton key={v} variant={v} href="#">{v}</LinkButton>
            ))}
          </div>
        }
        code={`<LinkButton variant="primary" href="/ruta">Ir a ruta</LinkButton>
<LinkButton variant="secondary" href="/ruta">Secundario</LinkButton>`}
      />

      <ShowcaseSection
        title="Con icono"
        preview={
          <div className="d-flex flex-wrap gap-2">
            <LinkButton variant="primary" href="#" icon="feather-external-link">Abrir enlace</LinkButton>
            <LinkButton variant="light-brand" href="#" icon="feather-download">Descargar</LinkButton>
          </div>
        }
        code={`<LinkButton variant="primary" href="#" icon="feather-external-link">Abrir enlace</LinkButton>`}
      />

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, marginTop: 48 }}>IconButton</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>icon (bare name), label (required), variant, size, outline, disabled</code>. Solo icono, sin texto.</p>

      <ShowcaseSection
        title="Variantes"
        preview={
          <div className="d-flex flex-wrap gap-2">
            {['primary','secondary','success','danger','warning','light-brand'].map(v => (
              <IconButton key={v} variant={v} icon="edit" label={`Editar (${v})`} />
            ))}
          </div>
        }
        code={`<IconButton variant="primary" icon="edit" label="Editar" />
<IconButton variant="danger" icon="trash-2" label="Eliminar" />`}
      />

      <ShowcaseSection
        title="Tamaños y estados"
        preview={
          <div className="d-flex align-items-center flex-wrap gap-2">
            <IconButton variant="primary" icon="search" size="sm" label="Buscar pequeño" />
            <IconButton variant="primary" icon="search" label="Buscar mediano" />
            <IconButton variant="primary" icon="search" size="lg" label="Buscar grande" />
            <IconButton variant="primary" icon="search" label="Deshabilitado" disabled />
          </div>
        }
        code={`<IconButton variant="primary" icon="search" size="sm" label="Buscar" />
<IconButton variant="primary" icon="search" label="Buscar" disabled />`}
      />
    </div>
  )
}
