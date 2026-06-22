import { Alert } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function AlertsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Alert</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>variant, icon, dismissible, title, children</code></p>

      <ShowcaseSection
        title="Variantes"
        preview={
          <div className="d-flex flex-column gap-3">
            <Alert variant="primary" icon="feather-info">Información importante para el usuario.</Alert>
            <Alert variant="success" icon="feather-check-circle">Operación completada con éxito.</Alert>
            <Alert variant="warning" icon="feather-alert-triangle">Advertencia: revisa los datos antes de continuar.</Alert>
            <Alert variant="danger" icon="feather-x-circle">Error: no se pudo completar la operación.</Alert>
          </div>
        }
        code={`<Alert variant="primary" icon="feather-info">Información importante.</Alert>
<Alert variant="success" icon="feather-check-circle">Operación exitosa.</Alert>
<Alert variant="warning" icon="feather-alert-triangle">Advertencia.</Alert>
<Alert variant="danger" icon="feather-x-circle">Error.</Alert>`}
      />

      <ShowcaseSection
        title="Con título y dismissible"
        preview={
          <Alert variant="info" icon="feather-bell" title="Nuevo mensaje" dismissible>
            Tienes 3 notificaciones pendientes de revisar.
          </Alert>
        }
        code={`<Alert variant="info" icon="feather-bell" title="Nuevo mensaje" dismissible>
  Tienes 3 notificaciones pendientes.
</Alert>`}
      />
    </div>
  )
}
