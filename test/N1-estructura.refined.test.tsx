import { createRef, useState } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Drawer } from '../src/components/ui/Drawer'
import { Modal } from '../src/components/ui/Modal'
import { Divider } from '../src/components/ui/Divider'
import { Kbd } from '../src/components/ui/Kbd'
import { Spinner } from '../src/components/ui/Spinner'
import { Skeleton } from '../src/components/ui/Skeleton'
import { Tag } from '../src/components/ui/Tag'
import { DEBT, componentCss } from './helpers/themeTokens'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('overflow')
})

function Abridor({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Ver detalle</button>
      <Drawer
        open={open}
        onClose={() => { onClose(); setOpen(false) }}
        title="Detalle del cliente"
        description="Última gestión: 23-09-2026"
        footer={<button type="button">Guardar cambios</button>}
      >
        <input aria-label="Nombre" />
      </Drawer>
    </>
  )
}

describe('Drawer (lote N1)', () => {
  test('dialog modal nombrado y descrito; foco inicial dentro; fondo inert y body bloqueado', async () => {
    const user = userEvent.setup()
    render(<Abridor />)
    await user.click(screen.getByRole('button', { name: 'Ver detalle' }))
    const dialog = screen.getByRole('dialog', { name: 'Detalle del cliente' })
    expect(dialog.tagName).toBe('DIALOG')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleDescription('Última gestión: 23-09-2026')
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(document.body).toHaveClass('modal-open')
    expect(document.body.firstElementChild).toHaveAttribute('inert')
  })

  test('Esc cierra y devuelve el foco al abridor; Tab queda atrapado', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Abridor onClose={onClose} />)
    const opener = screen.getByRole('button', { name: 'Ver detalle' })
    await user.click(opener)
    const save = screen.getByRole('button', { name: 'Guardar cambios' })
    act(() => { save.focus() })
    await user.tab()
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
    expect(opener).toHaveFocus()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body).not.toHaveClass('modal-open')
  })

  test('clic en el overlay cierra; tamaños y lado se reflejan en clases; ref al dialog', () => {
    const onClose = vi.fn()
    const ref = createRef<HTMLDialogElement>()
    render(<Drawer ref={ref} open onClose={onClose} title="Filtros" size="lg" side="start">Contenido</Drawer>)
    expect(ref.current).toHaveClass('gcu-drawer', 'gcu-drawer--lg', 'gcu-drawer--start')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  test('Esc con un Modal encima cierra solo el Modal', async () => {
    const user = userEvent.setup()
    const closeDrawer = vi.fn()
    const closeModal = vi.fn()
    render(
      <>
        <Drawer open onClose={closeDrawer} title="Detalle">x</Drawer>
        <Modal open onClose={closeModal} title="Confirmar">y</Modal>
      </>,
    )
    await user.keyboard('{Escape}')
    expect(closeModal).toHaveBeenCalledOnce()
    expect(closeDrawer).not.toHaveBeenCalled()
  })

  test('sin título ni aria-label avisa por log', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Drawer open title="" onClose={() => {}}>x</Drawer>)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('nombre accesible'))
  })
})

describe('Primitivas N1', () => {
  test('Divider: hr nativo; vertical con aria-orientation; con etiqueta muestra el texto', () => {
    const { rerender } = render(<Divider />)
    expect(screen.getByRole('separator')).toHaveClass('gcu-divider')
    rerender(<Divider orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
    rerender(<Divider label="o continúa con" />)
    expect(screen.getByText('o continúa con')).toHaveClass('gcu-divider__label')
  })

  test('Kbd: una tecla o una combinación anidada', () => {
    const { container, rerender } = render(<Kbd>Esc</Kbd>)
    expect(container.querySelector('kbd.gcu-kbd')).toHaveTextContent('Esc')
    rerender(<Kbd keys={['Ctrl', 'K']} />)
    expect(container.querySelectorAll('kbd.gcu-kbd-combo > kbd.gcu-kbd')).toHaveLength(2)
  })

  test('Spinner: role status con texto; decorativo con label null', () => {
    const { rerender } = render(<Spinner />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…')
    rerender(<Spinner label={null} />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  test('Skeleton: aria-hidden, variantes y líneas', () => {
    const { container, rerender } = render(<Skeleton variant="circle" width={40} />)
    const circle = container.firstElementChild as HTMLElement
    expect(circle).toHaveAttribute('aria-hidden', 'true')
    expect(circle).toHaveClass('gcu-skeleton', 'gcu-skeleton--circle')
    expect(circle.style.blockSize).toBe('40px')
    rerender(<Skeleton lines={3} />)
    expect(container.querySelectorAll('.gcu-skeleton')).toHaveLength(3)
  })

  test('Tag: botón «Quitar {texto}» que llama onRemove', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<Tag tone="primary" onRemove={onRemove}>Campaña Q4</Tag>)
    await user.click(screen.getByRole('button', { name: 'Quitar Campaña Q4' }))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  test('Tag con tono desconocido usa neutral y avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error tono inválido a propósito
    const { container } = render(<Tag tone="morado">x</Tag>)
    expect(container.firstChild).toHaveClass('gcu-tag--neutral')
    expect(warn).toHaveBeenCalled()
  })
})

describe('CSS del lote N1', () => {
  const files = ['tooltip', 'segmented', 'switch', 'fieldset', 'accordion', 'drawer', 'primitives']

  test.each(files)('%s.css: sin deuda (0 !important, 0 hex, 0 overrides de tema) e importado', (name) => {
    expect(componentCss(name)).not.toMatch(DEBT)
  })

  test('Drawer usa overlay y z-index de tokens; entra con gcu-enter y sale más rápido', () => {
    const css = componentCss('drawer')
    expect(css).toContain('background-color:var(--gcu-overlay)')
    expect(css).toContain('z-index:var(--gcu-z-drawer)')
    expect(css).toMatch(/animation:gcu-enter var\(--gcu-duration-base\)/)
    expect(css).toMatch(/animation:gcu-exit var\(--gcu-duration-fast\)/)
  })

  test('Segmented: radio interior = exterior − separación; indicador animado con tokens', () => {
    const css = componentCss('segmented')
    expect(css).toContain('border-radius:max(0px,calc(var(--gcu-radius-md) - var(--gcu-segmented-pad)))')
    expect(css).toMatch(/transition:transform var\(--gcu-duration-base\)/)
  })

  test('Tooltip y Accordion respetan reduced-motion y z-index de tokens', () => {
    expect(componentCss('tooltip')).toContain('z-index:var(--gcu-z-tooltip)')
    expect(componentCss('tooltip')).toMatch(/prefers-reduced-motion:reduce\)\{\.gcu-tooltip\{animation:none/)
    expect(componentCss('accordion')).toMatch(/grid-template-rows var\(--gcu-duration-base\)/)
  })
})
