import type { Meta, StoryObj } from '@storybook/react-vite'
import { ApprovalCard } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof ApprovalCard> = {
  title: 'IA/Agente/ApprovalCard',
  component: ApprovalCard,
  tags: ['autodocs'],
  args: {
    title: 'Enviar correo de seguimiento a 12 clientes',
    description: 'Clientes con reclamo abierto hace más de 48 horas en la cola de Cobranza.',
    tool: 'send_followup_email',
    intentId: 'accion-7',
    params: { plantilla: 'seguimiento_reclamo', destinatarios: 12 },
    onApprove: () => {},
    onReject: () => {},
  },
  argTypes: { status: { control: 'inline-radio', options: [undefined, 'pending', 'approved', 'rejected'] } },
  parameters: {
    docs: { description: { component: 'Aprobación humana antes de una acción con efecto. **El componente nunca ejecuta:** muestra qué se hará y emite la intención con `onApprove(intent)` u `onReject(intent)`. La ejecución y la autorización ocurren en el servidor.' } },
  },
  decorators: [conAncho(520)],
}
export default meta
type Story = StoryObj<typeof ApprovalCard>

export const Playground: Story = {}

export const ConDetalle: Story = {
  name: 'Con detalle de lo que se hará',
  args: {
    children: (
      <ul className="mb-0 ps-3">
        <li>Plantilla «Seguimiento de reclamo» con número de caso.</li>
        <li>Se envía desde la casilla de Atención al cliente.</li>
        <li>Los clientes que ya respondieron quedan fuera.</li>
      </ul>
    ),
    showParams: true,
  },
}

export const Destructiva: Story = {
  args: {
    title: 'Cerrar 30 casos sin respuesta del cliente',
    description: 'Esta acción no se puede deshacer. Los clientes recibirán un aviso de cierre.',
    tool: 'close_cases',
    destructive: true,
    approveLabel: 'Cerrar 30 casos',
  },
}

export const Bloqueada: Story = { args: { disabledReason: 'No tienes permiso para enviar correos masivos. Pide la aprobación a tu supervisor.' } }
export const Aprobada: Story = { args: { status: 'approved' } }
export const Descartada: Story = { args: { status: 'rejected' } }
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }
