export type ClassValue = string | false | null | undefined

/** Concatena clases descartando valores falsy. Convencion unica del paquete
 *  para construir className condicional — no usar template strings sueltos
 *  ni .filter(Boolean).join(' ') repetido en cada componente. */
export function cx(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(' ')
}
