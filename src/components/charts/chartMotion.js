import { useSyncExternalStore } from 'react'
import { isFunction } from '../../utils/typeGuards'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

let mediaQuery
let mediaQueryCleanup
let reducedMotion = false
const subscribers = new Set()

function ensureMediaQuery() {
  if (mediaQuery || !globalThis.window || !isFunction(globalThis.window.matchMedia)) return

  mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  reducedMotion = Boolean(mediaQuery.matches)
  const onChange = (event) => {
    reducedMotion = Boolean(event.matches)
    subscribers.forEach((subscriber) => subscriber())
  }

  if (
    isFunction(mediaQuery.addEventListener)
    && isFunction(mediaQuery.removeEventListener)
  ) {
    mediaQuery.addEventListener('change', onChange)
    mediaQueryCleanup = () => mediaQuery?.removeEventListener('change', onChange)
    return
  }

  if (
    isFunction(mediaQuery.addListener)
    && isFunction(mediaQuery.removeListener)
  ) {
    mediaQuery.addListener(onChange)
    mediaQueryCleanup = () => mediaQuery?.removeListener(onChange)
  }
}

function subscribe(subscriber) {
  ensureMediaQuery()
  subscribers.add(subscriber)

  return () => {
    subscribers.delete(subscriber)
    if (subscribers.size > 0) return

    mediaQueryCleanup?.()
    mediaQueryCleanup = undefined
    mediaQuery = undefined
    reducedMotion = false
  }
}

function getSnapshot() {
  return reducedMotion
}

function getServerSnapshot() {
  return false
}

const subscribeClientReady = () => () => {}
const getClientReadySnapshot = () => true

/**
 * Keeps the server and hydration snapshots false, then flips to true through
 * React's SSR-aware external-store contract. Browser-only chart engines can
 * therefore stay out of the first HTML pass without a post-paint mount flag.
 */
export function useClientReady() {
  return useSyncExternalStore(subscribeClientReady, getClientReadySnapshot, getServerSnapshot)
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
