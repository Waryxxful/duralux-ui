import { forwardRef } from 'react'
import { cx } from '../../../utils/cx'
import { log } from '../../../utils/log'
import { isArray, isFiniteNumber } from '../../../utils/typeGuards'
import type { FunnelProps } from '../../../public/types'
import { formatIndicatorNumber } from '../../ui/internal/indicator'
import { stepConversion } from './crmModel'

const defaultFormat = (value: number) => formatIndicatorNumber(value)

/**
 * Funnel — embudo de conversión (leads → contactados → calificados → ganados).
 *
 * - Lista ordenada: cada paso con su cifra (tabular), barra proporcional al primero y la
 *   conversión desde el paso anterior en texto («62 % del paso anterior»).
 * - La barra es decorativa: la cifra y el porcentaje dicen todo.
 * Estilos: src/styles/components/funnel.css.
 */
export const Funnel = /* @__PURE__ */ forwardRef<HTMLOListElement, FunnelProps>(function Funnel({
  steps,
  format = defaultFormat,
  label = 'Embudo de conversión',
  className,
  ...rest
}, ref) {
  const list = isArray(steps) ? steps : []
  if (!isArray(steps)) log.warn('Funnel: `steps` debe ser un arreglo; se muestra vacío.')
  const first = list[0]?.value
  const top = isFiniteNumber(first) && first > 0 ? first : 1

  return (
    <ol {...rest} ref={ref} className={cx('gcu-funnel', 'gcu-container', className)} aria-label={label}>
      {list.map((step, index) => {
        const conversion = stepConversion(step.value, list[index - 1]?.value)
        const width = Math.max(2, Math.min(100, (step.value / top) * 100))
        return (
          <li key={step.label} className="gcu-funnel__step">
            <span className="gcu-funnel__label">{step.label}</span>
            <span className="gcu-funnel__bar" aria-hidden="true">
              <span className="gcu-funnel__fill" style={{ width: `${width}%` }} />
            </span>
            <span className="gcu-funnel__value gcu-tabular">{format(step.value)}</span>
            <span className="gcu-funnel__conv gcu-tabular">
              {conversion === null ? '' : (
                <>
                  {`${conversion} %`}
                  <span className="visually-hidden"> del paso anterior</span>
                </>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
})
