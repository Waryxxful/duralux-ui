import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Alert, Button } from '../../../src'

const meta: Meta<typeof Alert> = {
  title: 'Componentes/Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: {
    variant: 'info',
    icon: 'feather-info',
    title: 'Sincronización en curso.',
    children: 'Los indicadores se actualizan cada 5 minutos.',
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'light', 'dark'] },
    icon: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Mensaje en línea sobre la superficie suave del tono. El color nunca va solo: acompáñalo de `title` o `icon`. Usa `announce` cuando el mensaje aparece tras una acción (región `status`). Para feedback efímero usa `Toast`; para una sección sin datos, `EmptyState`.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Alert>

export const Playground: Story = {}

export const Tonos: Story = {
  name: 'Tonos semánticos',
  render: () => (
    <div className="d-flex flex-column gap-3">
      <Alert variant="success" icon="feather-check-circle" title="Campaña publicada.">Los agentes ya pueden marcar.</Alert>
      <Alert variant="warning" icon={<IconAlertTriangle />} title="Cola cerca del umbral.">Nivel de servicio en 78 % · meta 80 %.</Alert>
      <Alert variant="danger" icon="feather-x-circle" title="No se pudo importar la base.">Revisa el formato de la columna «RUT» y vuelve a intentarlo.</Alert>
      <Alert variant="info" icon="feather-info" title="Mantención programada.">El sábado 23-09-2026 a las 22:00 h.</Alert>
      <Alert variant="primary" icon="feather-star" title="Nuevo tablero disponible.">Compara periodos desde el selector de fechas.</Alert>
    </div>
  ),
}

export const Suaves: Story = {
  name: 'Suave canónico (borde punteado)',
  render: () => (
    <div className="d-flex flex-column gap-3">
      {(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'light', 'dark'] as const).map((tone) => (
        <Alert key={tone} variant={tone} soft title={`Tono ${tone}.`}>Texto legible sobre la superficie suave en los tres temas.</Alert>
      ))}
    </div>
  ),
}

export const Descartable: Story = {
  name: 'Descartable y con acción',
  render: () => (
    <Alert variant="warning" icon="feather-alert-triangle" title="Hay 3 agentes en pausa prolongada." onDismiss={() => {}}>
      <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
        <span>Superan los 15 minutos permitidos.</span>
        <Button size="sm" variant="light-brand">Ver agentes</Button>
      </div>
    </Alert>
  ),
}
