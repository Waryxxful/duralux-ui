import type * as React from 'react'

/** Rejilla simple para mostrar variantes una al lado de la otra. */
export function Fila({ children, min = '16rem' }: { children: React.ReactNode; min?: string }) {
  return (
    <div className="d-grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))` }}>
      {children}
    </div>
  )
}
