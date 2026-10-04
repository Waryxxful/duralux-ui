import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, Switch } from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta<typeof Switch> = {
  title: 'Componentes/Nuevos/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: { label: 'Notificar por correo', size: 'md', disabled: false },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
  parameters: {
    docs: {
      description: {
        component: 'Activa o desactiva algo con efecto inmediato. `<input type="checkbox" role="switch">` nativo: Espacio lo cambia y el estado se expone como `aria-checked`. Etiqueta clicable y descripción asociada. Para opciones que se guardan después, usa Checkbox.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Switch>

export const Playground: Story = {}

export const Estados: Story = {
  name: 'Tamaños y estados',
  render: () => (
    <div className="d-flex flex-column gap-3">
      <Switch label="Apagado" />
      <Switch label="Encendido" defaultChecked />
      <Switch label="Compacto (sm)" size="sm" defaultChecked />
      <Switch label="Deshabilitado: lo administra tu supervisor" disabled />
      <Switch label="Deshabilitado y encendido" disabled defaultChecked />
      <Switch label="Grabar llamadas" description="Se avisa al cliente al inicio de cada llamada." defaultChecked />
    </div>
  ),
}

export const CasoReal: Story = {
  name: 'Caso real: permisos de un agente',
  render: () => (
    <Card title="Permisos de Camila Rojas">
      <div className="d-flex flex-column gap-3">
        <Switch label="Puede ingresar" description="Si lo apagas, se cierra su sesión de inmediato." defaultChecked />
        <Switch label="Ver grabaciones" />
        <Switch label="Exportar reportes" description="Incluye datos de contacto de clientes." />
      </div>
    </Card>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Switch label="Recibir alertas de colas sin agentes disponibles durante el turno" description="Llegan por correo y en la campana." defaultChecked />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  render: () => (
    <TresTemas>
      {(tema) => (
        <div className="d-flex flex-column gap-2">
          <Switch label={`Encendido (${tema})`} defaultChecked />
          <Switch label={`Apagado (${tema})`} />
        </div>
      )}
    </TresTemas>
  ),
}
