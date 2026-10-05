import { isString } from '../../../utils/typeGuards'
/** Modelo puro de StreamingAnswer: bloques (párrafos) y marcas de cita `[n]`. */

export type AnswerPart = { kind: 'text'; value: string } | { kind: 'cite'; id: number }

/** Separa el texto en bloques por línea en blanco; descarta bloques vacíos. */
export function splitBlocks(text: string): string[] {
  if (!isString(text) || text.trim() === '') return []
  return text.split(/\n[ \t]*\n+/).map((block) => block.trim()).filter((block) => block !== '')
}

/**
 * Bloques que ya terminaron: mientras se genera, el último sigue creciendo y no se anuncia.
 * Al terminar, todos están completos.
 */
export function completedBlocks(text: string, streaming: boolean): string[] {
  const blocks = splitBlocks(text)
  return streaming ? blocks.slice(0, -1) : blocks
}

const CITE = /\[(\d+)\]/g

/** Parte un bloque en texto y citas `[n]`. */
export function parseCitations(block: string): AnswerPart[] {
  const parts: AnswerPart[] = []
  let last = 0
  for (const match of block.matchAll(CITE)) {
    const index = match.index ?? 0
    if (index > last) parts.push({ kind: 'text', value: block.slice(last, index) })
    parts.push({ kind: 'cite', id: Number(match[1]) })
    last = index + match[0].length
  }
  if (last < block.length) parts.push({ kind: 'text', value: block.slice(last) })
  return parts
}

/** Texto plano para lectores de pantalla: `[2]` se lee «(fuente 2)». */
export function spokenBlock(block: string): string {
  return block.replace(CITE, (_m, n: string) => ` (fuente ${n})`).replace(/\s+/g, ' ').trim()
}
