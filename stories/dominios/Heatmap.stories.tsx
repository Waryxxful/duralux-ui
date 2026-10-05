import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heatmap } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { DIAS, FRANJAS, VOLUMEN } from './datos'

const meta: Meta<typeof Heatmap> = {
  title: 'Dominios/Operación/Heatmap',
  component: Heatmap,
  tags: ['autodocs'],
  args: { label: 'Llamadas entrantes por día y hora', rows: DIAS, cols: FRANJAS, values: VOLUMEN },
  parameters: {
    docs: { description: { component: 'Mapa de calor como tabla accesible: caption, encabezados de fila y columna, cifra en cada celda, escala de 5 niveles con leyenda y el máximo marcado con borde.' } },
  },
  decorators: [conAncho('none')],
}
export default meta
type Story = StoryObj<typeof Heatmap>

export const Playground: Story = {}

export const Abandono: Story = {
  name: 'Abandono por franja (%)',
  args: {
    label: 'Abandono por franja',
    rows: ['Soporte hogar', 'Ventas móvil', 'Retención'],
    cols: ['09:00', '11:00', '13:00', '15:00', '17:00'],
    values: [[3.1, 4.8, 6.2, 5.4, null], [2.4, 7.9, 9.6, 6.1, 4.2], [1.8, 2.6, 3.9, 3.2, 2.1]],
    format: (value: number) => `${value.toLocaleString('es-CL')} %`,
  },
}

export const Angosto: Story = { name: 'Contenedor angosto (desplaza la tabla)', parameters: { maxWidth: 320 } }
