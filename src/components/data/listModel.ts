/**
 * Lógica de selección y teclado de List (sin componentes: el archivo de componente solo exporta componentes).
 */
import type { ListItem } from '../../public/types'
import { isString } from '../../utils/typeGuards'

export type ListId = string | number

/** Siguiente índice habilitado en la dirección dada; se detiene en los extremos (patrón APG listbox). */
export function nextEnabledIndex(items: ReadonlyArray<ListItem>, from: number, step: 1 | -1): number {
  for (let index = from + step; index >= 0 && index < items.length; index += step) {
    if (!items[index]?.disabled) return index
  }
  return from
}

export function firstEnabledIndex(items: ReadonlyArray<ListItem>, fromEnd = false): number {
  const start = fromEnd ? items.length : -1
  const found = nextEnabledIndex(items, start, fromEnd ? -1 : 1)
  return found === start ? -1 : found
}

/** Texto de un ítem para la búsqueda por tipeo. */
export function itemText(item: ListItem): string {
  if (isString(item.textValue)) return item.textValue
  return isString(item.title) ? item.title : ''
}

/** Primer ítem habilitado (después del actual, con vuelta) cuyo texto empieza con `query`. */
export function typeaheadIndex(items: ReadonlyArray<ListItem>, from: number, query: string): number {
  const needle = query.toLocaleLowerCase('es-CL')
  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (from + offset) % items.length
    const item = items[index]
    if (item && !item.disabled && itemText(item).toLocaleLowerCase('es-CL').startsWith(needle)) return index
  }
  return -1
}

/** Nueva selección tras activar `id`: en simple reemplaza; en múltiple alterna. */
export function toggleSelection(current: ReadonlyArray<ListId>, id: ListId, mode: 'single' | 'multiple'): ListId[] {
  if (mode === 'single') return [id]
  return current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
}
