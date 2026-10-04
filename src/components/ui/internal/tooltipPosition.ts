import type { TooltipPlacement } from '../../../public/types'

const GAP = 8
const VIEWPORT_MARGIN = 8

const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  start: 'end',
  end: 'start',
}

interface Box { top: number; left: number }

function coordinates(trigger: DOMRect, width: number, height: number, side: TooltipPlacement, rtl: boolean): Box {
  const physical = side === 'start' ? (rtl ? 'right' : 'left') : side === 'end' ? (rtl ? 'left' : 'right') : side
  switch (physical) {
    case 'bottom':
      return { top: trigger.bottom + GAP, left: trigger.left + (trigger.width - width) / 2 }
    case 'left':
      return { top: trigger.top + (trigger.height - height) / 2, left: trigger.left - width - GAP }
    case 'right':
      return { top: trigger.top + (trigger.height - height) / 2, left: trigger.right + GAP }
    default:
      return { top: trigger.top - height - GAP, left: trigger.left + (trigger.width - width) / 2 }
  }
}

function fits(box: Box, width: number, height: number, viewWidth: number, viewHeight: number): boolean {
  return box.top >= VIEWPORT_MARGIN
    && box.left >= VIEWPORT_MARGIN
    && box.top + height <= viewHeight - VIEWPORT_MARGIN
    && box.left + width <= viewWidth - VIEWPORT_MARGIN
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, Math.max(min, max)))
}

/**
 * Ubica el globo junto al disparador (position: fixed). Si no cabe del lado pedido, prueba el
 * opuesto; al final lo acota al viewport. Escribe directo en el DOM: no provoca renders.
 */
export function placeTooltip(trigger: HTMLElement | null, bubble: HTMLElement | null, placement: TooltipPlacement) {
  if (!trigger || !bubble) return
  const view = trigger.ownerDocument.defaultView
  if (!view) return
  const rect = trigger.getBoundingClientRect()
  const width = bubble.offsetWidth
  const height = bubble.offsetHeight
  const rtl = view.getComputedStyle(trigger).direction === 'rtl'
  let side = placement
  let box = coordinates(rect, width, height, side, rtl)
  if (!fits(box, width, height, view.innerWidth, view.innerHeight)) {
    const flipped = coordinates(rect, width, height, OPPOSITE[placement], rtl)
    if (fits(flipped, width, height, view.innerWidth, view.innerHeight)) {
      side = OPPOSITE[placement]
      box = flipped
    }
  }
  bubble.style.top = `${clamp(box.top, VIEWPORT_MARGIN, view.innerHeight - height - VIEWPORT_MARGIN)}px`
  bubble.style.left = `${clamp(box.left, VIEWPORT_MARGIN, view.innerWidth - width - VIEWPORT_MARGIN)}px`
  bubble.setAttribute('data-placement', side)
}
