import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Button, Card, Progress } from '../../../src'

const meta: Meta<typeof Card> = {
  title: 'Componentes/Presentación/Card',
  component: Card,
  tags: ['autodocs'],
  args: { title: 'Campaña Cobranza Q4', subtitle: 'Actualizado hace 5 minutos', children: 'Contenido de la card.' },
  parameters: {
    docs: {
      description: {
        component: 'Superficie con elevación 1; `interactive` agrega elevación 2 en hover (solo con puntero). Título y acciones se apilan cuando el contenedor es angosto. Para cargar contenido usa `loading` con `loadingVariant="skeleton"` en vez del spinner a pantalla completa.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Card>

export const Playground: Story = {}

export const ConAcciones: Story = {
  name: 'Con acciones',
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Card
        title="Llamadas por hora"
        subtitle="Hoy · todas las colas"
        actions={<Button size="sm" variant="light-brand" startIcon="download">Exportar</Button>}
        onRefresh={() => {}}
        onExpand={() => {}}
        footer={<span className="text-muted fs-12">Fuente: central telefónica</span>}
      >
        <p className="mb-0">1.240 llamadas atendidas · meta 1.100 · +12 %</p>
      </Card>
    </div>
  ),
}

export const Estados: Story = {
  render: () => (
    <div className="row g-3" style={{ maxWidth: 960 }}>
      <div className="col-md-4">
        <Card title="Reposo">Elevación 1, borde fino.</Card>
      </div>
      <div className="col-md-4">
        <Card title="Interactiva" interactive tabIndex={0} role="link" aria-label="Abrir campaña Retención">
          Pasa el puntero: elevación 2.
        </Card>
      </div>
      <div className="col-md-4">
        <Card title="Cargando" loading loadingVariant="skeleton" skeletonRows={3} loadingLabel="Cargando métricas">
          Contenido real
        </Card>
      </div>
      <div className="col-md-4">
        <Card title="Cargando (overlay)" loading loadingLabel="Actualizando">Contenido que se recalcula.</Card>
      </div>
    </div>
  ),
}

export const CasoReal: Story = {
  name: 'Caso real: campaña bajo la meta',
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Card
        title="Retención Fibra"
        subtitle="Cierre del día"
        actions={<Badge variant="warning" soft dot>Bajo la meta</Badge>}
        footer={<Button size="sm" startIcon="phone-call">Reasignar agentes</Button>}
      >
        <div className="d-flex justify-content-between mb-2">
          <span>Contactabilidad</span>
          <span className="gcu-tabular fw-semibold">68 % · meta 75 %</span>
        </div>
        <Progress value={68} variant="warning" label="Contactabilidad" />
      </Card>
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Card
        title="Llamadas abandonadas en la cola de soporte"
        actions={<Button size="sm" variant="light-brand">Ver detalle</Button>}
        onRefresh={() => {}}
      >
        42 abandonadas · −8 frente a ayer
      </Card>
    </div>
  ),
}
