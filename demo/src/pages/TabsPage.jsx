import { Tabs } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function TabsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Tabs</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>tabs=[{'{key, label, icon, content}'}], className, tabClassName</code></p>

      <ShowcaseSection
        title="Tabs básicos"
        preview={
          <Tabs tabs={[
            { key: 'info', label: 'Información', content: <div className="pt-3"><p className="text-muted">Contenido del tab Información.</p></div> },
            { key: 'config', label: 'Configuración', content: <div className="pt-3"><p className="text-muted">Contenido del tab Configuración.</p></div> },
            { key: 'historial', label: 'Historial', content: <div className="pt-3"><p className="text-muted">Contenido del tab Historial.</p></div> },
          ]} />
        }
        code={`<Tabs tabs={[
  { key: 'info', label: 'Información', content: <p>...</p> },
  { key: 'config', label: 'Configuración', content: <p>...</p> },
  { key: 'historial', label: 'Historial', content: <p>...</p> },
]} />`}
      />

      <ShowcaseSection
        title="Tabs con iconos"
        preview={
          <Tabs tabs={[
            { key: 'perfil', label: 'Perfil', icon: 'feather-user', content: <div className="pt-3"><p className="text-muted">Datos del perfil.</p></div> },
            { key: 'seguridad', label: 'Seguridad', icon: 'feather-lock', content: <div className="pt-3"><p className="text-muted">Cambio de contraseña.</p></div> },
            { key: 'notif', label: 'Notificaciones', icon: 'feather-bell', content: <div className="pt-3"><p className="text-muted">Preferencias de notificaciones.</p></div> },
          ]} />
        }
        code={`<Tabs tabs={[
  { key: 'perfil', label: 'Perfil', icon: 'feather-user', content: <p>...</p> },
  { key: 'seguridad', label: 'Seguridad', icon: 'feather-lock', content: <p>...</p> },
]} />`}
      />
    </div>
  )
}
