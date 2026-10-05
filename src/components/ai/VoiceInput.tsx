import { forwardRef, useEffect, useState } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import type { VoiceInputProps } from '../../public/types'
import { formatCountdown } from './internal/aiFormat'
import { useElapsed } from './internal/useElapsed'

let warnedUnsupported = false

/** ¿El navegador tiene Web Speech API? Solo en el cliente (en SSR se asume que no). */
function hasSpeechRecognition(): boolean {
  if (!('window' in globalThis)) return false
  // SpeechRecognition no está en lib.dom: se consulta como propiedad del global.
  return 'SpeechRecognition' in globalThis || 'webkitSpeechRecognition' in globalThis
}

/**
 * VoiceInput — dictar la pregunta. Muestra el estado (barras de nivel y tiempo); la captura real
 * la hace la app con `onToggle` (el componente no graba ni envía audio).
 *
 * - Botón `aria-pressed`: «Dictar pregunta» / «Detener dictado».
 * - Sin Web Speech API: el botón queda deshabilitado con el aviso visible y se avisa por log una vez.
 *   La detección ocurre al montar (no en SSR); `forceUnsupported` lo simula en stories.
 * Estilos: src/styles/components/ai-controls.css.
 */
export const VoiceInput = /* @__PURE__ */ forwardRef<HTMLDivElement, VoiceInputProps>(function VoiceInput({
  recording,
  onToggle,
  label = 'Dictar pregunta',
  forceUnsupported = false,
  unsupportedText = 'Tu navegador no permite dictar. Escribe tu pregunta.',
  disabled = false,
  className,
  ...rest
}, ref) {
  const [supported, setSupported] = useState(true)
  useEffect(() => {
    const ok = !forceUnsupported && hasSpeechRecognition()
    setSupported(ok)
    if (!ok && !warnedUnsupported) {
      warnedUnsupported = true
      log.warn('VoiceInput: el navegador no tiene Web Speech API; el dictado queda deshabilitado.')
    }
  }, [forceUnsupported])
  const active = recording && supported
  const seconds = useElapsed(active)

  return (
    <div {...rest} ref={ref} className={cx('gcu-ai-voice', active && 'gcu-ai-voice--on', !supported && 'gcu-ai-voice--unsupported', className)}>
      <button
        type="button"
        className="gcu-ai-voice__button"
        aria-pressed={active}
        disabled={disabled || !supported}
        onClick={onToggle}
      >
        <i className={active ? 'feather-square' : 'feather-mic'} aria-hidden="true" />
        <span className="gcu-ai-voice__bars" aria-hidden="true"><i /><i /><i /><i /><i /></span>
        <span>{active ? 'Detener dictado' : label}</span>
        {active && <span className="gcu-ai-voice__time" aria-hidden="true">{formatCountdown(seconds)}</span>}
      </button>
      <span className="visually-hidden" aria-live="polite">{active ? 'Escuchando' : ''}</span>
      {!supported && <p className="gcu-ai-voice__note">{unsupportedText}</p>}
    </div>
  )
})
