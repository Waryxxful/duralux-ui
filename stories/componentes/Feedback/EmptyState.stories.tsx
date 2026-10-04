import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconUsersGroup } from '@tabler/icons-react'
import { Button, EmptyState } from '../../../src'

const meta: Meta<typeof EmptyState> = {
  title: 'Componentes/Feedback/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    icon: 'search',
    title: 'Nadie coincide con la búsqueda',
    message: 'Prueba con otro rol o cuenta.',
  },
  parameters: {
    docs: {
      description: {
        component: 'Dice qué pasó y qué probar: ícono, título, una línea de explicación y la acción siguiente. Nunca una tabla vacía muda. Las acciones se apilan en contenedores angostos y van en fila desde 28rem (container query).',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof EmptyState>

export const Playground: Story = {
  args: { action: <Button variant="light-brand" startIcon="x">Limpiar filtros</Button> },
}

export const PrimerUso: Story = {
  name: 'Primer uso (con acción primaria)',
  args: {
    icon: <IconUsersGroup />,
    title: 'Todavía no hay equipos',
    message: 'Crea un equipo para asignar colas y supervisores.',
    action: <Button startIcon="plus">Crear equipo</Button>,
    secondaryAction: <Button variant="light-brand">Importar desde CSV</Button>,
  },
}

export const EnTabla: Story = {
  name: 'Caso real: tabla vacía',
  render: () => (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead><tr><th>Agente</th><th>Cola</th><th className="text-end">Llamadas</th></tr></thead>
          <tbody>
            <tr>
              <td colSpan={3}>
                <EmptyState
                  compact
                  icon="phone-off"
                  title="Sin llamadas en este periodo"
                  message="Cambia el rango de fechas o revisa otra cola."
                  action={<Button size="sm" variant="light-brand" startIcon="calendar">Cambiar rango</Button>}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (acciones apiladas)',
  render: () => (
    <div className="card" style={{ maxWidth: '18rem' }}>
      <EmptyState
        compact
        icon="bell-off"
        title="Sin notificaciones"
        message="Te avisaremos cuando una cola supere su umbral."
        action={<Button size="sm">Configurar alertas</Button>}
        secondaryAction={<Button size="sm" variant="light-brand">Ver historial</Button>}
      />
    </div>
  ),
}
