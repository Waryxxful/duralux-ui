import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton, Kbd, Tooltip } from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta<typeof Tooltip> = {
  title: 'Componentes/Nuevos/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { content: 'Exporta el reporte en CSV', placement: 'top', delay: 500 },
  argTypes: { placement: { control: 'inline-radio', options: ['top', 'bottom', 'start', 'end'] } },
  parameters: {
    docs: {
      description: {
        component: 'Texto breve que complementa a un control; nunca la única fuente de la información. Craft «Hover Restraint»: el primero espera 400–700 ms y los vecinos aparecen al instante. Aparece con el foco de teclado, Esc lo cierra y el disparador lleva `aria-describedby` mientras se ve.',
      },
    },
  },
  render: (args) => (
    <div className="p-5">
      <Tooltip {...args}><IconButton icon="download" label="Exportar reporte" /></Tooltip>
    </div>
  ),
}
export default meta
type Story = StoryObj<typeof Tooltip>

export const Playground: Story = {}

export const Abierto: Story = {
  name: 'Visible (solo uno a la vez)',
  render: () => (
    <div className="d-flex flex-wrap gap-5 p-5 justify-content-center">
      <Tooltip content="Sube la prioridad del caso" defaultOpen><IconButton icon="arrow-up" label="Subir prioridad" /></Tooltip>
      <Tooltip content="Baja la prioridad del caso" placement="bottom"><IconButton icon="arrow-down" label="Bajar prioridad" /></Tooltip>
    </div>
  ),
}

export const BarraDeAcciones: Story = {
  name: 'Caso real: barra de acciones (vecinos al instante)',
  render: () => (
    <div className="d-flex gap-2 p-5">
      <Tooltip content="Editar campaña"><IconButton icon="edit-2" label="Editar campaña" /></Tooltip>
      <Tooltip content="Duplicar campaña"><IconButton icon="copy" label="Duplicar campaña" /></Tooltip>
      <Tooltip content={<>Buscar <Kbd keys={['Ctrl', 'K']} /></>}><IconButton icon="search" label="Buscar" /></Tooltip>
      <Tooltip content="Archivar: deja de recibir llamadas"><IconButton icon="archive" label="Archivar campaña" /></Tooltip>
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }} className="p-4">
      <Tooltip content="El texto largo se ajusta al ancho disponible sin salirse de la pantalla." placement="bottom" defaultOpen>
        <IconButton icon="info" label="Más información" />
      </Tooltip>
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  render: () => (
    <TresTemas>
      {(tema) => (
        <div className="p-4 pb-5">
          <Tooltip content={`Tooltip en ${tema}`} placement="bottom" defaultOpen>
            <IconButton icon="help-circle" label={`Ayuda (${tema})`} />
          </Tooltip>
        </div>
      )}
    </TresTemas>
  ),
}
