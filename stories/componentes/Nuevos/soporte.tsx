import type * as React from 'react'
import type { Decorator } from '@storybook/react-vite'

export { TresTemas } from '../Graficos/TresTemas'

/**
 * Ancho de la story (`parameters.maxWidth`, por defecto 420 px) y un h2 oculto: los componentes
 * usan h3 por defecto y el orden de encabezados de la página se mantiene.
 */
export const conAncho = (porDefecto: number | 'none' = 420): Decorator => (Story, ctx) => (
  <section aria-labelledby="sb-nuevos">
    <h2 id="sb-nuevos" className="visually-hidden">{String(ctx.title.split('/').pop())}</h2>
    <div style={{ maxWidth: ctx.parameters.maxWidth ?? porDefecto }}>
      <Story />
    </div>
  </section>
)

/** Rejilla simple para mostrar variantes una al lado de la otra. */
export function Fila({ children, min = '16rem' }: { children: React.ReactNode; min?: string }) {
  return (
    <div className="d-grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))` }}>
      {children}
    </div>
  )
}

export const HORAS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
export const NIVEL_SERVICIO = [78, 81, 79, 84, 86, 85, 83, 86]
export const LLAMADAS = [180, 240, 310, 290, 260, 330, 410, 380]
