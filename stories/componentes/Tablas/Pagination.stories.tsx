import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pagination, Table } from '../../../src'
import type { PaginationProps } from '../../../src'

/** Pagination controlada: la story conserva la página elegida. */
function Controlada(props: Omit<PaginationProps, 'onPageChange'> & { onPageChange?: PaginationProps['onPageChange'] }) {
  const [page, setPage] = useState(props.page)
  return (
    <Pagination
      {...props}
      page={page}
      onPageChange={(next) => {
        setPage(next)
        props.onPageChange?.(next)
      }}
    />
  )
}

const meta: Meta<typeof Pagination> = {
  title: 'Componentes/Tablas/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: { page: 3, totalPages: 25, pageSize: 10, totalItems: 248, sibling: 1 },
  argTypes: {
    sibling: { control: { type: 'number', min: 0, max: 3 } },
  },
  render: (args) => <Controlada key={`${args.page}-${args.totalPages}`} {...args} />,
  parameters: {
    docs: {
      description: {
        component: 'Navegación entre páginas: botones de 32 px, página actual con `aria-current="page"`, cifras tabulares y rango visible («11–20 de 248») cuando recibe `pageSize` y `totalItems`. Al cambiar de página el foco queda en la página nueva. Con una sola página no se muestra.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Pagination>

export const Playground: Story = {}

export const SinRango: Story = {
  name: 'Sin rango (solo páginas)',
  args: { pageSize: undefined, totalItems: undefined, page: 1, totalPages: 5 },
}

export const MilesDeRegistros: Story = {
  name: 'Miles de registros (ventana acotada)',
  args: { page: 412, totalPages: 1240, pageSize: 25, totalItems: 30984 },
}

export const PieDeTabla: Story = {
  name: 'Caso real: pie de tabla',
  render: () => (
    <div className="card">
      <Table
        aria-label="Agentes conectados"
        columns={[
          { key: 'agente', header: 'Agente' },
          { key: 'cola', header: 'Cola' },
          { key: 'llamadas', header: 'Llamadas', numeric: true },
        ]}
        rows={[
          { id: 1, agente: 'Ana Rojas', cola: 'Cobranza', llamadas: 48 },
          { id: 2, agente: 'Luis Pérez', cola: 'Retención', llamadas: 37 },
          { id: 3, agente: 'Carla Soto', cola: 'Ventas', llamadas: 52 },
        ]}
        rowKey="id"
      />
      <div className="card-footer d-flex justify-content-end">
        <Controlada page={1} totalPages={16} pageSize={3} totalItems={48} aria-label="Paginación de agentes conectados" />
      </div>
    </div>
  ),
}

export const Angosta: Story = {
  name: 'Contenedor angosto',
  decorators: [Story => <div className="card p-3" style={{ maxWidth: 360 }}><Story /></div>],
}
