import type * as React from 'react'

/** Hay algo que mostrar (descarta undefined, null, false y cadena vacía). */
export function hasContent(value: React.ReactNode): boolean {
  return value !== undefined && value !== null && value !== false && value !== ''
}

/** Une ids para `aria-describedby` sin repetir ni dejar espacios sobrantes. */
export function joinIds(...ids: Array<string | undefined>): string | undefined {
  const unique = Array.from(new Set(ids.flatMap((id) => (id ? id.trim().split(/\s+/) : []))))
  return unique.length === 0 ? undefined : unique.join(' ')
}
