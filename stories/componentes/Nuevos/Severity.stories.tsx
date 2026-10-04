import type { Meta, StoryObj } from '@storybook/react-vite'
import { Severity, severityOf } from '../../../src'
import { conAncho, Fila, TresTemas } from './soporte'

const meta: Meta<typeof Severity> = {
  title: 'Componentes/Nuevos/Severity',
  component: Severity,
  tags: ['autodocs'],
  args: { level: 'critical', label: 'SLA vencido', size: 'md' },
  argTypes: {
    level: { control: 'inline-radio', options: ['critical', 'warning', 'normal'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'Marcador de severidad con forma propia (rombo crítico, anillo de advertencia, punto normal) y etiqueta. La forma distingue el nivel sin depender del color. `severityOf(valor, umbrales)` deduce el nivel a partir de una métrica.',
      },
    },
  },
  decorators: [conAncho()],
}
export default meta
type Story = StoryObj<typeof Severity>

export const Playground: Story = {}

export const Niveles: Story = {
  render: () => (
    <div className="d-flex flex-wrap gap-3">
      <Severity level="critical" />
      <Severity level="warning" />
      <Severity level="normal" />
    </div>
  ),
}

export const Tamanos: Story = {
  name: 'Tamaños y solo marcador',
  render: () => (
    <div className="d-flex flex-wrap align-items-center gap-3">
      <Severity level="warning" size="sm" label="Cola alta" />
      <Severity level="warning" size="md" label="Cola alta" />
      <Severity level="critical" label={false} />
    </div>
  ),
}

export const DesdeUmbrales: Story = {
  name: 'Calculado con severityOf',
  render: () => (
    <ul className="list-unstyled d-grid gap-2 mb-0">
      {[92, 78, 61].map((nivel) => (
        <li key={nivel} className="d-flex justify-content-between">
          <span>Nivel de servicio {nivel} %</span>
          <Severity level={severityOf(nivel, { warning: 80, critical: 70 })} size="sm" />
        </li>
      ))}
      {[4.1, 7.8].map((abandono) => (
        <li key={abandono} className="d-flex justify-content-between">
          <span>Abandono {String(abandono).replace('.', ',')} %</span>
          <Severity level={severityOf(abandono, { warning: 5, critical: 8, higherIsWorse: true })} size="sm" />
        </li>
      ))}
    </ul>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  parameters: { maxWidth: 'none' },
  render: () => (
    <TresTemas>
      {() => (
        <Fila min="6rem">
          <Severity level="critical" />
          <Severity level="warning" />
          <Severity level="normal" />
        </Fila>
      )}
    </TresTemas>
  ),
}
