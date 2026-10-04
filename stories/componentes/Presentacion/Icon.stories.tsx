import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconRobot, IconSparkles } from '@tabler/icons-react'
import { Icon } from '../../../src'

const meta: Meta<typeof Icon> = {
  title: 'Componentes/Presentación/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: { name: 'phone-call', size: 'lg' },
  argTypes: { size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] } },
  parameters: {
    docs: {
      description: {
        component: 'Glifo Feather (`name`) o SVG Tabler (`icon`), alineado ópticamente con el texto. Sin `aria-label` es decorativo; con `aria-label` se anuncia como imagen. Con `icon` conserva `style`, `className` y atributos extra.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Icon>

export const Playground: Story = {}

export const Tamanos: Story = {
  name: 'Tamaños',
  render: () => (
    <div className="d-flex gap-3 align-items-center">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => <Icon key={size} name="bell" size={size} />)}
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => <Icon key={`t-${size}`} icon={<IconRobot />} size={size} />)}
    </div>
  ),
}

export const ConTexto: Story = {
  name: 'Junto a texto',
  render: () => (
    <div className="d-grid gap-2">
      <span className="d-inline-flex align-items-center gap-2"><Icon name="phone-call" /> 1.240 llamadas</span>
      <span className="d-inline-flex align-items-center gap-2" style={{ color: 'var(--gcu-primary-text)' }}><Icon icon={<IconSparkles />} /> Resumen con IA</span>
      <span className="d-inline-flex align-items-center gap-2"><Icon name="alert-triangle" aria-label="Advertencia" className="text-warning" /> Cola sin agentes libres</span>
    </div>
  ),
}
