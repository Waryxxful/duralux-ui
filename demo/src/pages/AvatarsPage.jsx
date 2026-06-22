import { Avatar } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function AvatarsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Avatar</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>src, name, size (xs|sm|md|lg|xl|xxl), rounded (circle|3), bg</code></p>

      <ShowcaseSection
        title="Tamaños con imagen"
        preview={
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {['xs','sm','md','lg','xl','xxl'].map(s => (
              <div key={s} className="text-center">
                <Avatar src="/assets/images/avatar/1.png" size={s} rounded="circle" />
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{s}</div>
              </div>
            ))}
          </div>
        }
        code={`<Avatar src="/assets/images/avatar/1.png" size="md" rounded="circle" />
<Avatar src="/assets/images/avatar/1.png" size="xl" rounded="circle" />`}
      />

      <ShowcaseSection
        title="Con iniciales (sin src)"
        description="Cuando no hay imagen disponible, muestra las iniciales sobre un fondo de color."
        preview={
          <div className="d-flex gap-3 flex-wrap">
            {[
              { name: 'AD', bg: 'bg-primary' },
              { name: 'MC', bg: 'bg-success' },
              { name: 'RV', bg: 'bg-warning' },
              { name: 'JL', bg: 'bg-danger' },
              { name: 'PG', bg: 'bg-info' },
            ].map(({ name, bg }) => (
              <Avatar key={name} name={name} size="md" rounded="circle" bg={bg} />
            ))}
          </div>
        }
        code={`<Avatar name="AD" size="md" rounded="circle" bg="bg-primary" />
<Avatar name="MC" size="lg" rounded="circle" bg="bg-success" />`}
      />
    </div>
  )
}
