import { cloneElement, forwardRef, isValidElement, useCallback, useEffect, useId, useRef, useState } from 'react'
import type * as React from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { assignRef } from '../../utils/assignRef'
import { isFiniteNumber } from '../../utils/typeGuards'
import { registerDismissableLayer } from '../../utils/dismissableLayer'
import { useThemeBoundaryMode } from '../../theme/themeBoundary'
import type { TooltipProps } from '../../public/types'
import { useIsClient, useIsomorphicLayoutEffect } from './internal/layoutEffect'
import { placeTooltip } from './internal/tooltipPosition'

const MIN_DELAY = 400
const MAX_DELAY = 700
const DEFAULT_DELAY = 500
/** Ventana en la que un vecino aparece al instante (Craft «Hover Restraint»). */
const WARM_WINDOW_MS = 300
const HIDE_GRACE_MS = 100

interface TooltipGroup {
  openCount: number
  lastCloseAt: number
  /** Cierra el tooltip visible: al aparecer un vecino, solo queda uno. */
  closeActive: (() => void) | null
}

/** Estado compartido entre tooltips: si hay uno abierto o se cerró hace poco, el siguiente no espera. */
const tooltipGroup: TooltipGroup = { openCount: 0, lastCloseAt: Number.NEGATIVE_INFINITY, closeActive: null }

function isWarm(): boolean {
  return tooltipGroup.openCount > 0 || Date.now() - tooltipGroup.lastCloseAt < WARM_WINDOW_MS
}

function resolveDelay(delay: number): number {
  if (!isFiniteNumber(delay)) {
    log.warn(`Tooltip: delay=${String(delay)} no es un número; se usan ${DEFAULT_DELAY} ms.`)
    return DEFAULT_DELAY
  }
  if (delay < MIN_DELAY || delay > MAX_DELAY) {
    log.warn(`Tooltip: delay=${delay} ms fuera de 400–700; se acota.`)
    return Math.min(MAX_DELAY, Math.max(MIN_DELAY, delay))
  }
  return delay
}

function matchesFocusVisible(element: Element): boolean {
  try {
    return element.matches(':focus-visible')
  } catch {
    return true
  }
}

/** Disparador visible del tooltip: el elemento cuyo aria-describedby lo nombra. */
function findTrigger(id: string): HTMLElement | null {
  // `~=` compara ids separados por espacios; se escapan comillas y barras del id del consumidor.
  const safeId = id.replace(/["\\]/g, '\\$&')
  return globalThis.document?.querySelector<HTMLElement>(`[aria-describedby~="${safeId}"]`) ?? null
}

interface TriggerProps {
  'aria-describedby'?: string
  onPointerEnter?: React.PointerEventHandler<HTMLElement>
  onPointerLeave?: React.PointerEventHandler<HTMLElement>
  onPointerDown?: React.PointerEventHandler<HTMLElement>
  onFocus?: React.FocusEventHandler<HTMLElement>
  onBlur?: React.FocusEventHandler<HTMLElement>
}

/**
 * Tooltip — texto breve que complementa a un control; nunca la única fuente de la información
 * (un botón de solo ícono ya lleva `label`; el tooltip lo repite a la vista).
 *
 * - Hover con puntero: el primero espera `delay` (400–700 ms); los vecinos aparecen al instante
 *   si otro está abierto o se cerró hace menos de 300 ms (Craft «Hover Restraint»).
 * - Foco con teclado: aparece sin espera. Esc, blur, clic o salir del puntero lo cierran.
 * - Mientras está visible, el disparador lleva `aria-describedby` hacia el `role="tooltip"`.
 * - Se puede recorrer con el puntero (no se cierra al pasar al globo). Portal en body con el tema
 *   del contenedor; z-index `--gcu-z-tooltip`. Entra con opacidad (0 ms con reduced-motion).
 * - El ref apunta al globo (`role="tooltip"`), que solo existe mientras está visible.
 */
export const Tooltip = /* @__PURE__ */ forwardRef<HTMLDivElement, TooltipProps>(function Tooltip({
  content,
  children,
  placement = 'top',
  delay = DEFAULT_DELAY,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
  id: idProp,
}, forwardedRef) {
  const autoId = useId()
  const id = idProp ?? `gcu-tooltip-${autoId.replace(/:/g, '')}`
  const themeMode = useThemeBoundaryMode()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const mounted = useIsClient()
  const open = !disabled && (controlledOpen ?? uncontrolledOpen)
  const bubbleRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const wait = resolveDelay(delay)

  const setOpen = useCallback((next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }, [controlledOpen, onOpenChange])

  const clearTimer = () => {
    if (timerRef.current !== undefined) clearTimeout(timerRef.current)
    timerRef.current = undefined
  }
  const show = (immediate: boolean) => {
    clearTimer()
    if (disabled || open) return
    if (immediate || isWarm()) setOpen(true)
    else timerRef.current = setTimeout(() => setOpen(true), wait)
  }
  const hide = (immediate: boolean) => {
    clearTimer()
    if (!open) return
    if (immediate) setOpen(false)
    else timerRef.current = setTimeout(() => setOpen(false), HIDE_GRACE_MS)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) clearTimeout(timerRef.current)
    }
  }, [])

  // Grupo «tibio», Esc y clic fuera mientras está visible.
  useEffect(() => {
    if (!open || !mounted) return undefined
    const closeSelf = () => setOpen(false)
    tooltipGroup.closeActive?.()
    tooltipGroup.closeActive = closeSelf
    tooltipGroup.openCount += 1
    const unregister = registerDismissableLayer({
      element: bubbleRef.current,
      onEscape: () => setOpen(false),
    })
    return () => {
      unregister()
      if (tooltipGroup.closeActive === closeSelf) tooltipGroup.closeActive = null
      tooltipGroup.openCount -= 1
      tooltipGroup.lastCloseAt = Date.now()
    }
  }, [mounted, open, setOpen])

  useIsomorphicLayoutEffect(() => {
    if (!open || !mounted) return undefined
    // El disparador es quien apunta al globo con aria-describedby: no hace falta tomar el ref del hijo.
    const update = () => placeTooltip(findTrigger(id), bubbleRef.current, placement)
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [id, mounted, open, placement])

  if (!isValidElement<TriggerProps>(children)) {
    log.warn('Tooltip: `children` debe ser un único elemento enfocable; se muestra sin tooltip.')
    return <>{children}</>
  }

  const childProps = children.props
  const describedBy = [childProps['aria-describedby'], open ? id : undefined].filter(Boolean).join(' ') || undefined

  const triggerProps: TriggerProps = {
    'aria-describedby': describedBy,
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      childProps.onPointerEnter?.(event)
      if (event.pointerType !== 'touch') show(false)
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      childProps.onPointerLeave?.(event)
      hide(false)
    },
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      childProps.onPointerDown?.(event)
      hide(true)
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onFocus?.(event)
      if (matchesFocusVisible(event.currentTarget)) show(true)
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      childProps.onBlur?.(event)
      hide(true)
    },
  }
  const trigger = cloneElement(children, triggerProps)

  const bubble = open && mounted && globalThis.document?.body
    ? createPortal(
      <div
        ref={(node) => {
          bubbleRef.current = node
          assignRef(forwardedRef, node)
        }}
        id={id}
        role="tooltip"
        data-gcu-modal-layer="tooltip"
        data-placement={placement}
        data-gcu-theme={themeMode}
        className={cx('gcu-tooltip', themeMode && 'gcu-theme', className)}
        onPointerEnter={clearTimer}
        onPointerLeave={() => hide(false)}
      >
        {content}
      </div>,
      document.body,
    )
    : null

  return (
    <>
      {trigger}
      {bubble}
    </>
  )
})
