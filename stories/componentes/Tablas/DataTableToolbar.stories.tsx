import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, DataTableToolbar, Table } from '../../../src'

const meta: Meta<typeof DataTableToolbar> = {
  title: 'Componentes/Tablas/DataTableToolbar',
  component: DataTableToolbar,
  tags: ['autodocs'],
  args: {
    searchLabel: 'Buscar campañas',
    searchPlaceholder: 'Nombre, cola o ID',
    pageSize: 10,
    pageSizeOptions: [10, 25, 50],
  },
  parameters: {
    docs: {
      description: {
        component: 'Barra sobre una tabla: búsqueda (landmark `search`), filas por página y acciones propias en una fila, con controles de 36 px alineados. Responde a su contenedor: por debajo de 36rem cada bloque ocupa el ancho completo.',
      },
    },
  },
  // El ancho máximo va en la card (parameters.maxWidth) para probar el contexto angosto real.
  decorators: [(Story, context) => <div className="card" style={{ maxWidth: context.parameters.maxWidth }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof DataTableToolbar>

export const Playground: Story = {}

export const ConAcciones: Story = {
  name: 'Con acciones',
  args: {
    children: (
      <>
        <Button variant="light-brand" startIcon="download">Exportar reporte</Button>
        <Button startIcon="plus">Nueva campaña</Button>
      </>
    ),
  },
}

export const SobreTabla: Story = {
  name: 'Caso real: sobre una tabla',
  render: (args) => (
    <>
      <DataTableToolbar {...args}>
        <Button variant="light-brand" startIcon="download">Exportar reporte</Button>
      </DataTableToolbar>
      <Table
        aria-label="Campañas"
        density="compact"
        columns={[
          { key: 'nombre', header: 'Campaña' },
          { key: 'cola', header: 'Cola' },
          { key: 'llamadas', header: 'Llamadas', numeric: true },
        ]}
        rows={[
          { id: 1, nombre: 'Cobranza Q4', cola: 'Cobranza temprana', llamadas: '12.480' },
          { id: 2, nombre: 'Retención Fibra', cola: 'Retención', llamadas: '6.342' },
        ]}
        rowKey="id"
      />
    </>
  ),
}

export const Angosta: Story = {
  name: 'Contenedor angosto',
  args: { children: <Button variant="light-brand" startIcon="download">Exportar</Button> },
  parameters: { maxWidth: 360 },
}
