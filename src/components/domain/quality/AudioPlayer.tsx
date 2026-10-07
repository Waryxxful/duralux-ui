import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../../utils/cx'
import { log } from '../../../utils/log'
import { isFiniteNumber } from '../../../utils/typeGuards'
import type { AudioMark, AudioPlayerHandle, AudioPlayerProps } from '../../../public/types'
import { IconButton } from '../../ui/Button'
import { clamp, formatDuration, spokenDuration } from '../internal/duration'
import { nextRate, playerKeyAction, waveHeights } from './qualityModel'

const DEFAULT_RATES: ReadonlyArray<number> = [1, 1.25, 1.5, 2]
const WAVE_BARS = 72
const rateFormat = /* @__PURE__ */ new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 })

/**
 * AudioPlayer — grabación de una llamada: reproducir/pausar, retroceder y adelantar, velocidad,
 * barra de posición y marcas en los momentos con error.
 *
 * - La posición es un `<input type="range">` nativo: flechas, Re Pág/Av Pág, Inicio y Fin.
 *   `aria-valuetext` la dice en palabras. Atajos con el foco en el reproductor: Espacio o K
 *   (reproducir), J y L (retroceder y adelantar).
 * - waveform: onda decorativa (estable, sin Math.random) detrás de la barra; `false` es la
 *   alternativa sin onda, solo la barra.
 * - marks: botones «Ir a 1:23: Promesa incumplida» bajo la barra y su marca sobre la pista.
 * - Sin `src` simula el avance (demos). Errores de carga y de reproducción quedan en el log
 *   y se muestran en texto.
 * - playerRef expone seek, play, pause y currentTime para saltar a una cita desde afuera.
 *   El ref del componente sigue siendo el div raíz.
 * Estilos: src/styles/components/audio-player.css.
 */
export const AudioPlayer = /* @__PURE__ */ forwardRef<HTMLDivElement, AudioPlayerProps>(function AudioPlayer({
  src,
  duration: initialDuration,
  marks,
  onMarkClick,
  onTimeChange,
  waveform = true,
  skipSeconds = 10,
  rates = DEFAULT_RATES,
  label = 'Grabación de la llamada',
  playerRef,
  className,
  onKeyDown,
  ...rest
}, ref) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const known = isFiniteNumber(initialDuration) && initialDuration > 0 ? initialDuration : 0
  const [loadedDuration, setLoadedDuration] = useState<number | null>(null)
  const duration = loadedDuration ?? known
  const [position, setPosition] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(rates[0] ?? 1)
  const [failed, setFailed] = useState(false)
  // Barras decorativas de posición fija: su posición es su identidad.
  const bars = useMemo(() => waveHeights(WAVE_BARS).map((height, order) => ({ id: `bar-${order}`, order, height })), [])
  const markList = marks ?? []
  const positionRef = useRef(0)

  // Nueva grabación: vuelve al inicio (ajuste durante el render, sin efecto).
  const [trackedSrc, setTrackedSrc] = useState(src)
  if (trackedSrc !== src) {
    setTrackedSrc(src)
    setPosition(0)
    setPlaying(false)
    setLoadedDuration(null)
    setFailed(false)
  }
  // El ref de la simulación vuelve a 0 con la grabación (antes del efecto que lo lee).
  useEffect(() => {
    positionRef.current = 0
  }, [src])

  // La simulación (sin `src`) termina sola al llegar al final.
  const simulatedEnd = !src && duration > 0 && position >= duration
  const isPlaying = playing && !simulatedEnd

  /** Única vía para mover la posición: actualiza el estado y avisa al consumidor en el mismo evento. */
  const updatePosition = useCallback((seconds: number) => {
    positionRef.current = seconds
    setPosition(seconds)
    onTimeChange?.(seconds)
  }, [onTimeChange])

  // Sin audio real: simula el avance para demos y vistas previas.
  useEffect(() => {
    if (!isPlaying || src) return undefined
    const timer = setInterval(() => {
      updatePosition(Math.min(duration, positionRef.current + 0.5 * rate))
    }, 500)
    return () => clearInterval(timer)
  }, [isPlaying, rate, duration, src, updatePosition])

  useEffect(() => {
    if (audio.current) audio.current.playbackRate = rate
  }, [rate, src])

  const seek = useCallback((seconds: number) => {
    const next = clamp(seconds, 0, duration)
    updatePosition(next)
    if (audio.current) audio.current.currentTime = next
  }, [duration, updatePosition])

  const play = useCallback((): Promise<void> | void => {
    const element = audio.current
    if (!element) {
      if (duration > 0 && positionRef.current >= duration) updatePosition(0)
      setPlaying(true)
      return
    }
    return element.play().catch((error: Error) => {
      log.warn('AudioPlayer: no se pudo reproducir el audio.', error.message)
      setFailed(true)
    })
  }, [duration, updatePosition])

  const pause = useCallback(() => {
    const element = audio.current
    if (!element) {
      setPlaying(false)
      return
    }
    element.pause()
  }, [])

  useImperativeHandle(playerRef ?? undefined, (): AudioPlayerHandle => ({
    seek,
    play,
    pause,
    get currentTime() {
      return positionRef.current
    },
  }), [seek, play, pause])

  const toggle = () => {
    // Con audio real el estado lo dictan los eventos play/pause (también los controles del sistema).
    if (audio.current ? playing : isPlaying) pause()
    else void play()
  }

  const jumpToMark = (mark: AudioMark) => {
    seek(mark.at)
    onMarkClick?.(mark)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
    const target = event.target
    // Los botones y la barra ya responden a sus teclas nativas.
    if (target instanceof HTMLButtonElement || target instanceof HTMLInputElement) return
    const action = playerKeyAction(event.key)
    if (!action) return
    event.preventDefault()
    if (action === 'toggle') toggle()
    else seek(position + (action === 'forward' ? skipSeconds : -skipSeconds))
  }

  const progress = duration > 0 ? (position / duration) * 100 : 0
  const played = Math.round((progress / 100) * WAVE_BARS)

  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      aria-label={label}
      aria-keyshortcuts="Space K J L"
      tabIndex={-1}
      className={cx('gcu-audio', 'gcu-container', waveform && 'gcu-audio--wave', className)}
      onKeyDown={handleKeyDown}
    >
      {src && (
        <audio
          ref={audio}
          src={src}
          preload="metadata"
          onLoadedMetadata={(event) => {
            const value = event.currentTarget.duration
            // Streams sin metadatos entregan NaN o Infinity: se conserva la duración conocida.
            setLoadedDuration(Number.isFinite(value) && value > 0 ? value : null)
          }}
          onTimeUpdate={(event) => updatePosition(event.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => {
            setPlaying(false)
            setFailed(true)
            log.error('AudioPlayer: error al cargar el audio.')
          }}
        />
      )}
      <div className="gcu-audio__controls">
        <IconButton
          icon="rotate-ccw"
          label={`Retroceder ${skipSeconds} segundos`}
          size="sm"
          onClick={() => seek(position - skipSeconds)}
        />
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          label={isPlaying ? 'Pausar' : 'Reproducir'}
          variant="primary"
          onClick={toggle}
          disabled={failed}
        />
        <IconButton
          icon="rotate-cw"
          label={`Adelantar ${skipSeconds} segundos`}
          size="sm"
          onClick={() => seek(position + skipSeconds)}
        />
      </div>
      <div className="gcu-audio__track">
        {waveform && (
          <span className="gcu-audio__wave" aria-hidden="true">
            {bars.map((bar) => (
              <i key={bar.id} className={cx(bar.order < played && 'is-played')} style={{ height: `${bar.height}%` }} />
            ))}
          </span>
        )}
        {markList.map((mark) => (
          <span
            key={`mark-${mark.at}-${mark.label}`}
            className="gcu-audio__mark"
            style={{ insetInlineStart: `${duration > 0 ? clamp((mark.at / duration) * 100, 0, 100) : 0}%` }}
            aria-hidden="true"
          />
        ))}
        <input
          type="range"
          className="gcu-audio__range"
          min={0}
          max={Math.max(1, Math.round(duration))}
          step={1}
          value={Math.round(position)}
          aria-label="Posición del audio"
          aria-valuetext={`${spokenDuration(position)} de ${spokenDuration(duration)}`}
          // SAFETY: propiedad personalizada de CSS; React.CSSProperties no declara variables `--*`.
          style={{ '--gcu-audio-progress': `${progress}%` } as React.CSSProperties}
          onChange={(event) => seek(Number(event.currentTarget.value))}
        />
      </div>
      <span className="gcu-audio__time gcu-tabular" aria-hidden="true">
        {formatDuration(position)} / {formatDuration(duration)}
      </span>
      <button
        type="button"
        className="btn btn-sm btn-light-brand gcu-audio__rate gcu-tabular"
        aria-label={`Velocidad ${rateFormat.format(rate)}×. Cambiar velocidad`}
        onClick={() => setRate(nextRate(rates, rate))}
      >
        {rateFormat.format(rate)}×
      </button>
      <AudioMarkList marks={markList} onJump={jumpToMark} />
      {failed && (
        <p className="gcu-audio__error" role="alert">
          No se pudo reproducir la grabación. Revisa tu conexión y vuelve a intentarlo.
        </p>
      )}
    </div>
  )
})

/** Botones para saltar a cada momento marcado («1:23 Promesa incumplida»). */
function AudioMarkList({ marks, onJump }: { marks: ReadonlyArray<AudioMark>; onJump: (mark: AudioMark) => void }) {
  if (marks.length === 0) return null
  return (
    <ul className="gcu-audio__marks" aria-label="Momentos marcados">
      {marks.map((mark) => (
        <li key={`jump-${mark.at}-${mark.label}`}>
          <button type="button" className="gcu-audio__jump" onClick={() => onJump(mark)}>
            <span className="gcu-audio__jump-time gcu-tabular">{formatDuration(mark.at)}</span>
            <span className="visually-hidden">: </span>
            {mark.label}
          </button>
        </li>
      ))}
    </ul>
  )
}
