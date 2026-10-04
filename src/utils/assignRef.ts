import type * as React from 'react'
import { isFunction } from './typeGuards'

/** Asigna un nodo a un ref reenviado (callback u objeto), para combinarlo con un ref interno. */
export function assignRef<T>(ref: React.ForwardedRef<T> | undefined, node: T | null): void {
  if (isFunction<React.ForwardedRef<T>, (instance: T | null) => void>(ref)) ref(node)
  else if (ref) ref.current = node
}
