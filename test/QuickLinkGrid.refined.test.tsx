import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { QuickLinkGrid } from '../src/components/ui/QuickLinkGrid'

afterEach(() => vi.restoreAllMocks())

describe('QuickLinkGrid refinado (lote L4)', () => {
  test('reenvía ref; lista semántica y columnas por contenedor (sin col-md de viewport)', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <QuickLinkGrid ref={ref} columns={3} items={[{ icon: 'feather-users', label: 'Agentes', href: '/agentes' }, { icon: 'feather-phone', label: 'Colas', href: '/colas' }]} />,
    )
    expect(ref.current).toHaveClass('gcu-quick-links', 'gcu-container')
    expect(ref.current?.style.getPropertyValue('--gcu-quick-links-columns')).toBe('3')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(container.querySelector('[class*="col-md-"]')).toBeNull()
  })

  test('el ítem interactivo es el propio enlace o botón, operable con teclado', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<QuickLinkGrid items={[{ icon: 'users', label: 'Reasignar', onClick, description: '12 pendientes' }]} />)
    const button = screen.getByRole('button', { name: /Reasignar/ })
    expect(button).toHaveClass('gcu-quick-link', 'gcu-quick-link--interactive')
    expect(button).toHaveAttribute('type', 'button')
    button.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByText('12 pendientes')).toBeInTheDocument()
  })

  test('un ítem sin destino no es interactivo', () => {
    const { container } = render(<QuickLinkGrid items={[{ icon: 'feather-x', label: 'Solo lectura' }]} />)
    expect(container.querySelector('a, button')).toBeNull()
    expect(container.querySelector('.gcu-quick-link')).not.toHaveClass('gcu-quick-link--interactive')
  })

  test('columns inválido avisa por log y usa 4', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ref = createRef<HTMLDivElement>()
    render(<QuickLinkGrid ref={ref} columns={0} items={[]} />)
    expect(ref.current?.style.getPropertyValue('--gcu-quick-links-columns')).toBe('4')
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('columns'))
  })

  test('el tono del ícono usa roles semánticos', () => {
    const { container } = render(<QuickLinkGrid items={[{ icon: 'feather-alert-triangle', label: 'Alertas', href: '#', color: 'danger' }]} />)
    expect(container.querySelector('.gcu-stat__icon')).toHaveClass('gcu-stat__icon--danger')
  })
})
