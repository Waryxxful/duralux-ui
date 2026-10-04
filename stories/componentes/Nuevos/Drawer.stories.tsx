import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Drawer, FormField, Input, Select, Switch, ThemeScope } from '../../../src'

const meta: Meta<typeof Drawer> = {
  title: 'Componentes/Nuevos/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  args: {
    open: true,
    title: 'Detalle del cliente',
    description: 'Última gestión: 23-09-2026 · 16:42',
    size: 'md',
    side: 'end',
    children: 'Camila Rojas · #48213 · Cobranza Q4',
    onClose: () => {},
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    side: { control: 'inline-radio', options: ['end', 'start'] },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, iframeHeight: 520 },
      description: {
        component: 'Panel lateral modal sobre la misma pila que Modal: foco atrapado y devuelto, Esc, fondo inert y sin scroll. Overlay `--gcu-overlay`, z-index `--gcu-z-drawer`, tamaños sm/md/lg, cabecera y pie fijos. Entra con `gcu-enter` y sale más rápido. El cuerpo es contenedor: `.gcu-drawer-columns` pasa a 2 columnas desde 28rem.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Drawer>

export const Playground: Story = {}

function Filtros() {
  const [open, setOpen] = useState(true)
  return (
    <div className="p-4">
      <Button variant="light-brand" startIcon="filter" onClick={() => setOpen(true)}>Filtros avanzados</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filtros avanzados"
        description="Se aplican a la tabla de gestiones."
        size="lg"
        footer={(
          <>
            <Button variant="light-brand" onClick={() => setOpen(false)}>Limpiar filtros</Button>
            <Button onClick={() => setOpen(false)}>Aplicar filtros</Button>
          </>
        )}
      >
        <div className="gcu-drawer-columns">
          <FormField label="Campaña">{(id) => <Select id={id} options={['Todas', 'Cobranza Q4', 'Retención']} />}</FormField>
          <FormField label="Agente">{(id) => <Input id={id} placeholder="Nombre o RUT" />}</FormField>
          <FormField label="Desde">{(id) => <Input id={id} placeholder="dd-mm-aaaa" />}</FormField>
          <FormField label="Hasta">{(id) => <Input id={id} placeholder="dd-mm-aaaa" />}</FormField>
        </div>
        <div className="mt-3"><Switch label="Solo gestiones con grabación" /></div>
      </Drawer>
    </div>
  )
}

export const CasoReal: Story = { name: 'Caso real: filtros avanzados', render: () => <Filtros /> }

export const Pequeno: Story = {
  name: 'Tamaño sm desde el inicio',
  args: { size: 'sm', side: 'start', title: 'Atajos', description: undefined, children: 'Usa Ctrl + K para buscar.' },
}

export const Angosto: Story = {
  name: 'Pantalla angosta (320 px)',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Drawer open size="lg" title="Detalle del cliente" onClose={() => {}} footer={<Button>Guardar cambios</Button>}>
        <div className="gcu-drawer-columns">
          <FormField label="Nombre">{(id) => <Input id={id} defaultValue="Camila Rojas" />}</FormField>
          <FormField label="Teléfono">{(id) => <Input id={id} defaultValue="+56 9 1234 5678" />}</FormField>
        </div>
      </Drawer>
    </div>
  ),
}

export const TemaNavy: Story = {
  name: 'Dentro de un ThemeScope navy',
  render: () => (
    <ThemeScope theme="navy" className="p-4">
      <Drawer open title="Panel en navy" description="El portal hereda el tema del contenedor." onClose={() => {}} footer={<Button>Guardar cambios</Button>}>
        Contenido del panel.
      </Drawer>
    </ThemeScope>
  ),
}
