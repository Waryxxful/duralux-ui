import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChoiceCard, Fieldset } from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta<typeof ChoiceCard> = {
  title: 'Componentes/Nuevos/ChoiceCard',
  component: ChoiceCard,
  tags: ['autodocs'],
  args: { title: 'Plan Pro', description: 'Agentes ilimitados y grabación de llamadas', icon: 'zap', type: 'radio', name: 'sb-plan' },
  argTypes: { type: { control: 'inline-radio', options: ['radio', 'checkbox'] } },
  parameters: {
    docs: {
      description: {
        component: 'Opción seleccionable con forma de tarjeta. El control es el input nativo (radio o checkbox) y toda la tarjeta es su etiqueta. Seleccionada: borde y fondo de marca más el control marcado (nunca solo color).',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ChoiceCard>

export const Playground: Story = {}

export const Planes: Story = {
  name: 'Caso real: elegir plan (radio) y canales (checkbox)',
  render: () => (
    <div className="d-flex flex-column gap-4">
      <Fieldset legend="Plan" columns={2}>
        <ChoiceCard name="plan" value="basico" title="Básico" description="Hasta 10 agentes" icon="user" />
        <ChoiceCard name="plan" value="pro" title="Pro" description="Agentes ilimitados" icon="users" defaultChecked />
        <ChoiceCard name="plan" value="enterprise" title="Enterprise" description="Solo con contrato anual" icon="briefcase" disabled />
      </Fieldset>
      <Fieldset legend="Canales habilitados" columns={2}>
        <ChoiceCard type="checkbox" title="Voz" description="Llamadas entrantes y salientes" icon="phone" defaultChecked />
        <ChoiceCard type="checkbox" title="WhatsApp" description="Requiere número verificado" icon="message-circle" error />
      </Fieldset>
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }} className="d-grid gap-2">
      <ChoiceCard name="angosto" title="Reporte diario con detalle de cada agente" description="Llega cada mañana a los supervisores de la cola." icon="file-text" defaultChecked />
      <ChoiceCard name="angosto" title="Solo resumen" description="Una línea por cola." icon="list" />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  render: () => (
    <TresTemas>
      {(tema) => (
        <div className="d-grid gap-2">
          <ChoiceCard name={`tema-${tema}`} title="Seleccionada" description={tema} icon="check-circle" defaultChecked />
          <ChoiceCard name={`tema-${tema}`} title="Sin seleccionar" description={tema} icon="circle" />
        </div>
      )}
    </TresTemas>
  ),
}
