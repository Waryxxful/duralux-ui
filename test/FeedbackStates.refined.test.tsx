import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconInbox } from '@tabler/icons-react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { EmptyState } from '../src/components/feedback/EmptyState'
import { ErrorState } from '../src/components/feedback/ErrorState'
import { LoadingState } from '../src/components/feedback/LoadingState'
import { CardLoader } from '../src/components/ui/CardLoader'
import { ConfirmDialog } from '../src/components/shell/ConfirmDialog'

afterEach(() => vi.restoreAllMocks())

describe('EmptyState refinado', () => {
  test('reenvía ref, pasa atributos y arma ícono, título, explicación y acciones', () => {
    const ref = createRef<HTMLDivElement>()
    const { container } = render(
      <EmptyState
        ref={ref}
        data-testid="vacio"
        icon={<IconInbox />}
        title="Nadie coincide con la búsqueda"
        message="Prueba con otro rol o cuenta."
        action={<button type="button">Limpiar filtros</button>}
        secondaryAction={<button type="button">Crear usuario</button>}
      />,
    )
    expect(ref.current).toBe(screen.getByTestId('vacio'))
    expect(ref.current).toHaveClass('gcu-state', 'gcu-state--empty')
    expect(container.querySelector('.gcu-state__icon svg')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.gcu-state__title')).toHaveTextContent('Nadie coincide con la búsqueda')
    expect(container.querySelector('.gcu-state__actions')?.children).toHaveLength(2)
  })

  test('el nombre Feather histórico sigue funcionando', () => {
    const { container } = render(<EmptyState icon="users" />)
    expect(container.querySelector('.gcu-state__icon i')).toHaveClass('feather-users')
  })
})

describe('ErrorState refinado', () => {
  test('reenvía ref, acepta etiqueta de reintento y marca el reintento en curso', async () => {
    const user = userEvent.setup()
    const ref = createRef<HTMLDivElement>()
    const onRetry = vi.fn()
    const { rerender } = render(<ErrorState ref={ref} onRetry={onRetry} retryLabel="Reintentar carga" />)
    expect(ref.current).toHaveClass('gcu-state', 'gcu-state--error')
    await user.click(screen.getByRole('button', { name: 'Reintentar carga' }))
    expect(onRetry).toHaveBeenCalledOnce()
    rerender(<ErrorState onRetry={onRetry} retrying />)
    expect(screen.getByRole('button', { name: /Reintentar/ })).toHaveAttribute('aria-busy', 'true')
  })

  test('registra el error recibido con prefijo [duralux] sin exponerlo como texto técnico', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorState error={new Error('timeout')} />)
    expect(error).toHaveBeenCalledWith('[duralux]', expect.stringContaining('ErrorState'), expect.any(Error))
  })
})

describe('LoadingState refinado', () => {
  test('una sola región status ocupada con el mensaje visible y elipsis tipográfica', () => {
    const ref = createRef<HTMLDivElement>()
    render(<LoadingState ref={ref} />)
    const status = screen.getByRole('status')
    expect(status).toBe(ref.current)
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveTextContent('Cargando…')
    expect(screen.getAllByText('Cargando…')).toHaveLength(1)
  })

  test('variante skeleton dibuja filas en vez de spinner', () => {
    const { container } = render(<LoadingState variant="skeleton" rows={4} message="Cargando campañas" />)
    expect(container.querySelectorAll('.gcu-skeleton')).toHaveLength(4)
    expect(container.querySelector('.spinner-border')).not.toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Cargando campañas' })).toBeInTheDocument()
  })
})

describe('CardLoader refinado', () => {
  test('reenvía ref al overlay anunciado', () => {
    const ref = createRef<HTMLDivElement>()
    render(<CardLoader ref={ref} label="Cargando llamadas" />)
    expect(ref.current).toBe(screen.getByRole('status', { name: 'Cargando llamadas' }))
    expect(ref.current).toHaveAttribute('aria-busy', 'true')
  })
})

describe('ConfirmDialog refinado', () => {
  test('reenvía ref al diálogo y nombra el objeto en una confirmación destructiva', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <ConfirmDialog
        ref={ref}
        open
        variant="danger"
        title="Eliminar campaña"
        message="Se eliminará «Cobranza Q4» y sus 1.240 registros. No se puede deshacer."
        confirmLabel="Eliminar campaña"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(ref.current).toBe(screen.getByRole('dialog', { name: 'Eliminar campaña' }))
    expect(ref.current).toHaveClass('gcu-confirm-dialog')
    expect(screen.getByRole('button', { name: 'Eliminar campaña' })).toHaveClass('btn-danger')
  })

  test('avisa por log cuando una acción destructiva usa la etiqueta genérica', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<ConfirmDialog open variant="danger" message="¿Seguro?" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('nombra el objeto'))
  })
})
