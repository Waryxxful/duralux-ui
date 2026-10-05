import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button, CommandPalette, Kbd, ThemeScope, type CommandPaletteItem } from '../../../src'

const COMANDOS: CommandPaletteItem[] = [
  { id: 'nav-inicio', label: 'Inicio', group: 'Navegación', icon: 'home', href: '/' },
  { id: 'nav-campanas', label: 'Campañas', group: 'Navegación', icon: 'target', keywords: ['marketing'], description: '12 activas' },
  { id: 'nav-calidad', label: 'Cola de calidad', group: 'Navegación', icon: 'check-circle', description: '18 llamadas por evaluar' },
  { id: 'nav-config', label: 'Configuración de cuenta', group: 'Navegación', icon: 'settings', keywords: ['ajustes', 'perfil'] },
  { id: 'acc-campana', label: 'Nueva campaña', group: 'Acciones', icon: 'plus', shortcut: ['N'] },
  { id: 'acc-exportar', label: 'Exportar reporte en CSV', group: 'Acciones', icon: 'download' },
  { id: 'acc-archivar', label: 'Archivar campañas vencidas', group: 'Acciones', icon: 'archive', disabled: true, description: 'Requiere permiso de supervisor' },
]

function Demo({ theme }: { theme?: 'light' | 'dark' | 'navy' }) {
  const [open, setOpen] = useState(false)
  const [last, setLast] = useState<string | null>(null)
  const content = (
    <div className="p-4">
      <Button variant="light-brand" startIcon="search" onClick={() => setOpen(true)}>
        Buscar <Kbd keys={['Ctrl', 'K']} />
      </Button>
      <p className="mt-3 mb-0 fs-13" style={{ color: 'var(--gcu-muted)' }} role="status">{last ? `Último comando: ${last}` : 'Aún no ejecutas ningún comando.'}</p>
      <CommandPalette
        items={COMANDOS}
        open={open}
        onOpenChange={setOpen}
        hotkey={!theme}
        recentsKey="storybook-command-palette"
        onSelect={(item) => setLast(item.label)}
      />
    </div>
  )
  return theme
    ? <ThemeScope theme={theme} className="rounded-3" style={{ background: 'var(--gcu-surface-subtle)' }}>{content}</ThemeScope>
    : content
}

const meta: Meta<typeof CommandPalette> = {
  title: 'Componentes/Shell/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Paleta de comandos y navegación. Ctrl/Cmd + K la abre; búsqueda difusa sin tildes (nombre, sinónimos, grupo); patrón APG combobox + listbox; «Recientes» en localStorage. Los `href` solo aceptan http/https o rutas relativas.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof CommandPalette>

export const Playground: Story = { render: () => <Demo /> }

export const Abierta: Story = {
  name: 'Abierta (búsqueda vacía)',
  render: () => <CommandPalette items={COMANDOS} defaultOpen hotkey={false} recentsKey={null} />,
}

export const TresTemas: Story = {
  name: 'Tres temas',
  render: () => (
    <div className="d-grid gap-3">
      <Demo theme="light" />
      <Demo theme="dark" />
      <Demo theme="navy" />
    </div>
  ),
}
