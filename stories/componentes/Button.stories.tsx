import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconSparkles } from '@tabler/icons-react'
import { Button, IconButton, LinkButton } from '../../src'

const meta: Meta<typeof Button> = {
  title: 'Componentes/Acciones/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Guardar cambios', variant: 'primary' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'light-brand', 'danger', 'success', 'warning', 'info', 'light-primary', 'light-danger', 'link'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'Una acción primaria por vista (`primary`); el resto `light-brand`. `danger` solo para acciones destructivas, con texto que nombra el objeto. Nunca `btn-outline-*` ni `btn-secondary`.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Playground: Story = {}

export const Jerarquia: Story = {
  name: 'Jerarquía de acciones',
  render: () => (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <Button startIcon="plus">Nueva campaña</Button>
      <Button variant="light-brand" startIcon="download">Exportar</Button>
      <Button variant="light-brand" startIcon={<IconSparkles />}>Resumir con IA</Button>
      <Button variant="danger" startIcon="trash-2">Eliminar campaña</Button>
      <Button variant="link">Ver historial</Button>
    </div>
  ),
}

export const Tamanos: Story = {
  name: 'Tamaños (32 / 36 / 40)',
  render: () => (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <Button size="sm">Pequeño</Button>
      <Button>Mediano</Button>
      <Button size="lg">Grande</Button>
      <IconButton icon="filter" label="Filtrar" size="sm" />
      <IconButton icon="filter" label="Filtrar" />
    </div>
  ),
}

export const Estados: Story = {
  render: () => (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <Button>Normal</Button>
      <Button loading>Guardando</Button>
      <Button disabled>Deshabilitado</Button>
      <LinkButton href="#reportes" variant="light-brand" endIcon="external-link">Abrir reportes</LinkButton>
    </div>
  ),
}

export const EnTabla: Story = {
  name: 'Acciones en tabla densa',
  render: () => (
    <table className="table table-hover mb-0">
      <thead><tr><th>Campaña</th><th className="text-end">Llamadas</th><th className="text-end">Acciones</th></tr></thead>
      <tbody>
        {['Cobranza Q4', 'Retención Fibra'].map((name, i) => (
          <tr key={name}>
            <td>{name}</td>
            <td className="text-end">{(1240 * (i + 1)).toLocaleString('es-CL')}</td>
            <td className="text-end">
              <div className="d-inline-flex gap-2">
                <IconButton icon="edit-2" label={`Editar ${name}`} size="sm" />
                <IconButton icon="trash-2" label={`Eliminar ${name}`} size="sm" variant="light-danger" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}
