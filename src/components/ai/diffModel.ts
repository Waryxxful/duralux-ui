import { log } from '../../utils/log'
import type { DiffPart } from '../../public/types'

/** Tope de celdas de la tabla LCS: sobre esto se muestra reemplazo completo en vez de colgar la pestaña. */
export const DIFF_MAX_CELLS = 250_000

/**
 * Diferencia genérica (LCS) entre dos secuencias de fragmentos. Recorta prefijo y sufijo comunes
 * antes de comparar; si el centro es demasiado grande, lo muestra como borrado + agregado.
 * Solo registra longitudes en el log, nunca el contenido.
 */
export function diffTokens(a: ReadonlyArray<string>, b: ReadonlyArray<string>, owner = 'diff'): DiffPart[] {
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let end = 0
  while (end < a.length - start && end < b.length - start && a[a.length - 1 - end] === b[b.length - 1 - end]) end++

  const head: DiffPart[] = a.slice(0, start).map((text) => ({ text, kind: 'same' }))
  const tail: DiffPart[] = a.slice(a.length - end).map((text) => ({ text, kind: 'same' }))
  const x = a.slice(start, a.length - end)
  const y = b.slice(start, b.length - end)

  if ((x.length + 1) * (y.length + 1) > DIFF_MAX_CELLS) {
    log.warn(`${owner}: texto demasiado largo (${x.length} × ${y.length}); se muestra reemplazo completo.`)
    return [
      ...head,
      ...x.map((text): DiffPart => ({ text, kind: 'del' })),
      ...y.map((text): DiffPart => ({ text, kind: 'add' })),
      ...tail,
    ]
  }

  // dp[i][j] = largo de la subsecuencia común más larga entre x[i..] e y[j..].
  const dp = Array.from({ length: x.length + 1 }, () => new Uint32Array(y.length + 1))
  for (let i = x.length - 1; i >= 0; i--) {
    for (let j = y.length - 1; j >= 0; j--) {
      dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const middle: DiffPart[] = []
  let i = 0
  let j = 0
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) {
      middle.push({ text: x[i], kind: 'same' })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      middle.push({ text: x[i], kind: 'del' })
      i++
    } else {
      middle.push({ text: y[j], kind: 'add' })
      j++
    }
  }
  while (i < x.length) middle.push({ text: x[i++], kind: 'del' })
  while (j < y.length) middle.push({ text: y[j++], kind: 'add' })
  return [...head, ...middle, ...tail]
}

/** Diferencia palabra a palabra; los espacios se conservan como fragmentos para reconstruir el texto. */
export function wordDiff(before: string, after: string): DiffPart[] {
  return diffTokens(String(before ?? '').split(/(\s+)/), String(after ?? '').split(/(\s+)/), 'wordDiff')
}

/** Diferencia línea a línea (respeta orden y líneas repetidas). */
export function lineDiff(before: string, after: string): DiffPart[] {
  return diffTokens(String(before ?? '').split('\n'), String(after ?? '').split('\n'), 'lineDiff')
}

/**
 * Clave estable por fragmento para listas React: tipo + posición en el texto de origen (antes para
 * `same`/`del`, después para `add`). No depende del índice del arreglo.
 */
export function keyedDiff(parts: ReadonlyArray<DiffPart>): Array<DiffPart & { key: string }> {
  let before = 0
  let after = 0
  return parts.map((part) => {
    const key = part.kind === 'add' ? `a${after}` : `${part.kind === 'del' ? 'd' : 's'}${before}`
    if (part.kind !== 'add') before += 1
    if (part.kind !== 'del') after += 1
    return { ...part, key }
  })
}

/** Cantidad de fragmentos agregados y borrados. */
export interface DiffStats {
  added: number
  removed: number
}

export function diffStats(parts: ReadonlyArray<DiffPart>): DiffStats {
  let added = 0
  let removed = 0
  for (const part of parts) {
    if (part.kind === 'add') added++
    else if (part.kind === 'del') removed++
  }
  return { added, removed }
}
