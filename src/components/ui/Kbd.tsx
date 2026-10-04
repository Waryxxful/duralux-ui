import { Fragment, forwardRef } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { KbdProps } from '../../public/types'

/** Identidad estable por tecla: el texto más su repetición («Shift», «Shift-2»). */
function keyEntries(keys: ReadonlyArray<string>) {
  const seen = new Map<string, number>()
  return keys.map((key, position) => {
    const count = (seen.get(key) ?? 0) + 1
    seen.set(key, count)
    return { id: count === 1 ? key : `${key}-${count}`, key, first: position === 0 }
  })
}

/**
 * Kbd — tecla o atajo de teclado.
 *
 * - children: una tecla (`<Kbd>Esc</Kbd>`).
 * - keys: combinación; cada tecla va en su propio `<kbd>` dentro de uno exterior (semántica HTML
 *   para «entrada de teclado compuesta») y se separan con «+».
 * - El ref apunta al `<kbd>` exterior.
 */
export const Kbd = /* @__PURE__ */ forwardRef<HTMLElement, KbdProps>(function Kbd(
  { keys, children, className, ...rest },
  ref,
) {
  const hasKeys = Array.isArray(keys) && keys.length > 0
  if (hasKeys && children !== undefined && children !== null) {
    log.warn('Kbd: recibió `keys` y `children`; se muestran solo las `keys`.')
  }
  if (!hasKeys) {
    return <kbd {...rest} ref={ref} className={cx('gcu-kbd', className)}>{children}</kbd>
  }
  return (
    <kbd {...rest} ref={ref} className={cx('gcu-kbd-combo', className)}>
      {keyEntries(keys).map(({ id, key, first }) => (
        <Fragment key={id}>
          {!first && <span className="gcu-kbd-combo__plus" aria-hidden="true">+</span>}
          <kbd className="gcu-kbd">{key}</kbd>
        </Fragment>
      ))}
    </kbd>
  )
})
