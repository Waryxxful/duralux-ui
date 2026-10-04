import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Toast } from '../../../src'
import type { ToastVariant } from '../../../src'

const meta: Meta<typeof Toast> = {
  title: 'Componentes/Feedback/Toast',
  component: Toast,
  tags: ['autodocs'],
  args: {
    variant: 'success',
    title: 'Campaña guardada',
    description: 'Los cambios ya están visibles para los supervisores.',
    show: true,
    autoHideMs: 0,
    onClose: () => {},
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['success', 'info', 'warning', 'danger'] },
    autoHideMs: { control: 'number' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Confirma una acción con efecto. `success` e `info` se cierran solos (3 s o más si el texto es largo: nunca se acorta el tiempo de lectura); `warning` y `danger` esperan al cierre. El tiempo se pausa con el puntero encima o con foco. Se anuncia con `aria-live` (`polite` o `assertive`).',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Toast>

export const Playground: Story = {}

function Controlled({ variant, title, description }: { variant: ToastVariant, title: string, description?: string }) {
  const [show, setShow] = useState(true)
  return (
    <>
      <Button variant="light-brand" onClick={() => setShow(true)}>Mostrar de nuevo</Button>
      <Toast variant={variant} title={title} description={description} show={show} onClose={() => setShow(false)} />
    </>
  )
}

export const Exito: Story = {
  name: 'Caso real: éxito',
  render: () => <Controlled variant="success" title="Reporte exportado" description="2.840 registros · 1,2 MB" />,
}

export const ErrorPersistente: Story = {
  name: 'Caso real: error que espera al cierre',
  render: () => <Controlled variant="danger" title="No se pudo guardar la campaña" description="Revisa tu conexión e inténtalo de nuevo. Tus cambios siguen en el formulario." />,
}

export const Apilados: Story = {
  name: 'Apilados',
  render: () => (
    <>
      <Toast variant="info" title="Sincronización completada" show onClose={() => {}} autoHideMs={0} />
      <Toast variant="warning" title="Cola Soporte cerca del umbral" description="Nivel de servicio 78 % · meta 80 %" show onClose={() => {}} autoHideMs={0} />
    </>
  ),
}
