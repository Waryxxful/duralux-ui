import type * as React from 'react'
import { ThemeScope } from '../../../src'

/** Atención del contact center por semana (llamadas). */
export const ATENCION = [
  { name: 'Sem 36', atendidas: 2480, abandonadas: 210, meta: 2600 },
  { name: 'Sem 37', atendidas: 2710, abandonadas: 185, meta: 2600 },
  { name: 'Sem 38', atendidas: 2590, abandonadas: 240, meta: 2600 },
  { name: 'Sem 39', atendidas: 2840, abandonadas: 160, meta: 2600 },
  { name: 'Sem 40', atendidas: 3020, abandonadas: 148, meta: 2600 },
  { name: 'Sem 41', atendidas: 2950, abandonadas: 171, meta: 2600 },
]

export const SERIES_ATENCION = [
  { key: 'atendidas', label: 'Atendidas' },
  { key: 'abandonadas', label: 'Abandonadas' },
]

/** Origen de los leads del mes. */
export const FUENTES = [
  { name: 'Orgánico', value: 1240 },
  { name: 'Referido', value: 860 },
  { name: 'Campaña pagada', value: 610 },
  { name: 'Evento', value: 240 },
]

/** Muestra la misma pieza en claro, oscuro y navy, cada una en su ThemeScope. */
export function TresTemas({ children }: { children: (tema: string) => React.ReactNode }) {
  return (
    <div className="d-grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))' }}>
      {(['light', 'dark', 'navy'] as const).map((tema) => (
        <ThemeScope key={tema} theme={tema} className="p-3 rounded-3" style={{ background: 'var(--gcu-surface-subtle)' }}>
          {children(tema)}
        </ThemeScope>
      ))}
    </div>
  )
}

/** Los títulos de ChartCard son h3: un h2 (oculto) mantiene el orden de encabezados. */
export const conEncabezado = (Story: React.ComponentType) => (
  <section aria-labelledby="sb-graficos">
    <h2 id="sb-graficos" className="visually-hidden">Gráficos</h2>
    <Story />
  </section>
)
