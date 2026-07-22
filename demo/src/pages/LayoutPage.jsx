import { PageHeader } from '@duralux/ui'
import { Button } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function LayoutPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Layout Components</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>AppLayout · AuthLayout · Sidebar · Header · PageHeader</p>

      <ShowcaseSection
        title="PageHeader"
        description="Usado en cada página del CRM. Props: title, breadcrumbs=[{label, href}], children (action buttons)."
        preview={
          <PageHeader
            title="Clientes"
            breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'CRM', href: '/' }, { label: 'Clientes' }]}
          >
            <div className="d-flex gap-2">
              <Button variant="light-brand" className="btn-icon"><i className="feather-filter"></i></Button>
              <Button variant="light-brand" className="btn-icon"><i className="feather-download"></i></Button>
              <Button variant="primary" icon="feather-plus">Nuevo Cliente</Button>
            </div>
          </PageHeader>
        }
        code={`<PageHeader
  title="Clientes"
  breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Clientes' }]}
>
  <Button variant="primary" icon="feather-plus">Nuevo Cliente</Button>
</PageHeader>`}
      />

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>AppLayout</h3>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
          Envuelve toda la app. Incluye sidebar con mini-mode, header con notificaciones y user dropdown, y el área de contenido principal.
        </p>
        <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '16px 20px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', lineHeight: 1.8 }}>
{`import { AppLayout } from '@duralux/ui'

const NAV_ITEMS = [
  { type: 'caption', label: 'Principal' },
  {
    icon: 'feather-airplay', label: 'Dashboards', children: [
      { label: 'CRM', to: '/', end: true },
      { label: 'Analytics', to: '/analytics' },
    ],
  },
  { icon: 'feather-users', label: 'Clientes', to: '/clientes' },
]

const USER = {
  name: 'Admin',
  email: 'admin@empresa.cl',
  avatar: '/assets/images/avatar/1.png',
  menuItems: [
    { label: 'Mi Perfil', icon: 'feather-user', href: '#' },
    { divider: true },
    { label: 'Cerrar Sesión', icon: 'feather-log-out', href: '/login' },
  ],
}

<AppLayout navItems={NAV_ITEMS} user={USER} notifications={NOTIFS}>
  <YourPageContent />
</AppLayout>`}
        </div>
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>AuthLayout</h3>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
          Layout para páginas sin sidebar (login, register). Porta la variante <code>auth-cover-wrapper</code> real de Duralux (tarjeta a la derecha + ilustración opcional a la izquierda).
        </p>
        <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '16px 20px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', lineHeight: 1.8 }}>
{`import { AuthLayout } from '@duralux/ui'

// En tu router:
{ path: '/login', element: <AuthLayout image="/auth-bg.svg"><LoginForm /></AuthLayout> }`}
        </div>
      </div>
    </div>
  )
}
