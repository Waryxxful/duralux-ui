import { afterEach, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, ThemeToggle } from '../src/index'
import { buildSections, filterCommands, pushRecent, readRecents } from '../src/components/shell/commandPaletteModel'
import { safeHref } from '../src/utils/safeHref'

const items = [
  { id: 'ventas', label: 'Ventas', group: 'Navegación' },
  { id: 'config', label: 'Configuración de cuenta', group: 'Navegación', keywords: ['ajustes'] },
  { id: 'nueva', label: 'Nueva campaña', group: 'Acciones' },
  { id: 'reporte', label: 'Reporte de llamadas', group: 'Navegación' },
]

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

test('búsqueda difusa: sin tildes, prefijo antes que subsecuencia, sinónimos y descarte', () => {
  expect(filterCommands(items, 'configuracion').map(i => i.id)).toEqual(['config'])
  expect(filterCommands(items, 'ajustes').map(i => i.id)).toEqual(['config'])
  expect(filterCommands(items, 'rep').map(i => i.id)[0]).toBe('reporte')
  expect(filterCommands(items, 'rpl').map(i => i.id)).toContain('reporte')
  expect(filterCommands(items, 'zzz')).toEqual([])
  expect(filterCommands(items, 'nueva camp').map(i => i.id)).toEqual(['nueva'])
})

test('recientes: primero, sin duplicar, con tope y tolerantes a almacenamiento bloqueado', () => {
  let recents = pushRecent('k', [], 'ventas', 2)
  recents = pushRecent('k', recents, 'nueva', 2)
  recents = pushRecent('k', recents, 'ventas', 2)
  expect(recents).toEqual(['ventas', 'nueva'])
  expect(readRecents('k')).toEqual(['ventas', 'nueva'])
  const sections = buildSections(items, '', recents)
  expect(sections[0]).toMatchObject({ label: 'Recientes' })
  expect(sections.flatMap(s => s.items).filter(i => i.id === 'ventas')).toHaveLength(1)

  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado') })
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  expect(readRecents('k')).toEqual([])
})

test('ThemeToggle cambia el modo del ThemeProvider y refleja modo y tema resuelto', async () => {
  const user = userEvent.setup()
  render(<ThemeProvider enableResponsiveMini={false}><ThemeToggle /></ThemeProvider>)
  await user.click(screen.getByRole('button', { name: /^Tema:/ }))
  await user.click(screen.getByRole('button', { name: 'Oscuro' }))
  expect(document.documentElement).toHaveAttribute('data-gcu-theme', 'dark')
  const trigger = screen.getByRole('button', { name: 'Tema: Oscuro' })
  expect(trigger).toHaveAttribute('data-resolved', 'dark')
  await user.click(trigger)
  expect(screen.getByRole('button', { name: 'Oscuro' })).toHaveAttribute('aria-pressed', 'true')
})

test('safeHref descarta esquemas peligrosos y conserva http(s) y rutas relativas', () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  expect(safeHref('javascript:alert(1)', '/notificaciones')).toBe('/notificaciones')
  expect(safeHref(' data:text/html,x')).toBeUndefined()
  expect(safeHref('/avisos/1')).toBe('/avisos/1')
  expect(safeHref('https://example.com/x')).toBe('https://example.com/x')
})
