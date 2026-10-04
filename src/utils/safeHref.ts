import { log } from './log'

const SAFE_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:'])

/**
 * Devuelve `url` si es una ruta relativa o un enlace http/https; si no (p. ej. `javascript:`,
 * `data:`), devuelve `fallback` y avisa. Para todo href que venga de datos (notificaciones,
 * manifest, comandos): evita XSS por esquemas peligrosos.
 */
export function safeHref(url: string | null | undefined, fallback?: string): string | undefined {
  if (url === null || url === undefined || url === '') return fallback
  const base = globalThis.location?.origin && globalThis.location.origin !== 'null'
    ? globalThis.location.origin
    : 'http://localhost'
  try {
    const parsed = new URL(String(url), base)
    if (SAFE_PROTOCOLS.has(parsed.protocol)) return String(url)
  } catch {
    // URL ilegible: se descarta igual que un esquema no permitido.
  }
  log.warn(`URL descartada por esquema no permitido (solo http/https o rutas relativas); se usa ${fallback ?? 'ningún enlace'}.`)
  return fallback
}
