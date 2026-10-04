import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, FormField, Input, Modal } from '../../../src'

const meta: Meta<typeof Modal> = {
  title: 'Componentes/Feedback/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: {
    open: true,
    title: 'Editar campaña',
    children: 'Los cambios se aplican desde el próximo turno.',
    size: 'md',
    onClose: () => {},
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'Patrón APG «Dialog (Modal)»: foco atrapado, retorno de foco al abridor, `Esc` y clic en el fondo cierran, el fondo no se desplaza y queda `inert`. Entra con `gcu-enter`; elevación 4 y radio xl. El cuerpo es contenedor de consultas: `.gcu-modal-columns` pasa a 2 columnas desde 28rem. Para confirmar acciones usa `ConfirmDialog`.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Modal>

export const Playground: Story = {}

function FormModal() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Nuevo contacto</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo contacto"
        size="lg"
        footer={(
          <>
            <Button variant="light-brand" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => setOpen(false)}>Crear contacto</Button>
          </>
        )}
      >
        <div className="gcu-modal-columns">
          <FormField label="Nombre" required>{(id) => <Input id={id} placeholder="Ej.: Camila Rojas" />}</FormField>
          <FormField label="Teléfono">{(id) => <Input id={id} placeholder="+56 9 1234 5678" />}</FormField>
          <FormField label="Correo" helpText="Se usa para el resumen de la llamada.">{(id) => <Input id={id} type="email" placeholder="nombre@empresa.cl" />}</FormField>
          <FormField label="Campaña">{(id) => <Input id={id} placeholder="Cobranza Q4" />}</FormField>
        </div>
      </Modal>
    </>
  )
}

export const ConFormulario: Story = {
  name: 'Caso real: modal con formulario',
  render: () => <FormModal />,
}

export const Angosto: Story = {
  name: 'Formulario en modal angosto (1 columna)',
  render: () => (
    <Modal open size="sm" title="Renombrar cola" onClose={() => {}} footer={<Button>Guardar nombre</Button>}>
      <div className="gcu-modal-columns">
        <FormField label="Nombre actual">{(id) => <Input id={id} defaultValue="Soporte" readOnly />}</FormField>
        <FormField label="Nombre nuevo">{(id) => <Input id={id} placeholder="Soporte nivel 1" />}</FormField>
      </div>
    </Modal>
  ),
}
