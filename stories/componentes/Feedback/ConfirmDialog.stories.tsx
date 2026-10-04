import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, ConfirmDialog, Toast } from '../../../src'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Componentes/Feedback/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  args: {
    open: true,
    variant: 'danger',
    title: 'Eliminar campaña',
    message: 'Se eliminará «Cobranza Q4» con sus 1.240 registros. No se puede deshacer.',
    confirmLabel: 'Eliminar campaña',
    cancelLabel: 'Cancelar',
    loading: false,
    onConfirm: () => {},
    onCancel: () => {},
  },
  argTypes: { variant: { control: 'inline-radio', options: ['primary', 'warning', 'danger'] } },
  parameters: {
    docs: {
      description: {
        component: 'Confirma una acción con efecto. En `danger` el título, el mensaje y el botón nombran el objeto («Eliminar campaña»), nunca «Aceptar» suelto. Mientras `loading` no se puede cerrar. Tras confirmar, da feedback (toast o cambio visible). Los botones se apilan si el diálogo es angosto.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const Playground: Story = {}

function DestructiveFlow() {
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  return (
    <>
      <Button variant="danger" startIcon="trash-2" onClick={() => setOpen(true)}>Eliminar campaña</Button>
      <ConfirmDialog
        open={open}
        variant="danger"
        title="Eliminar campaña"
        message="Se eliminará «Cobranza Q4» con sus 1.240 registros. No se puede deshacer."
        confirmLabel="Eliminar campaña"
        loading={loading}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setLoading(true)
          setTimeout(() => { setLoading(false); setOpen(false); setDone(true) }, 1200)
        }}
      />
      <Toast variant="success" title="Campaña «Cobranza Q4» eliminada" show={done} onClose={() => setDone(false)} />
    </>
  )
}

export const Destructiva: Story = {
  name: 'Caso real: confirmación destructiva',
  render: () => <DestructiveFlow />,
}

export const Confirmando: Story = {
  name: 'Confirmando (no se puede cerrar)',
  args: {
    variant: 'primary',
    title: 'Publicar campaña',
    message: 'Los agentes de «Retención Fibra» empezarán a recibir llamadas.',
    confirmLabel: 'Publicar campaña',
    loading: true,
  },
}
