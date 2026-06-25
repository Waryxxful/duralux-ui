import { EmptyState, ErrorState, LoadingState, Progress } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function FeedbackPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Feedback</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>
        Componentes: <code>EmptyState, ErrorState, LoadingState, Progress</code>
      </p>

      <ShowcaseSection
        title="EmptyState"
        preview={
          <EmptyState
            icon="feather-inbox"
            title="Sin resultados"
            message="No hay datos disponibles para mostrar en este momento."
          />
        }
        code={`<EmptyState
  icon="feather-inbox"
  title="Sin resultados"
  message="No hay datos disponibles para mostrar en este momento."
/>`}
      />

      <ShowcaseSection
        title="ErrorState"
        preview={
          <ErrorState
            title="Ocurrió un error"
            message="No se pudo cargar la información. Intenta nuevamente."
            onRetry={() => alert('Reintentando...')}
          />
        }
        code={`<ErrorState
  title="Ocurrió un error"
  message="No se pudo cargar la información."
  onRetry={() => fetchData()}
/>`}
      />

      <ShowcaseSection
        title="LoadingState"
        preview={
          <LoadingState message="Cargando datos..." />
        }
        code={`<LoadingState message="Cargando datos..." />`}
      />

      <ShowcaseSection
        title="Progress — variantes"
        preview={
          <div className="d-flex flex-column gap-3">
            <Progress value={25} variant="primary" showValue />
            <Progress value={50} variant="success" showValue />
            <Progress value={75} variant="warning" showValue />
            <Progress value={90} variant="danger" showValue />
            <Progress value={60} variant="info" striped showValue />
            <Progress value={40} variant="primary" striped animated showValue />
          </div>
        }
        code={`<Progress value={25} variant="primary" showValue />
<Progress value={50} variant="success" showValue />
<Progress value={75} variant="warning" showValue />
<Progress value={90} variant="danger" showValue />
<Progress value={60} variant="info" striped showValue />
<Progress value={40} variant="primary" striped animated showValue />`}
      />
    </div>
  )
}
