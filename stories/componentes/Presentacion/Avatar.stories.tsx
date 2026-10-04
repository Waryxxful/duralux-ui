import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarGroup } from '../../../src'

// Foto inline (SVG) para que las capturas no dependan de la red.
const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#c9d6ea"/><circle cx="32" cy="25" r="12" fill="#7a8fb1"/><rect x="12" y="42" width="40" height="24" rx="12" fill="#7a8fb1"/></svg>',
)}`

const meta: Meta<typeof Avatar> = {
  title: 'Componentes/Presentación/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { name: 'Camila Rojas', size: 'md', variant: 'primary' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark', 'light'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'Foto o iniciales. Las iniciales usan relleno de estado con texto inverso (AA en los tres temas). Si la foto falla, cae en las iniciales. Sin `alt`/`aria-label` es decorativo: acompáñalo del nombre en texto.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Avatar>

export const Playground: Story = {}

export const Tonos: Story = {
  render: () => (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      {(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark', 'light'] as const).map((tone) => (
        <Avatar key={tone} name={tone} variant={tone} size="lg" />
      ))}
    </div>
  ),
}

export const Tamanos: Story = {
  name: 'Tamaños',
  render: () => (
    <div className="d-flex gap-3 align-items-center">
      <Avatar name="Ana Pérez" size="sm" />
      <Avatar name="Ana Pérez" size="md" />
      <Avatar name="Ana Pérez" size="lg" />
      <Avatar name="Ana Pérez" size="xl" />
      <Avatar src={PHOTO} name="Ana Pérez" size="lg" />
      <Avatar src={PHOTO} name="Ana Pérez" size="xl" />
    </div>
  ),
}

export const Estados: Story = {
  name: 'Foto, foto rota e iniciales',
  render: () => (
    <div className="d-flex gap-3 align-items-center">
      <Avatar src={PHOTO} name="Diego Fuentes" alt="Diego Fuentes" size="lg" />
      <Avatar src="data:image/png;base64,AAAA" name="Diego Fuentes" alt="Diego Fuentes (sin foto)" size="lg" />
      <Avatar name="Diego Fuentes" aria-label="Diego Fuentes" size="lg" variant="teal" />
    </div>
  ),
}

export const Grupo: Story = {
  name: 'AvatarGroup',
  render: () => (
    <div className="d-flex flex-column gap-3 align-items-start">
      <AvatarGroup
        max={4}
        items={[
          { id: 1, name: 'Camila Rojas', src: PHOTO },
          { id: 2, name: 'Diego Fuentes' },
          { id: 3, name: 'Valentina Soto', src: PHOTO },
          { id: 4, name: 'Tomás Muñoz' },
          { id: 5, name: 'Josefa Díaz' },
          { id: 6, name: 'Martín Vera' },
        ]}
      />
      <AvatarGroup
        size="sm"
        max={2}
        onOverflowClick={() => {}}
        overflowLabel="Ver 3 agentes más"
        items={[{ id: 1, name: 'Camila Rojas' }, { id: 2, name: 'Diego Fuentes' }, { id: 3, name: 'Ana' }, { id: 4, name: 'Luis' }, { id: 5, name: 'Rosa' }]}
      />
    </div>
  ),
}

export const CasoReal: Story = {
  name: 'Caso real: agente en una lista',
  render: () => (
    <ul className="list-group list-group-flush" style={{ maxWidth: 420 }}>
      {[
        { name: 'Camila Rojas', role: 'Supervisora · Cobranza', variant: 'primary' as const },
        { name: 'Diego Fuentes', role: 'Agente · Retención', variant: 'teal' as const },
        { name: 'Valentina Soto', role: 'Agente · Ventas', variant: 'indigo' as const },
      ].map((person) => (
        <li key={person.name} className="list-group-item d-flex align-items-center gap-3">
          <Avatar name={person.name} variant={person.variant} />
          <div>
            <div className="fw-semibold">{person.name}</div>
            <div className="text-muted fs-12">{person.role}</div>
          </div>
        </li>
      ))}
    </ul>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <AvatarGroup max={3} items={[{ id: 1, name: 'Camila Rojas' }, { id: 2, name: 'Diego Fuentes' }, { id: 3, name: 'Ana Soto' }, { id: 4, name: 'Luis Vera' }]} />
    </div>
  ),
}
