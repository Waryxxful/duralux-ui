import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Button, IconButton, LinkButton } from '../src/components/ui/Button'

afterEach(() => vi.restoreAllMocks())

describe('Button refinado (receta de componente 2.3)', () => {
  test('reenvía ref al elemento nativo', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Guardar</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  test('IconButton y LinkButton reenvían ref', () => {
    const iconRef = createRef<HTMLButtonElement>()
    const linkRef = createRef<HTMLAnchorElement>()
    render(<><IconButton ref={iconRef} icon="edit" label="Editar" /><LinkButton ref={linkRef} href="/x">Ir</LinkButton></>)
    expect(iconRef.current).toBeInstanceOf(HTMLButtonElement)
    expect(linkRef.current).toBeInstanceOf(HTMLAnchorElement)
  })

  test('en carga conserva el texto visible (sin salto de ancho) y anuncia ocupado', () => {
    render(<Button loading>Guardar</Button>)
    const button = screen.getByRole('button', { name: /guardar/i })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    expect(button.querySelector('.spinner-border')).toHaveAttribute('aria-hidden', 'true')
  })

  test('una variante no canónica avisa por log con prefijo [duralux] y cae en light-brand', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // SAFETY: se fuerza una variante fuera del tipo público para probar el fallback en runtime.
    render(<Button variant={'outline-primary' as never}>Ver</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-light-brand')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('outline-primary'))
  })

  test('expone la clase de componente para su CSS propio', () => {
    render(<Button>Ok</Button>)
    expect(screen.getByRole('button')).toHaveClass('gcu-button')
  })
})
