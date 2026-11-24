import { Children, forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { Icon } from './Icon'
import type { CarouselProps } from '../../public/types'

const etiquetaPorDefecto = (i: number, n: number) => `Imagen ${i + 1} de ${n}`

function reducirMovimiento() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Carousel — diapositivas que se desplazan con scroll-snap nativo (deslizar con el dedo, inercia y teclado los da el
 * navegador). Flechas solo donde hay adónde ir, contador «2 de 3» y puntos (o miniaturas) siempre visibles, y la
 * siguiente asoma por el borde para que se note que hay más. Sin avance automático. Con una diapositiva, solo la
 * diapositiva (y `actions`, si vienen). Patrón ARIA APG «Carousel» sin rotación.
 */
export const Carousel = /* @__PURE__ */ forwardRef<HTMLDivElement, CarouselProps>(function Carousel({
  children,
  index,
  defaultIndex = 0,
  onIndexChange,
  slideSize = '86%',
  slideLabel = etiquetaPorDefecto,
  caption,
  actions,
  thumbnails,
  tone = 'default',
  className,
  style,
  ...rest
}, ref) {
  const slides = Children.toArray(children)
  const total = slides.length
  const [interno, setInterno] = useState(defaultIndex)
  const actual = Math.min(Math.max(index ?? interno, 0), Math.max(total - 1, 0))
  const viewport = useRef<HTMLDivElement | null>(null)
  const espera = useRef<ReturnType<typeof setTimeout>>()
  const nombrado = Boolean(rest['aria-label'] || rest['aria-labelledby'])

  useEffect(() => {
    if (!nombrado) log.warn('Carousel: pasa `aria-label` o `aria-labelledby` («Imágenes de la pregunta 3»).')
    if (thumbnails && thumbnails.length !== total) log.warn(`Carousel: ${thumbnails.length} miniaturas para ${total} diapositivas.`)
  }, [nombrado, thumbnails, total])

  const elegir = useCallback((i: number) => {
    if (i === actual) return
    if (index === undefined) setInterno(i)
    onIndexChange?.(i)
  }, [actual, index, onIndexChange])

  /** Lleva la diapositiva `i` al borde: la última, al final (con asomo no hay más allá). */
  const desplazar = useCallback((i: number) => {
    const v = viewport.current
    const destino = v?.children[i] as HTMLElement | undefined
    if (!v || !destino) return
    const max = v.scrollWidth - v.clientWidth
    const left = i === total - 1 ? max : destino.offsetLeft - (v.children[0] as HTMLElement).offsetLeft
    v.scrollTo?.({ left, behavior: reducirMovimiento() ? 'auto' : 'smooth' })
  }, [total])

  const ir = useCallback((i: number) => {
    const destino = Math.min(Math.max(i, 0), total - 1)
    desplazar(destino)
    elegir(destino)
  }, [desplazar, elegir, total])

  // Un índice controlado que cambia desde afuera también mueve el carrusel.
  useEffect(() => {
    if (index !== undefined) desplazar(index)
  }, [index, desplazar])

  useEffect(() => () => clearTimeout(espera.current), [])

  // Al deslizar con el dedo o la rueda, la diapositiva visible es la más cercana al borde. Se mide cuando el
  // desplazamiento se detiene: durante uno suave (flechas, puntos) la de partida sigue siendo la más cercana y
  // elegirla devolvería el carrusel al inicio.
  const alDesplazar = () => {
    clearTimeout(espera.current)
    espera.current = setTimeout(() => {
      const v = viewport.current
      if (!v) return
      const max = v.scrollWidth - v.clientWidth
      if (max > 0 && v.scrollLeft >= max - 2) return elegir(total - 1)
      const base = (v.children[0] as HTMLElement | undefined)?.offsetLeft ?? 0
      let cercana = 0
      for (let k = 1; k < v.children.length; k++) {
        const d = Math.abs((v.children[k] as HTMLElement).offsetLeft - base - v.scrollLeft)
        if (d < Math.abs((v.children[cercana] as HTMLElement).offsetLeft - base - v.scrollLeft)) cercana = k
      }
      elegir(cercana)
    }, 120)
  }

  const alTeclado = (e: React.KeyboardEvent) => {
    const destino = { ArrowLeft: actual - 1, ArrowRight: actual + 1, Home: 0, End: total - 1 }[e.key]
    if (destino === undefined) return
    e.preventDefault()
    ir(destino)
  }

  const raiz = cx('gcu-carousel', tone === 'inverse' && 'gcu-carousel--inverse', total < 2 && 'gcu-carousel--single', className)
  const estilo = { ...style, '--gcu-carousel-slide': total < 2 ? '100%' : slideSize } as React.CSSProperties

  if (total < 2) {
    return (
      <div ref={ref} {...rest} role="group" className={raiz} style={estilo}>
        {slides[0] !== undefined && <div className="gcu-carousel__single">{slides[0]}</div>}
        {(caption || actions) && (
          <div className="gcu-carousel__bar">
            {caption && <span className="gcu-carousel__caption">{caption(0)}</span>}
            {actions && <span className="gcu-carousel__actions">{actions}</span>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} {...rest} role="region" aria-roledescription="carrusel" className={raiz} style={estilo}>
      <div className="gcu-carousel__stage">
        {/* Área desplazable con foco: las flechas del teclado solo actúan aquí (no compiten con un formulario). */}
        <div ref={viewport} className="gcu-carousel__viewport" tabIndex={0} onScroll={alDesplazar} onKeyDown={alTeclado}
          aria-label="Diapositivas: usa las flechas izquierda y derecha">
          {slides.map((slide, i) => (
            <div key={i} role="group" aria-roledescription="diapositiva" aria-label={slideLabel(i, total)}
              className={cx('gcu-carousel__slide', i === actual && 'is-current')}>
              {slide}
            </div>
          ))}
        </div>
        {actual > 0 && (
          <button type="button" className="gcu-carousel__nav gcu-carousel__nav--prev" aria-label="Imagen anterior" onClick={() => ir(actual - 1)}>
            <Icon name="chevron-left" aria-hidden="true" />
          </button>
        )}
        {actual < total - 1 && (
          <button type="button" className="gcu-carousel__nav gcu-carousel__nav--next" aria-label="Imagen siguiente" onClick={() => ir(actual + 1)}>
            <Icon name="chevron-right" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="gcu-carousel__bar">
        <span className="gcu-carousel__count" aria-live="polite">{actual + 1} de {total}</span>
        {thumbnails ? (
          <span className="gcu-carousel__thumbs" role="group" aria-label="Miniaturas">
            {thumbnails.map((t, i) => (
              <button key={i} type="button" className={cx('gcu-carousel__thumb', i === actual && 'is-current')}
                aria-label={`Ver ${slideLabel(i, total).toLowerCase()}`} aria-current={i === actual || undefined} onClick={() => ir(i)}>
                {t}
              </button>
            ))}
          </span>
        ) : (
          <span className="gcu-carousel__dots">
            {slides.map((_, i) => (
              <button key={i} type="button" className={cx('gcu-carousel__dot', i === actual && 'is-current')}
                aria-label={`Ver ${slideLabel(i, total).toLowerCase()}`} aria-current={i === actual || undefined} onClick={() => ir(i)} />
            ))}
          </span>
        )}
        {caption && <span className="gcu-carousel__caption">{caption(actual)}</span>}
        {actions && <span className="gcu-carousel__actions">{actions}</span>}
      </div>
    </div>
  )
})
