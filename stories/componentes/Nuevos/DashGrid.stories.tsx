import type * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DashGrid } from '../../../src'
import { conAncho } from './soporte'

function Celda({ children }: { children: React.ReactNode }) {
  return (
    <div className="card mb-0 h-100">
      <div className="card-body text-center text-muted">{children}</div>
    </div>
  )
}

const meta: Meta<typeof DashGrid> = {
  title: 'Componentes/Nuevos/DashGrid',
  component: DashGrid,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Grilla de 12 columnas con filas permitidas: 12, 8+4, 7+5, 6+6, 4+4+4 y 3+3+3+3. Una fila no permitida se avisa por consola. Las celdas se apilan en contenedores angostos.' } },
  },
  decorators: [conAncho('none')],
}
export default meta
type Story = StoryObj<typeof DashGrid>

export const FilasPermitidas: Story = {
  name: 'Filas permitidas',
  render: () => (
    <DashGrid>
      <DashGrid.Row layout={[12]}><Celda>12</Celda></DashGrid.Row>
      <DashGrid.Row layout={[8, 4]}><Celda>8</Celda><Celda>4</Celda></DashGrid.Row>
      <DashGrid.Row layout={[7, 5]}><Celda>7</Celda><Celda>5</Celda></DashGrid.Row>
      <DashGrid.Row layout={[6, 6]}><Celda>6</Celda><Celda>6</Celda></DashGrid.Row>
      <DashGrid.Row layout={[4, 4, 4]}><Celda>4</Celda><Celda>4</Celda><Celda>4</Celda></DashGrid.Row>
      <DashGrid.Row layout={[3, 3, 3, 3]}><Celda>3</Celda><Celda>3</Celda><Celda>3</Celda><Celda>3</Celda></DashGrid.Row>
    </DashGrid>
  ),
}

export const ContenedorAngosto: Story = {
  name: 'Contenedor angosto (360 px)',
  parameters: { maxWidth: 360 },
  render: FilasPermitidas.render,
}
