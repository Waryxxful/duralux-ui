import { Avatar } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function AvatarsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Avatar</h1>
      <p style={{ color: 'var(--gcu-muted)', marginBottom: 32 }}>Props: <code>src, name, size (xs|sm|md|lg|xl|xxl), rounded (circle|3), variant</code></p>

      <ShowcaseSection
        title="Tamaños con imagen"
        preview={
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {['xs','sm','md','lg','xl','xxl'].map(s => (
              <div key={s} className="text-center">
                <Avatar src="/assets/images/avatar/1.svg" size={s} rounded="circle" />
                <div style={{ fontSize: 10, color: 'var(--gcu-muted)', marginTop: 4 }}>{s}</div>
              </div>
            ))}
          </div>
        }
        code={`<Avatar src="/assets/images/avatar/1.svg" size="md" rounded="circle" />
<Avatar src="/assets/images/avatar/1.svg" size="xl" rounded="circle" />`}
      />

      <ShowcaseSection
        title="Con iniciales (sin src)"
        description="Cuando no hay imagen disponible, muestra las iniciales sobre un fondo de color."
        preview={
          <div className="d-flex gap-3 flex-wrap">
            {[
              { name: 'AD', variant: 'primary' },
              { name: 'MC', variant: 'success' },
              { name: 'RV', variant: 'warning' },
              { name: 'JL', variant: 'danger' },
              { name: 'PG', variant: 'info' },
            ].map(({ name, variant }) => (
              <Avatar key={name} name={name} size="md" rounded="circle" variant={variant} />
            ))}
          </div>
        }
        code={`<Avatar name="AD" size="md" rounded="circle" variant="primary" />
<Avatar name="MC" size="lg" rounded="circle" variant="success" />`}
      />
    </div>
  )
}
