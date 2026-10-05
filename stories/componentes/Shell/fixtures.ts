import type { AppManifestEntry, Notificacion } from '../../../src'

export const APPS: AppManifestEntry[] = [
  { id: 1, nombre: 'Ventas', slug: 'ventas', icono: 'trending-up', categoria: 'Operación', estado: 'activo', modo: 'spa_remote', url_publica: '/ventas', route_prefix: '/ventas' },
  { id: 2, nombre: 'Campañas', slug: 'campanas', icono: 'target', categoria: 'Operación', estado: 'montaje', modo: 'spa_remote', url_publica: '/campanas', route_prefix: '/campanas' },
  { id: 3, nombre: 'Calidad', slug: 'calidad', icono: 'check-circle', categoria: 'Supervisión', estado: 'activo', modo: 'spa_remote', url_publica: '/calidad', route_prefix: '/calidad' },
  { id: 4, nombre: 'Reportería', slug: 'reporteria', icono: 'bar-chart-2', categoria: 'Supervisión', estado: 'caido', modo: 'external_link', url_publica: 'https://example.com/reportes', route_prefix: '/reportes' },
  { id: 5, nombre: 'Notificaciones', slug: 'notificaciones', icono: 'bell', categoria: 'Cuenta', estado: 'activo', modo: 'spa_remote', url_publica: '/notificaciones', route_prefix: '/notificaciones' },
]

const hace = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString()

export const NOTIFICACIONES: Notificacion[] = [
  { id: 1, mensaje: 'La campaña «Renovación Q4» superó la meta diaria de contactos.', url: '/campanas/12', leida: false, creada_en: hace(4), aplicacion_nombre: 'Campañas' },
  { id: 2, mensaje: 'Se asignaron 18 llamadas nuevas para evaluar.', url: '/calidad/cola', leida: false, creada_en: hace(95), aplicacion_nombre: 'Calidad' },
  { id: 3, mensaje: 'El reporte semanal está listo para descargar.', url: '/reportes/semana', leida: true, creada_en: hace(60 * 26), aplicacion_nombre: 'Reportería' },
]

export const CUENTAS = [
  { slug: 'banco-sur', nombre: 'Banco Sur' },
  { slug: 'seguros-andes', nombre: 'Seguros Andes' },
  { slug: 'retail-norte', nombre: 'Retail Norte' },
]

export const appHref = (app: AppManifestEntry) => app.url_publica
