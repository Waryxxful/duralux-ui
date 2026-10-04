import type * as React from 'react'
import { ThemeScope } from '../../../src'

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
