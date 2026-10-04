import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, EntityCard, Severity } from '../../../src'
import { conAncho, Fila, TresTemas } from './soporte'

const stats = [
  { label: 'Ejecutivos', value: 24 },
  { label: 'Llamadas hoy', value: '2.840' },
  { label: 'Nivel de servicio', value: '86 %' },
]

const meta: Meta<typeof EntityCard> = {
  title: 'Componentes/Nuevos/EntityCard',
  component: EntityCard,
  tags: ['autodocs'],
  args: {
    title: 'Comercial Andes SpA',
    subtitle: 'Cliente desde 2021 · Santiago',
    name: 'Comercial Andes',
    stats,
    chips: <Badge variant="success" soft>Activo</Badge>,
    href: '#cliente',
  },
  argTypes: { inactive: { control: 'boolean' } },
  parameters: {
    docs: { description: { component: 'Tarjeta de una entidad del directorio (cliente, campaña, equipo). Con `href` u `onClick` toda la tarjeta es interactiva; un `inactive` la atenúa y lo anuncia.' } },
  },
  decorators: [conAncho(360)],
}
export default meta
type Story = StoryObj<typeof EntityCard>

export const Playground: Story = {}

export const Directorio: Story = {
  parameters: { maxWidth: 'none' },
  render: () => (
    <Fila>
      <EntityCard title="Comercial Andes SpA" subtitle="Santiago" name="Comercial Andes" stats={stats.slice(0, 2)} chips={<Severity level="normal" size="sm" />} href="#andes" />
      <EntityCard title="Seguros Pacífico" subtitle="Valparaíso" name="Seguros Pacífico" stats={stats.slice(0, 2)} chips={<Severity level="warning" size="sm" label="Cola alta" />} onClick={() => {}} />
      <EntityCard title="Distribuidora Sur" subtitle="Concepción" name="Distribuidora Sur" stats={stats.slice(0, 2)} inactive footer="Contrato terminado en agosto" />
    </Fila>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <EntityCard title="Comercial Andes SpA" subtitle="Santiago" name="Comercial Andes" stats={stats.slice(0, 2)} href="#andes" />}</TresTemas>,
}
