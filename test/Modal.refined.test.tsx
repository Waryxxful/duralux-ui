import { createRef } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Modal } from '../src/components/ui/Modal'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('overflow')
})

describe('Modal refinado (receta de componente 2.3)', () => {
  test('reenvía ref al elemento con role="dialog" sin romper el foco inicial', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Modal ref={ref} open title="Editar campaña" onClose={vi.fn()}><input aria-label="Nombre" /></Modal>)
    expect(ref.current).toBe(screen.getByRole('dialog'))
    expect(ref.current?.contains(document.activeElement)).toBe(true)
  })

  test('el diálogo lleva la clase de animación de entrada y el cuerpo es contenedor de consultas', () => {
    render(<Modal open title="Editar campaña" onClose={vi.fn()}>Contenido</Modal>)
    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelector('.modal-dialog')).toHaveClass('gcu-modal-dialog')
    expect(dialog.querySelector('.modal-body')).toHaveClass('gcu-modal-body')
  })

  test('sin título ni etiqueta avisa por log y usa un nombre accesible de respaldo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Modal open onClose={vi.fn()}>Contenido</Modal>)
    expect(screen.getByRole('dialog', { name: 'Modal' })).toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('nombre accesible'))
  })
})
