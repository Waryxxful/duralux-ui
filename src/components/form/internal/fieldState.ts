import type * as React from 'react'
import { deprecate, log } from '../../../utils/log'
import { isFunction } from '../../../utils/typeGuards'
import type { ControlSize } from '../../../public/types'

/**
 * Estado de error común de los controles de formulario.
 * `invalid` es el alias legacy de `error`: sigue funcionando y avisa una sola vez.
 */
export function resolveInvalid(component: string, invalid: boolean | undefined, error: boolean | string | undefined): boolean {
  if (invalid !== undefined) {
    deprecate(`${component.toLowerCase()}-invalid`, `la prop \`invalid\` de ${component} es un alias; usa \`error\`.`)
  }
  return Boolean(invalid || error)
}

/** `aria-invalid` explícito del consumidor gana; si no, se marca solo cuando hay error. */
export function ariaInvalidFor(
  explicit: React.AriaAttributes['aria-invalid'],
  isInvalid: boolean,
): React.AriaAttributes['aria-invalid'] {
  if (explicit !== undefined) return explicit
  return isInvalid ? true : undefined
}

/** Clase de tamaño de Bootstrap (`form-control-sm`, `form-select-lg`); `md` es el tamaño base. */
export function sizeClass(base: 'form-control' | 'form-select', size: ControlSize | undefined): string | undefined {
  if (size === undefined || size === 'md') return undefined
  if (size === 'sm' || size === 'lg') return `${base}-${size}`
  log.warn(`controlSize "${String(size)}" no existe; se usa el tamaño md.`)
  return undefined
}

const warned = new Set<string>()

/** Aviso de fallback una sola vez por clave: no inunda la consola al re-renderizar listas. */
export function warnOnce(key: string, message: string): void {
  if (warned.has(key)) return
  warned.add(key)
  log.warn(message)
}

/** Ref que el componente puede escribir: callback u objeto mutable (forwardRef o useRef). */
export type WritableRef<T> = React.RefCallback<T> | React.MutableRefObject<T | null> | null | undefined

/** Une el ref reenviado por el consumidor con un ref interno del componente. */
export function mergeRefs<T>(...refs: Array<WritableRef<T>>): React.RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (isFunction<WritableRef<T>, React.RefCallback<T>>(ref)) ref(node)
      else if (ref) ref.current = node
    }
  }
}
