import { useEffect, useLayoutEffect } from 'react'

/** useLayoutEffect en el navegador (mide antes de pintar) y useEffect en SSR (sin aviso). */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/** Duración de la animación CSS de un elemento en ms (0 si no hay o con reduced-motion). */
export function animationDurationMs(element: Element | null): number {
  if (!element) return 0
  const view = element.ownerDocument?.defaultView
  const raw = view?.getComputedStyle(element).animationDuration ?? ''
  const first = raw.split(',')[0]?.trim() ?? ''
  const value = Number.parseFloat(first)
  if (!Number.isFinite(value) || value <= 0) return 0
  return first.endsWith('ms') ? value : value * 1000
}
