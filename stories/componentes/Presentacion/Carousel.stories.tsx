import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Card, Carousel } from '../../../src'

const capturas = ['Chat web · 10:42', 'WhatsApp · 11:05', 'Chat web · 12:18']
const Diapositiva = ({ titulo }: { titulo: string }) => (
  <div style={{ aspectRatio: '16 / 10', display: 'grid', placeItems: 'center', borderRadius: 'var(--gcu-radius-lg)', background: 'var(--gcu-surface-sunken)', border: '1px solid var(--gcu-border)' }}>
    {titulo}
  </div>
)

const meta: Meta<typeof Carousel> = {
  title: 'Componentes/Presentación/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  args: { 'aria-label': 'Imágenes de la pregunta 3' },
  parameters: {
    docs: { description: { component: 'Diapositivas con scroll-snap nativo: deslizar, flechas (solo donde hay adónde ir), contador y puntos siempre visibles, y la siguiente asoma por el borde. Sin avance automático. Con una diapositiva no muestra controles.' } },
  },
  decorators: [Story => <div style={{ maxWidth: 760 }}><Card><Story /></Card></div>],
}
export default meta
type Story = StoryObj<typeof Carousel>

export const Playground: Story = {
  render: args => (
    <Carousel {...args} caption={i => `Captura ${i + 1}: respuesta del agente al cliente.`} actions={<Button size="sm" variant="light-brand">Ampliar</Button>}>
      {capturas.map(c => <Diapositiva key={c} titulo={c} />)}
    </Carousel>
  ),
}

export const UnaSola: Story = {
  name: 'Una sola imagen',
  render: args => <Carousel {...args}><Diapositiva titulo="Única captura" /></Carousel>,
}

export const ConMiniaturas: Story = {
  name: 'Miniaturas (vista ampliada)',
  render: args => (
    <Carousel {...args} slideSize="100%" thumbnails={capturas.map(c => <Diapositiva key={c} titulo="" />)}>
      {capturas.map(c => <Diapositiva key={c} titulo={c} />)}
    </Carousel>
  ),
}
