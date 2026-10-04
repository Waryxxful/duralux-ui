import type { Decorator, StoryObj } from '@storybook/react-vite'
import type * as React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AppLayout } from '../../src'
import { DuraluxAntdProvider } from '../../src/antd'
import './patrones.css'

/**
 * Soporte compartido de las stories «Patrones/…»: el shell de la app (AppLayout dentro de un
 * router en memoria), el tema desde la barra de Storybook y datos de un contact center.
 */

export type TemaPatron = 'light' | 'dark' | 'navy'

export const temaDe = (valor: unknown): TemaPatron => (valor === 'dark' || valor === 'navy' ? valor : 'light')

const NAV = [
  { type: 'caption' as const, label: 'Operación' },
  { label: 'Tablero', icon: 'feather-airplay', to: '/tablero' },
  { label: 'Colas', icon: 'feather-phone-call', to: '/colas' },
  { label: 'Campañas', icon: 'feather-target', to: '/campanas' },
  { label: 'Reportes', icon: 'feather-bar-chart-2', to: '/reportes' },
  { type: 'caption' as const, label: 'Calidad' },
  { label: 'Evaluaciones', icon: 'feather-check-square', to: '/calidad' },
  { type: 'caption' as const, label: 'Administración' },
  { label: 'Usuarios', icon: 'feather-users', to: '/usuarios' },
  { label: 'Ajustes', icon: 'feather-settings', to: '/ajustes' },
]

const USUARIO = {
  name: 'Paula Herrera',
  email: 'paula.herrera@in-touchcrm.cl',
  menuItems: [
    { key: 'perfil', label: 'Mi perfil', icon: 'feather-user', href: '#perfil' },
    { key: 'div', divider: true },
    { key: 'salir', label: 'Cerrar sesión', icon: 'feather-log-out', href: '#salir' },
  ],
}

const NOTIFICACIONES = [
  { id: 1, icon: 'feather-alert-triangle', color: 'danger', title: 'Cobranza supera la espera máxima', time: '16:42' },
  { id: 2, icon: 'feather-check-circle', color: 'success', title: 'Retención Fibra alcanzó la meta diaria', time: '15:10' },
]

/**
 * Decorador de página completa: AppLayout con la navegación de GranCRM. AppLayout (sin
 * ThemeProvider) fija `.app-skin-dark` en <html> según su prop `theme`; se la pasamos desde la
 * barra de Storybook para que no deshaga lo que aplicó ThemeSync.
 */
export const conShell = (ruta: string): Decorator => (Story, ctx) => {
  const tema = temaDe(ctx.globals.theme)
  return (
    <MemoryRouter initialEntries={[ruta]}>
      <AppLayout navItems={NAV} user={USUARIO} notifications={NOTIFICACIONES} theme={tema === 'light' ? 'light' : 'dark'}>
        <Story />
      </AppLayout>
    </MemoryRouter>
  )
}

/** Proveedor antd con el tema activo (DateRangeFilter, Splitter). */
export function ConAntd({ tema, children }: { tema: TemaPatron; children: React.ReactNode }) {
  return <DuraluxAntdProvider theme={tema}>{children}</DuraluxAntdProvider>
}

/** Las tres variantes de tema de cada patrón: claro (por defecto), oscuro y navy. */
export function tresTemas<T>(base: StoryObj<T> = {}): { Claro: StoryObj<T>; Oscuro: StoryObj<T>; Navy: StoryObj<T> } {
  return {
    Claro: { ...base, name: 'Claro', globals: { theme: 'light' } },
    Oscuro: { ...base, name: 'Oscuro', globals: { theme: 'dark' } },
    Navy: { ...base, name: 'Navy', globals: { theme: 'navy' } },
  }
}

// ── Formatos (REGLAS-DE-DISENO §8) ─────────────────────────────────────────────

export const miles = (n: number) => n.toLocaleString('es-CL')
export const pct = (n: number) => `${n.toLocaleString('es-CL', { maximumFractionDigits: 1 })} %`
export const mss = (segundos: number) => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`
export const clp = (n: number) => `$${n.toLocaleString('es-CL')}`

// ── Datos del contact center ───────────────────────────────────────────────────

export const HORAS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

export type EstadoAgente = 'Disponible' | 'En llamada' | 'En pausa' | 'Desconectado'

export interface Agente {
  id: number
  nombre: string
  equipo: string
  estado: EstadoAgente
  llamadas: number
  tmo: number
  calidad: number
}

export const AGENTES: Agente[] = [
  { id: 1, nombre: 'Ana Torres', equipo: 'Cobranza', estado: 'En llamada', llamadas: 64, tmo: 312, calidad: 92 },
  { id: 2, nombre: 'Bruno Díaz', equipo: 'Cobranza', estado: 'Disponible', llamadas: 58, tmo: 344, calidad: 81 },
  { id: 3, nombre: 'Carla Muñoz', equipo: 'Retención', estado: 'En llamada', llamadas: 41, tmo: 402, calidad: 88 },
  { id: 4, nombre: 'Diego Rojas', equipo: 'Retención', estado: 'En pausa', llamadas: 37, tmo: 455, calidad: 74 },
  { id: 5, nombre: 'Elena Soto', equipo: 'Ventas', estado: 'En llamada', llamadas: 52, tmo: 286, calidad: 90 },
  { id: 6, nombre: 'Felipe Vera', equipo: 'Ventas', estado: 'Desconectado', llamadas: 12, tmo: 301, calidad: 63 },
  { id: 7, nombre: 'Gabriela Pino', equipo: 'Servicio', estado: 'Disponible', llamadas: 47, tmo: 268, calidad: 85 },
  { id: 8, nombre: 'Hugo Lagos', equipo: 'Servicio', estado: 'En llamada', llamadas: 49, tmo: 295, calidad: 79 },
]

export interface Cola {
  id: string
  nombre: string
  enEspera: number
  esperaMax: number
  libres: number
  nivelServicio: number
  abandono: number
}

export const COLAS: Cola[] = [
  { id: 'cobranza', nombre: 'Cobranza temprana', enEspera: 18, esperaMax: 272, libres: 0, nivelServicio: 62, abandono: 9.4 },
  { id: 'retencion', nombre: 'Retención Fibra', enEspera: 7, esperaMax: 151, libres: 1, nivelServicio: 76, abandono: 5.2 },
  { id: 'soporte', nombre: 'Soporte técnico', enEspera: 4, esperaMax: 64, libres: 3, nivelServicio: 88, abandono: 2.1 },
  { id: 'ventas', nombre: 'Ventas Hogar', enEspera: 2, esperaMax: 38, libres: 4, nivelServicio: 93, abandono: 1.3 },
]

export type EstadoCampana = 'Activa' | 'Pausada' | 'Finalizada'

export interface Campana {
  id: number
  nombre: string
  area: string
  agentes: number
  llamadas: number
  contactabilidad: number
  meta: number
  estado: EstadoCampana
  cierre: string
}

export const CAMPANAS: Campana[] = [
  { id: 4101, nombre: 'Cobranza Q4', area: 'Cobranza', agentes: 24, llamadas: 12480, contactabilidad: 61, meta: 70, estado: 'Activa', cierre: '31-12-2026' },
  { id: 4102, nombre: 'Retención Fibra', area: 'Retención', agentes: 14, llamadas: 6342, contactabilidad: 78, meta: 75, estado: 'Activa', cierre: '15-11-2026' },
  { id: 4103, nombre: 'Venta cruzada Hogar', area: 'Ventas', agentes: 18, llamadas: 8910, contactabilidad: 72, meta: 70, estado: 'Activa', cierre: '30-11-2026' },
  { id: 4104, nombre: 'Encuesta NPS', area: 'Servicio', agentes: 6, llamadas: 2215, contactabilidad: 54, meta: 60, estado: 'Activa', cierre: '20-10-2026' },
  { id: 4105, nombre: 'Portabilidad Móvil', area: 'Ventas', agentes: 10, llamadas: 4120, contactabilidad: 66, meta: 65, estado: 'Pausada', cierre: '31-10-2026' },
  { id: 4106, nombre: 'Bienvenida clientes nuevos', area: 'Servicio', agentes: 4, llamadas: 1830, contactabilidad: 83, meta: 80, estado: 'Finalizada', cierre: '30-09-2026' },
]

export interface DiaReporte {
  id: string
  fecha: string
  ofrecidas: number
  atendidas: number
  abandono: number
  nivelServicio: number
  tmo: number
}

const BASE_DIAS = [
  [3120, 4.1, 84, 301], [2980, 3.8, 86, 296], [3305, 5.6, 79, 318], [3410, 6.2, 77, 322], [2870, 3.1, 88, 290],
  [1240, 2.4, 91, 275], [980, 2.0, 93, 268], [3190, 4.4, 83, 305], [3255, 4.9, 81, 311], [3380, 5.8, 78, 320],
  [3020, 3.6, 85, 298], [2940, 3.3, 87, 294], [1310, 2.2, 92, 270], [1050, 1.9, 94, 266],
] as const

export const DIAS: DiaReporte[] = BASE_DIAS.map(([ofrecidas, abandono, nivelServicio, tmo], i) => {
  const dia = 21 + i
  const fecha = dia <= 30 ? `${String(dia).padStart(2, '0')}-09-2026` : `${String(dia - 30).padStart(2, '0')}-10-2026`
  return { id: fecha, fecha, ofrecidas, atendidas: Math.round(ofrecidas * (1 - abandono / 100)), abandono, nivelServicio, tmo }
})
