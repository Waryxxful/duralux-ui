import type { Meta, StoryObj } from '@storybook/react-vite'
import { TargetBar } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const minutos = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`

const meta: Meta<typeof TargetBar> = {
  title: 'Dominios/Operación/TargetBar',
  component: TargetBar,
  tags: ['autodocs'],
  args: { label: 'Nivel de servicio', value: 76, target: 80, hint: '80/20' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    higherIsWorse: { control: 'boolean' },
    warningMargin: { control: { type: 'number', step: 0.05 } },
  },
  parameters: {
    docs: { description: { component: 'Cifra contra su meta con `role="meter"`. El estado va en texto con forma: cumple, cerca del umbral (10 % por defecto) o fuera. `higherIsWorse` invierte la lectura (abandono, TMO).' } },
  },
  decorators: [conAncho(360)],
}
export default meta
type Story = StoryObj<typeof TargetBar>

export const Playground: Story = {}

export const Variantes: Story = {
  name: 'Tablero de metas',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gcu-space-5)' }}>
      <TargetBar label="Nivel de servicio" value={84} target={80} hint="80/20" />
      <TargetBar label="Resolución en el primer contacto" value={66} target={70} hint="+2 pts vs. ayer" />
      <TargetBar label="Abandono" value={7.8} target={5} max={15} higherIsWorse hint="Máximo de la operación" />
      <TargetBar label="TMO" value={312} target={300} max={600} higherIsWorse format={minutos} hint="Campaña Ventas móvil" />
    </div>
  ),
}
