import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Carousel } from '../src/components/ui/Carousel'
import { log } from '../src/utils/log'

afterEach(() => vi.restoreAllMocks())

const tres = (props = {}) => render(
  <Carousel aria-label="Imágenes de la pregunta 3" {...props}>
    <img alt="Chat 1" src="1.webp" />
    <img alt="Chat 2" src="2.webp" />
    <img alt="Chat 3" src="3.webp" />
  </Carousel>,
)

describe('Carousel', () => {
  test('reenvía ref al raíz y lo nombra como carrusel', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Carousel ref={ref} aria-label="Imágenes"><span>a</span><span>b</span></Carousel>)
    expect(ref.current).toHaveAttribute('role', 'region')
    expect(ref.current).toHaveAttribute('aria-roledescription', 'carrusel')
    expect(ref.current).toHaveClass('gcu-carousel')
  })

  test('cada diapositiva se nombra con su posición', () => {
    tres()
    expect(screen.getByRole('group', { name: 'Imagen 2 de 3' })).toHaveAttribute('aria-roledescription', 'diapositiva')
  })

  test('flechas solo donde hay adónde ir; contador y puntos siguen la diapositiva', () => {
    tres()
    expect(screen.queryByRole('button', { name: 'Imagen anterior' })).toBeNull()
    expect(screen.getByText('1 de 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Imagen siguiente' }))
    expect(screen.getByText('2 de 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver imagen 2 de 3' })).toHaveAttribute('aria-current', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Ver imagen 3 de 3' }))
    expect(screen.queryByRole('button', { name: 'Imagen siguiente' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Imagen anterior' })).toBeInTheDocument()
  })

  test('flechas del teclado, Inicio y Fin con el foco en las diapositivas', () => {
    const cambio = vi.fn()
    tres({ onIndexChange: cambio })
    const area = screen.getByLabelText(/Diapositivas/)
    fireEvent.keyDown(area, { key: 'ArrowRight' })
    fireEvent.keyDown(area, { key: 'End' })
    fireEvent.keyDown(area, { key: 'Home' })
    expect(cambio.mock.calls.map(c => c[0])).toEqual([1, 2, 0])
  })

  test('controlado: muestra el índice que recibe', () => {
    tres({ index: 2 })
    expect(screen.getByText('3 de 3')).toBeInTheDocument()
  })

  test('una sola diapositiva: sin flechas, contador ni puntos; las acciones se mantienen', () => {
    render(<Carousel aria-label="Imagen" actions={<button type="button">Ampliar</button>}><img alt="Sola" src="1.webp" /></Carousel>)
    expect(screen.queryByText(/de 1/)).toBeNull()
    expect(screen.queryByRole('button', { name: /Imagen/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Ampliar' })).toBeInTheDocument()
  })

  test('miniaturas en lugar de puntos y descripción de la diapositiva visible', () => {
    tres({ thumbnails: ['a', 'b', 'c'].map(x => <span key={x}>{x}</span>), caption: (i: number) => `Descripción ${i + 1}` })
    expect(screen.getByRole('group', { name: 'Miniaturas' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ver imagen 3 de 3' }))
    expect(screen.getByText('Descripción 3')).toBeInTheDocument()
  })

  test('avisa si falta el nombre accesible', () => {
    const warn = vi.spyOn(log, 'warn').mockImplementation(() => {})
    render(<Carousel><span>a</span><span>b</span></Carousel>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('aria-label'))
  })
})
