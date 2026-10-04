import { forwardRef, useCallback } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { assignRef } from '../../utils/assignRef'
import type { DividerProps } from '../../public/types'

function hasLabel(label: DividerProps['label']): boolean {
  return label !== undefined && label !== null && label !== false && label !== ''
}

/**
 * Divider — separador entre bloques.
 *
 * - Sin etiqueta: `<hr>` nativo (separador para lectores de pantalla). `orientation="vertical"`
 *   lo dibuja vertical dentro de una fila flex y declara `aria-orientation`.
 * - Con etiqueta («o continúa con»): el texto queda entre dos líneas decorativas; el texto ya
 *   comunica la separación, así que no se anuncia un separador extra.
 * - Una etiqueta en vertical no tiene espacio: se ignora con aviso.
 */
export const Divider = /* @__PURE__ */ forwardRef<HTMLElement, DividerProps>(function Divider(
  { label, orientation = 'horizontal', align = 'center', className, ...rest },
  ref,
) {
  const vertical = orientation === 'vertical'
  // Callback tipado como HTMLElement: sirve tanto para el <div> como para el <hr>.
  const setRef = useCallback((node: HTMLElement | null) => assignRef(ref, node), [ref])
  if (vertical && hasLabel(label)) log.warn('Divider: la etiqueta solo se muestra en horizontal; se ignora en vertical.')

  if (!vertical && hasLabel(label)) {
    return (
      <div
        {...rest}
        ref={setRef}
        className={cx('gcu-divider', 'gcu-divider--label', align === 'start' && 'gcu-divider--start', className)}
      >
        <span className="gcu-divider__label">{label}</span>
      </div>
    )
  }

  return (
    <hr
      {...rest}
      ref={setRef}
      className={cx('gcu-divider', vertical && 'gcu-divider--vertical', className)}
      aria-orientation={vertical ? 'vertical' : undefined}
    />
  )
})
