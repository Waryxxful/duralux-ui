import type { Meta, StoryObj } from '@storybook/react-vite'
import { AuthLayout, Button, FormField, Input, PageHeader, ShellNav, ThemeProvider } from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta = {
  title: 'Componentes/Shell/Layout',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '`PageHeader` sticky por defecto (sombra solo al quedar pegado), `ShellNav` con ítem actual marcado por barra y superficie, y `AuthLayout` con error accesible.',
      },
    },
  },
}
export default meta
type Story = StoryObj

export const PageHeaderSticky: Story = {
  name: 'PageHeader: sticky con sombra al hacer scroll',
  render: () => (
    <div style={{ height: 320, overflowY: 'auto', background: 'var(--gcu-surface-subtle)' }}>
      <PageHeader
        title="Campañas"
        breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Campañas' }]}
        actions={<><Button variant="light-brand" startIcon="download">Exportar</Button><Button variant="primary" startIcon="plus">Nueva campaña</Button></>}
      />
      <div className="p-4" style={{ minHeight: 900 }}>
        <p className="text-muted fs-13">Desplázate: la barra queda fija y aparece la sombra.</p>
      </div>
    </div>
  ),
}

export const PageHeaderTemas: Story = {
  name: 'PageHeader en tres temas',
  render: () => (
    <TresTemas>
      {() => <PageHeader title="Usuarios" sticky={false} breadcrumbs={[{ label: 'Ajustes', href: '#ajustes' }, { label: 'Usuarios' }]} actions={<Button variant="primary">Invitar</Button>} />}
    </TresTemas>
  ),
}

const SECCIONES = [
  {
    caption: 'Operación',
    items: [
      { label: 'Inicio', icon: 'home', href: '/' },
      { label: 'Campañas', icon: 'target', href: '/campanas' },
      { label: 'Calidad', icon: 'check-circle', children: [
        { label: 'Cola', icon: 'list', href: '/calidad/cola' },
        { label: 'Criterios', icon: 'sliders', href: '/calidad/criterios' },
      ] },
    ],
  },
]

export const NavegacionTemas: Story = {
  name: 'ShellNav: ítem actual en tres temas',
  render: () => (
    <ThemeProvider enableResponsiveMini={false}>
      <TresTemas>
        {(tema) => (
          <div style={{ position: 'relative', height: 360, overflow: 'hidden', transform: 'translateZ(0)' }}>
            <ShellNav
              brand={{ href: '/', logoLg: '', logoSm: '', alt: 'GranCRM' }}
              sections={SECCIONES}
              pathname="/calidad/cola"
              onNavigate={(_href, event) => event.preventDefault()}
              navigationId={`navegacion-${tema}`}
            />
          </div>
        )}
      </TresTemas>
    </ThemeProvider>
  ),
}

export const Acceso: Story = {
  name: 'AuthLayout con error accesible',
  render: () => (
    <AuthLayout
      title="Inicia sesión"
      description="Usa tu correo corporativo."
      error="El correo o la contraseña no coinciden. Revisa los datos e inténtalo de nuevo."
      errorId="login-error"
      footer="¿Problemas para entrar? Escribe a soporte."
    >
      <form aria-label="Inicio de sesión" aria-describedby="login-error" className="d-grid gap-3">
        <FormField label="Correo"><Input type="email" autoComplete="username" defaultValue="ana.perez@example.com" /></FormField>
        <FormField label="Contraseña"><Input type="password" autoComplete="current-password" /></FormField>
        <Button type="submit" variant="primary">Entrar</Button>
      </form>
    </AuthLayout>
  ),
}

export const AccesoTemas: Story = {
  name: 'AuthLayout en tres temas (tarjeta)',
  render: () => (
    <TresTemas>
      {() => (
        <div className="gcu-auth">
          <div className="auth-cover-sidebar-inner p-4" style={{ minHeight: 0, maxWidth: 'none' }}>
            <h2 className="gcu-auth__title">Inicia sesión</h2>
            <div role="alert" className="gcu-auth__error">El correo o la contraseña no coinciden.</div>
          </div>
        </div>
      )}
    </TresTemas>
  ),
}
