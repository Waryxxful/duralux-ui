import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, InsightCard } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'
import { SERIE_NS } from './datosAgente'

const meta: Meta<typeof InsightCard> = {
  title: 'IA/Contenido/InsightCard',
  component: InsightCard,
  tags: ['autodocs'],
  args: {
    label: 'Nivel de servicio · Cobranza',
    value: '86 %',
    delta: { value: '+4 pts', direction: 'up', good: true },
    series: SERIE_NS,
    seriesLabel: 'Últimos 8 días, de 78 % a 86 %. Meta 80 %.',
    note: 'Subió porque desde el martes 4 agentes de Retención apoyan Cobranza entre 10:00 y 12:00, el tramo con más espera [1].',
    sources: '[1] Métricas de colas por hora, 01-10-2026 a 08-10-2026.',
  },
  parameters: {
    docs: { description: { component: 'Métrica con variación, tendencia y explicación del asistente. La variación lleva flecha y signo; el tono dice si es buena o mala. Sin fuentes, la tarjeta lo dice.' } },
  },
  decorators: [conAncho(360)],
}
export default meta
type Story = StoryObj<typeof InsightCard>

export const Playground: Story = {}
export const Desfavorable: Story = {
  args: {
    label: 'Tiempo medio de operación · Soporte',
    value: '6:48',
    delta: { value: '+0:36', direction: 'up', good: false },
    series: [372, 380, 365, 390, 401, 395, 408],
    seriesLabel: 'Últimos 7 días, de 6:12 a 6:48.',
    note: 'Aumentó por la nueva validación de identidad en llamadas de cambio de plan, que suma cerca de 30 segundos.',
    action: <Button variant="light-brand" size="sm">Ver llamadas afectadas</Button>,
  },
}
export const SinFuentes: Story = { name: 'Sin fuentes', args: { sources: undefined } }
export const ContenedorAngosto: Story = { name: 'Contenedor angosto (280 px)', parameters: { maxWidth: 280 } }
