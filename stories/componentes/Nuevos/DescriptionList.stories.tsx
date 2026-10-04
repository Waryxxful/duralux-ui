import type { Meta, StoryObj } from '@storybook/react-vite'
import { DescriptionList } from '../../../src'
import { conAncho, TresTemas } from './soporte'

const items = [
  { label: 'Cliente', value: 'Comercial Andes SpA' },
  { label: 'RUT', value: '76.123.456-7', mono: true },
  { label: 'Ejecutivo', value: 'Camila Rojas' },
  { label: 'Teléfono', value: null },
  { label: 'Campaña', value: 'Cobranza temprana' },
  { label: 'Webhook', value: 'https://api.ejemplo.cl/hooks/llamadas', mono: true, span: 2 as const },
]

const meta: Meta<typeof DescriptionList> = {
  title: 'Componentes/Nuevos/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  args: { items, columns: 2 },
  argTypes: { columns: { control: 'inline-radio', options: [1, 2, 3] }, loading: { control: 'boolean' } },
  parameters: {
    docs: { description: { component: 'Pares etiqueta/valor en 1 a 3 columnas según el ancho del contenedor (2 desde 28rem, 3 desde 42rem). Los valores vacíos se muestran como «—» y se anuncian como «Sin dato».' } },
  },
  decorators: [conAncho(640)],
}
export default meta
type Story = StoryObj<typeof DescriptionList>

export const Playground: Story = {}

export const UnaColumna: Story = { name: 'Una columna', args: { columns: 1 } }

export const TresColumnas: Story = { name: 'Tres columnas', args: { columns: 3 }, parameters: { maxWidth: 'none' } }

export const Carga: Story = { args: { loading: true } }

export const ContenedorAngosto: Story = { name: 'Contenedor angosto (320 px)', parameters: { maxWidth: 320 } }

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => <TresTemas>{() => <DescriptionList items={items.slice(0, 4)} />}</TresTemas>,
}
