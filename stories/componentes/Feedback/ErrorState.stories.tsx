import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ErrorState } from '../../../src'

const meta: Meta<typeof ErrorState> = {
  title: 'Componentes/Feedback/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
  args: {
    title: 'No se pudo cargar el tablero',
    message: 'La fuente no respondió a tiempo. Tus filtros se mantienen.',
    retryLabel: 'Reintentar',
    onRetry: () => {},
  },
  parameters: {
    docs: {
      description: {
        component: 'Qué pasó, qué hacer y botón para reintentar; se anuncia como `alert`. Nunca pierdas lo que la persona escribió. `error` acepta un `Error` y se registra con `log.error` (prefijo `[duralux]`).',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ErrorState>

export const Playground: Story = {}

function Retrying() {
  const [retrying, setRetrying] = useState(false)
  return (
    <div className="card">
      <ErrorState
        title="No se pudieron cargar las grabaciones"
        message="Revisa tu conexión e inténtalo de nuevo."
        retrying={retrying}
        onRetry={() => { setRetrying(true); setTimeout(() => setRetrying(false), 1500) }}
        action={<Button size="sm" variant="link">Contactar soporte</Button>}
      />
    </div>
  )
}

export const ConReintento: Story = {
  name: 'Caso real: reintento en curso',
  render: () => <Retrying />,
}

export const Compacto: Story = {
  name: 'Compacto en card angosta',
  render: () => (
    <div className="card" style={{ maxWidth: '18rem' }}>
      <ErrorState compact title="Sin conexión" message="Los datos se actualizarán al reconectar." onRetry={() => {}} />
    </div>
  ),
}
