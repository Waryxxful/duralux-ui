import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import {
  AppSwitcher,
  NotificationsMenu,
  ProfileMenu,
  ShellHeader,
  TenantSwitcher,
  ThemeProvider,
  ThemeToggle,
} from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'
import { APPS, CUENTAS, NOTIFICACIONES, appHref } from './fixtures'

const noop = () => {}

function HeaderDemo({ themeMenu = false }: { themeMenu?: boolean }) {
  const [dark, setDark] = useState(false)
  const [mini, setMini] = useState(false)
  return (
    <div style={{ position: 'relative', minHeight: 360 }}>
      <ShellHeader
        nombre="Ana Pérez"
        email="ana.perez@example.com"
        rol="admin_ti"
        viewAsSa
        cuentaNombre="Banco Sur"
        cuentas={CUENTAS}
        apps={APPS}
        dark={dark}
        mini={mini}
        onToggleDark={() => setDark(value => !value)}
        onToggleMini={() => setMini(value => !value)}
        onToggleMobileNav={noop}
        onOpenApp={(event) => event.preventDefault()}
        onSelectCuenta={noop}
        onVolverSa={noop}
        appHref={appHref}
        csrfToken="demo"
        profileHref="/configuracion"
        onNavigateProfile={noop}
        notifications={NOTIFICACIONES}
        onMarkAllRead={noop}
        themeMenu={themeMenu}
      />
      {/* En la app, ShellNav lleva este id: los botones de menú lo referencian con aria-controls. */}
      <nav id="shell-navigation" aria-label="Navegación principal (ejemplo)" hidden />
    </div>
  )
}

const meta: Meta<typeof ShellHeader> = {
  title: 'Componentes/Shell/ShellHeader',
  component: ShellHeader,
  tags: ['autodocs'],
  decorators: [(Story) => <ThemeProvider enableResponsiveMini={false}><Story /></ThemeProvider>],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Header del shell GranCRM. Compone `AppSwitcher`, `TenantSwitcher`, `NotificationsMenu`, `ProfileMenu` y `ThemeToggle`, exportadas por separado. Conserva las props de 2.5; `themeMenu` (opcional) cambia el botón sol / luna por el menú de cuatro modos.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof ShellHeader>

export const Completo: Story = { render: () => <HeaderDemo /> }

export const ConMenuDeTema: Story = { name: 'Con menú de tema (themeMenu)', render: () => <HeaderDemo themeMenu /> }

export const Piezas: Story = {
  name: 'Piezas sueltas en tres temas',
  render: () => (
    <TresTemas>
      {() => (
        <div className="d-flex flex-wrap align-items-center gap-2" style={{ minHeight: 120 }}>
          <AppSwitcher apps={APPS} appHref={appHref} onOpenApp={(event) => event.preventDefault()} />
          <TenantSwitcher viewAsSa={false} cuentaNombre={null} cuentas={CUENTAS} onSelectCuenta={noop} onVolverSa={noop} />
          <ThemeToggle />
          <NotificationsMenu notifications={NOTIFICACIONES} apps={APPS} appHref={appHref} onMarkAllRead={noop} />
          <ProfileMenu nombre="Ana Pérez" email="ana.perez@example.com" csrfToken="demo" profileHref="/configuracion" />
        </div>
      )}
    </TresTemas>
  ),
}

export const TemaAbierto: Story = {
  name: 'ThemeToggle abierto',
  render: () => (
    <TresTemas>
      {() => <div style={{ minHeight: 240 }}><ThemeToggle align="start" defaultOpen /></div>}
    </TresTemas>
  ),
}

export const NotificacionesAbiertas: Story = {
  name: 'NotificationsMenu abierto',
  render: () => (
    <div className="d-flex justify-content-end p-3" style={{ minHeight: 420 }}>
      <NotificationsMenu notifications={NOTIFICACIONES} apps={APPS} appHref={appHref} onMarkAllRead={noop} defaultOpen />
    </div>
  ),
}
