/**
 * Reglas compartidas de los indicadores (StatsCard, MiniStatCard, ColoredStatCard,
 * ChartMetricsFooter, QuickLinkGrid): formato es-CL, signo de la variación y tonos.
 * Módulo sin componentes: así los archivos de componente solo exportan componentes (fast refresh).
 */
import type * as React from 'react'
import type { IndicatorDelta, IndicatorTone } from '../../../public/types'
import { log } from '../../../utils/log'
import { isFiniteNumber, isString } from '../../../utils/typeGuards'

const TONE_SET = /* @__PURE__ */ new Set<string>([
  'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'teal', 'indigo', 'dark', 'neutral',
] satisfies ReadonlyArray<IndicatorTone>)
/** Alias de clases legadas que no son tonos: `gray-200` era el fondo neutro por defecto. */
const TONE_ALIASES = /* @__PURE__ */ new Map<string, IndicatorTone>([
  ['gray-200', 'neutral'], ['gray', 'neutral'], ['light', 'neutral'], ['brand', 'primary'], ['darken', 'dark'],
])

/** Signo menos tipográfico (U+2212): mismo ancho que «+» en cifras tabulares. */
const MINUS = '−'
/** Espacio duro entre cifra y unidad («84 %»): la unidad nunca queda sola en otra línea. */
const NBSP = ' '

export function isTone(value: string | null | undefined): value is IndicatorTone {
  return isString(value) && TONE_SET.has(value)
}

/**
 * Traduce lo que llegue (tono, `bg-soft-info text-info`, `bg-primary`, `light-warning`) a un tono.
 * Devuelve `null` si no reconoce nada: el llamador decide el fallback y lo registra.
 */
export function toneFromLegacy(value: string | null | undefined): IndicatorTone | null {
  if (!isString(value) || value.trim() === '') return null
  for (const token of value.trim().split(/\s+/)) {
    const name = token.replace(/^(bg-soft-|bg-|text-|light-)/, '')
    if (isTone(name)) return name
    const alias = TONE_ALIASES.get(name)
    if (alias) return alias
  }
  return null
}

/** Tono final de un componente: el explícito gana; si no, el legado; si no, el por defecto. */
export function resolveTone(
  component: string,
  tone: string | null | undefined,
  legacy: string | null | undefined,
  fallback: IndicatorTone,
): IndicatorTone {
  if (tone !== undefined && tone !== null) {
    if (isTone(tone)) return tone
    log.warn(`${component}: tono desconocido "${String(tone)}"; se usa "${fallback}".`)
    return fallback
  }
  if (legacy === undefined || legacy === null || legacy === '') return fallback
  const parsed = toneFromLegacy(legacy)
  if (parsed) return parsed
  log.debug(`${component}: "${String(legacy)}" no corresponde a un tono; se usa "${fallback}".`)
  return fallback
}

const numberFormats = /* @__PURE__ */ new Map<number, Intl.NumberFormat>()

/** Número en es-CL: punto de miles y coma decimal (2.840 · 4,3). */
export function formatIndicatorNumber(value: number, fractionDigits?: number): string {
  const key = isFiniteNumber(fractionDigits) ? fractionDigits : -1
  let format = numberFormats.get(key)
  if (!format) {
    format = new Intl.NumberFormat('es-CL', key === -1
      ? { maximumFractionDigits: 1 }
      : { minimumFractionDigits: key, maximumFractionDigits: key })
    numberFormats.set(key, format)
  }
  return format.format(value)
}

const valueFormat = /* @__PURE__ */ new Intl.NumberFormat('es-CL', { maximumFractionDigits: 3 })

/** La cifra principal: un número solo recibe formato es-CL (no se redondea más allá de 3 decimales). */
export function formatIndicatorValue(value: React.ReactNode): React.ReactNode {
  if (isFiniteNumber(value)) return valueFormat.format(value)
  return value
}

export function isEmptyIndicatorValue(value: React.ReactNode): boolean {
  return value === null || value === undefined || value === false || (isString(value) && value.trim() === '')
}

export type DeltaDirection = 'up' | 'down' | 'flat'
export type DeltaSentiment = 'positive' | 'negative' | 'neutral'

export interface FormattedDelta {
  text: string
  direction: DeltaDirection
  sentiment: DeltaSentiment
  /** Sentido en palabras para lectores de pantalla (la flecha es decorativa). */
  spoken: string
}

const SPOKEN = { up: 'Sube', down: 'Baja', flat: 'Sin cambio' } satisfies Record<DeltaDirection, string>

function withUnit(number: string, unit: string | undefined): string {
  if (!unit) return number
  return `${number}${NBSP}${unit}`
}

function sentimentFor(direction: DeltaDirection, goodWhen: 'up' | 'down'): DeltaSentiment {
  if (direction === 'flat') return 'neutral'
  return direction === goodWhen ? 'positive' : 'negative'
}

/** Variación con signo y unidad: «+4 pts», «−0,8 %», «0 %». `null` si el valor no es un número finito. */
export function formatDelta(component: string, delta: IndicatorDelta | undefined | null): FormattedDelta | null {
  if (!delta) return null
  if (!isFiniteNumber(delta.value)) {
    log.warn(`${component}: delta.value debe ser un número finito; se omite la variación.`, delta.value)
    return null
  }
  const direction: DeltaDirection = delta.value > 0 ? 'up' : delta.value < 0 ? 'down' : 'flat'
  const magnitude = formatIndicatorNumber(Math.abs(delta.value), delta.fractionDigits)
  const sign = direction === 'up' ? '+' : direction === 'down' ? MINUS : ''
  return {
    text: withUnit(`${sign}${magnitude}`, delta.unit),
    direction,
    sentiment: sentimentFor(direction, delta.goodWhen === 'down' ? 'down' : 'up'),
    spoken: SPOKEN[direction],
  }
}

/**
 * Tendencia legada (`{ value: '36,8%', up: true }` o `trend` + `trendUp`): el texto ya viene
 * formateado; solo se le antepone el signo si no lo trae, para que la variación nunca dependa del color.
 */
export function formatLegacyTrend(value: string | number | null | undefined, up: boolean | undefined): FormattedDelta | null {
  if (value === undefined || value === null || value === '') return null
  const raw = String(value).trim()
  // Igual que la API original: sin `up` (o `trendUp`) la tendencia es a la baja.
  const direction: DeltaDirection = up ? 'up' : 'down'
  const signed = /^[+\-−]/.test(raw) ? raw.replace(/^-/, MINUS) : `${direction === 'up' ? '+' : MINUS}${raw}`
  return { text: signed, direction, sentiment: direction === 'up' ? 'positive' : 'negative', spoken: SPOKEN[direction] }
}

/** Presencia de un nodo opcional: descarta `null`, `undefined`, `false` y texto vacío. */
export function hasIndicatorContent(node: React.ReactNode): boolean {
  return !isEmptyIndicatorValue(node)
}

const contextWarned = /* @__PURE__ */ new Set<string>()

/**
 * Regla §1 de diseño («toda cifra tiene contexto»): avisa una vez por componente y etiqueta
 * cuando una cifra llega sin meta, variación ni tendencia. No cambia lo que se muestra.
 */
export function warnMissingContext(component: string, label: React.ReactNode, hasContext: boolean): void {
  if (hasContext) return
  const key = `${component}:${isString(label) ? label : '?'}`
  if (contextWarned.has(key)) return
  contextWarned.add(key)
  log.warn(`${component}: la cifra "${isString(label) ? label : 'sin etiqueta'}" no tiene contexto; agrega meta, variación o tendencia (delta, context o chart).`)
}

/** Clase completa (`feather-users`, `bi bi-x`) o nombre Feather suelto (`users`). */
export function isIconClass(icon: string): boolean {
  return /^(feather-|bi[- ]|ti[- ]|fa[- ])/.test(icon) || icon.includes(' ')
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
export type HeadingTag = (typeof HEADING_TAGS)[number]

/** Etiqueta del encabezado para `headingLevel` (1–6); fuera de rango usa `fallback`. */
export function headingTag(level: number | undefined, fallback: HeadingTag = 'h3'): HeadingTag {
  return (isFiniteNumber(level) ? HEADING_TAGS[level - 1] : undefined) ?? fallback
}
