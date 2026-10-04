import type { Meta, StoryObj } from '@storybook/react-vite'
import type * as React from 'react'
import { useState } from 'react'
import { ConnectionCard } from '../../../src'

const Logo = ({ icon }: { icon: string }) => (
  <span className="gcu-stat__icon gcu-stat__icon--neutral"><i className={icon} aria-hidden="true" /></span>
)

function Controlled(props: Partial<React.ComponentProps<typeof ConnectionCard>>) {
  const [checked, setChecked] = useState(Boolean(props.checked))
  return (
    <ConnectionCard
      icon={<Logo icon="feather-slack" />}
      title="Slack"
      description="Envía alertas de colas sin agentes al canal del equipo."
      {...props}
      checked={checked}
      onChange={setChecked}
    />
  )
}

const meta: Meta<typeof ConnectionCard> = {
  title: 'Componentes/Indicadores/ConnectionCard',
  component: ConnectionCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Integración con switch. El switch se nombra con el título; si está deshabilitado, `disabledReason` explica por qué. Responde a su contenedor: en angosto la descripción ocupa hasta dos líneas.',
      },
    },
  },
  decorators: [(Story, ctx) => <div style={{ maxWidth: ctx.parameters.maxWidth ?? 560 }}><Story /></div>],
  render: args => <Controlled {...args} />,
}
export default meta
type Story = StoryObj<typeof ConnectionCard>

export const Playground: Story = { args: { checked: true } }

export const Estados: Story = {
  render: () => (
    <div>
      <Controlled checked />
      <Controlled icon={<Logo icon="feather-calendar" />} title="Google Calendar" description="Agenda las promesas de pago como eventos." />
      <Controlled icon={<Logo icon="feather-message-circle" />} title="WhatsApp Business" description="Mensajes salientes a clientes." disabled disabledReason="Requiere un número verificado por un administrador." />
    </div>
  ),
}

export const ContenedorAngosto: Story = {
  name: 'Contenedor angosto (320 px)',
  parameters: { maxWidth: 320 },
  args: { checked: false },
}
