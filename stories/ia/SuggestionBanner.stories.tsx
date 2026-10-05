import type { Meta, StoryObj } from '@storybook/react-vite'
import { SuggestionBanner } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof SuggestionBanner> = {
  title: 'IA/Conversación/SuggestionBanner',
  component: SuggestionBanner,
  tags: ['autodocs'],
  args: {
    title: 'Mueve 3 ejecutivos de Ventas a Cobranza entre 10:00 y 13:00',
    basis: 'Cobranza tiene 18 llamadas en espera y nivel de servicio de 71 %; Ventas, 2 en espera y 92 %.',
    applyLabel: 'Revisar propuesta',
    onApply: () => {},
    onDismiss: () => {},
    variant: 'inline',
  },
  argTypes: { variant: { control: 'inline-radio', options: ['inline', 'floating'] } },
  parameters: { docs: { description: { component: 'Sugerencia del asistente con su fundamento. Nunca ejecuta: «Aplicar» emite la intención y, si tiene efecto de negocio, la app abre ApprovalCard.' } } },
  decorators: [conAncho(720)],
}
export default meta
type Story = StoryObj<typeof SuggestionBanner>

export const Playground: Story = {}
export const Flotante: Story = { args: { variant: 'floating' } }
export const Angosto: Story = { name: 'Contenedor angosto', parameters: { maxWidth: 320 } }
