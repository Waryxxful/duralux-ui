import { log } from '../../../utils/log'

const ALLOWED = new Set(['http:', 'https:'])

/**
 * Enlace seguro de una fuente del asistente. Las fuentes vienen del modelo o de tools: no son
 * confiables. Solo se aceptan http/https (nunca `javascript:`, `data:`…); si no pasa, devuelve
 * `undefined` y la fuente se muestra como texto. El aviso por log no incluye la URL.
 * (Equivalente local de src/utils/safeHref.ts de otra rama; el integrador los unifica.)
 */
export function safeSourceHref(href: string | undefined | null): string | undefined {
  if (typeof href !== 'string' || href.trim() === '') return undefined
  try {
    const base = globalThis.location?.href ?? 'http://localhost/'
    const url = new URL(href.trim(), base)
    if (ALLOWED.has(url.protocol)) return url.href
  } catch {
    // URL inválida: cae al aviso.
  }
  log.warn('Fuente del asistente con enlace no permitido (solo http/https); se muestra sin enlace.')
  return undefined
}
