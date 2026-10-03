/**
 * Logger de la librería. Prefijo fijo `[duralux]` para filtrar en consola.
 * - `error` siempre se emite.
 * - `warn`, `info` y `debug` solo fuera de producción (deprecaciones, fallbacks).
 * El bundler del consumidor reemplaza `process.env.NODE_ENV`; si no existe, se asume desarrollo.
 */
// El bundler del consumidor reemplaza esta expresión; no dependemos de @types/node.
declare const process: { env: { NODE_ENV?: string } }

const PREFIX = '[duralux]'

function isProduction(): boolean {
  try {
    return process.env.NODE_ENV === 'production'
  } catch {
    return false
  }
}

export const log = {
  error: (...args: unknown[]) => console.error(PREFIX, ...args),
  warn: (...args: unknown[]) => { if (!isProduction()) console.warn(PREFIX, ...args) },
  info: (...args: unknown[]) => { if (!isProduction()) console.info(PREFIX, ...args) },
  debug: (...args: unknown[]) => { if (!isProduction()) console.debug(PREFIX, ...args) },
}

const warnedOnce = new Set<string>()

/** Aviso de deprecación una sola vez por clave (no inunda la consola en listas). */
export function deprecate(key: string, message: string): void {
  if (warnedOnce.has(key)) return
  warnedOnce.add(key)
  log.warn(`Deprecado: ${message}`)
}
