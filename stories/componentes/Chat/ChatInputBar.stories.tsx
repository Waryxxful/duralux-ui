import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChatInputBar } from '../../../src'

const meta: Meta<typeof ChatInputBar> = {
  title: 'Componentes/Chat/ChatInputBar',
  component: ChatInputBar,
  tags: ['autodocs'],
  args: {
    multiline: true,
    maxLength: 500,
    placeholder: 'Escribe un mensaje…',
    onSend: () => undefined,
    onAttach: () => undefined,
    disabled: false,
  },
  decorators: [(Story) => <div className="card mb-0"><Story /></div>],
  parameters: {
    docs: {
      description: {
        component: 'Compositor: Enter envía y, con `multiline`, Shift+Enter salta de línea y el campo crece hasta `maxRows`. Adjuntar y emoji son botones con nombre accesible (solo aparecen con su callback). Con `maxLength` el contador «480 / 500» aparece desde el 80 %. Deshabilitado explica el motivo con `disabledReason`.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ChatInputBar>

export const Playground: Story = {}

export const UnaLinea: Story = {
  name: 'Una línea (contrato legado)',
  args: { multiline: false, maxLength: undefined, onEmoji: () => undefined },
}

export const CercaDelLimite: Story = {
  name: 'Cerca del límite',
  args: {
    maxLength: 120,
    value: 'Hola Valentina, te confirmo que el cobro duplicado se anuló y la devolución se verá en tu próxima boleta.',
    onChange: () => undefined,
  },
}

export const SinConexion: Story = {
  name: 'Deshabilitado con motivo',
  args: { disabled: true, placeholder: 'Sin conexión', disabledReason: 'Sin conexión con el servicio de mensajería. Reintentando…' },
}

export const Angosto: Story = {
  name: 'Contenedor angosto (360 px)',
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
}
