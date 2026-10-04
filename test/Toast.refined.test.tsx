import { createRef } from 'react'
import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Toast } from '../src/components/ui/Toast'

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const LONG_TITLE = 'Se exportaron 2.840 registros de la campaña Cobranza Q4 al archivo de reportes; puedes descargarlo desde el centro de descargas durante las próximas 24 horas.'

describe('Toast refinado (receta de componente 2.3)', () => {
  test('reenvía ref al contenedor anunciado', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Toast ref={ref} variant="success" title="Guardado" show onClose={vi.fn()} autoHideMs={0} />)
    expect(ref.current).toBe(screen.getByRole('status'))
  })

  test('un texto largo no acorta su tiempo de lectura: el auto-cierre por defecto se alarga', () => {
    vi.useFakeTimers()
    render(<Toast variant="success" title={LONG_TITLE} show onClose={vi.fn()} />)
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByRole('status')).not.toHaveClass('gcu-toast--closing')
  })

  test('un texto corto conserva los 3 s por defecto', () => {
    vi.useFakeTimers()
    render(<Toast variant="success" title="Guardado" show onClose={vi.fn()} />)
    act(() => vi.advanceTimersByTime(3000))
    expect(screen.getByRole('status')).toHaveClass('gcu-toast--closing')
  })

  test('autoHideMs explícito manda aunque el texto sea largo', () => {
    vi.useFakeTimers()
    render(<Toast variant="info" title={LONG_TITLE} show onClose={vi.fn()} autoHideMs={1000} />)
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole('status')).toHaveClass('gcu-toast--closing')
  })

  test('description agrega una línea secundaria dentro de la región anunciada', () => {
    render(<Toast variant="danger" title="No se pudo guardar" description="Revisa tu conexión e inténtalo de nuevo." show onClose={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardarRevisa tu conexión e inténtalo de nuevo.')
  })

  test('una variante desconocida avisa con prefijo [duralux] y cae en info', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // SAFETY: se fuerza una variante fuera del tipo público para probar el fallback en runtime.
    render(<Toast variant={'neutral' as never} title="Hola" show onClose={vi.fn()} autoHideMs={0} />)
    expect(screen.getByRole('status')).toHaveClass('gcu-toast--info')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('neutral'))
  })
})
