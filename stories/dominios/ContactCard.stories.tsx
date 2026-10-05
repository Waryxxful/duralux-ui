import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ContactCard, Severity } from '../../src'
import { conAncho } from '../componentes/Nuevos/soporte'

const meta: Meta<typeof ContactCard> = {
  title: 'Dominios/CRM/ContactCard',
  component: ContactCard,
  tags: ['autodocs'],
  args: {
    name: 'Paula Herrera',
    role: 'Jefa de compras',
    company: 'Retail Andino',
    email: 'paula.herrera@retailandino.cl',
    phone: '+56 9 8765 4321',
    tags: ['Cliente clave', 'Renovación Q4', 'Zona centro'],
    status: <Severity level="warning" label="Riesgo de fuga" size="sm" />,
    facts: [
      { label: 'Valor anual', value: '$18.400.000' },
      { label: 'Casos abiertos', value: '3' },
      { label: 'Última compra', value: '12-08-2026' },
    ],
    actions: (
      <>
        <Button variant="primary" size="sm" startIcon="phone">Llamar</Button>
        <Button variant="light-brand" size="sm" startIcon="mail">Enviar correo</Button>
      </>
    ),
  },
  parameters: {
    docs: { description: { component: 'Ficha 360 de un contacto: identidad, correo y teléfono como enlaces, etiquetas, cifras con contexto y una acción primaria.' } },
  },
  decorators: [conAncho(420)],
}
export default meta
type Story = StoryObj<typeof ContactCard>

export const Playground: Story = {}

export const Angosta: Story = { name: 'En un panel angosto', parameters: { maxWidth: 300 } }

export const Cargando: Story = { name: 'Cargando', args: { loading: true } }
