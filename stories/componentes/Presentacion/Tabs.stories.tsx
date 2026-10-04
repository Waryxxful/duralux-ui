import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, Tabs } from '../../../src'

const TABS = [
  { key: 'resumen', label: 'Resumen', content: <p className="mt-3 mb-0">1.240 llamadas atendidas hoy · +12 % frente a ayer.</p> },
  { key: 'colas', label: 'Colas', content: <p className="mt-3 mb-0">3 colas activas; soporte con 8 llamadas en espera.</p> },
  { key: 'agentes', label: 'Agentes', content: <p className="mt-3 mb-0">42 agentes conectados, 5 en pausa.</p> },
  { key: 'historial', label: 'Historial', content: <p className="mt-3 mb-0">Últimos 30 días.</p>, disabled: true },
]

const meta: Meta<typeof Tabs> = {
  title: 'Componentes/Presentación/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: { tabs: TABS, ariaLabel: 'Secciones del tablero' },
  parameters: {
    docs: {
      description: {
        component: 'Patrón APG: flechas izquierda/derecha, Home y End mueven foco y selección; las pestañas deshabilitadas se saltan. Controlado (`activeKey` + `onChange`) o no controlado. El indicador se desliza con transform y respeta reduced-motion; el hover es instantáneo.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Tabs>

export const Playground: Story = {}

export const Controladas: Story = {
  render: function Controlled() {
    const [active, setActive] = useState<string | number>('colas')
    return (
      <div>
        <Tabs tabs={TABS} activeKey={active} onChange={setActive} aria-label="Secciones controladas" />
        <p className="text-muted fs-12 mt-2 mb-0">Pestaña activa: {String(active)}</p>
      </div>
    )
  },
}

export const ConIconos: Story = {
  name: 'Con íconos',
  args: {
    tabs: [
      { key: 'llamadas', label: 'Llamadas', icon: 'feather-phone', content: <p className="mt-3 mb-0">Detalle de llamadas.</p> },
      { key: 'chats', label: 'Chats', icon: 'feather-message-circle', content: <p className="mt-3 mb-0">Detalle de chats.</p> },
      { key: 'correos', label: 'Correos', icon: 'feather-mail', content: <p className="mt-3 mb-0">Detalle de correos.</p> },
    ],
    ariaLabel: 'Canales',
  },
}

export const CasoReal: Story = {
  name: 'Caso real: dentro de una card',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Card title="Operación del contact center">
        <Tabs tabs={TABS} aria-label="Vistas de operación" />
      </Card>
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Tabs
        aria-label="Secciones en angosto"
        tabs={[
          ...TABS,
          { key: 'calidad', label: 'Calidad', content: <p className="mt-3 mb-0">Evaluaciones.</p> },
          { key: 'ia', label: 'Asistente', content: <p className="mt-3 mb-0">Resúmenes.</p> },
        ]}
      />
    </div>
  ),
}
