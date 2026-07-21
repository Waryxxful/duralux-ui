import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { ConfirmDialog } from '../src/components/shell/ConfirmDialog'

test('blocks every dismissal path while loading', async () => {
  const user = userEvent.setup()
  const onCancel = vi.fn()
  const props = {
    open: true,
    onConfirm: vi.fn(),
    onCancel,
    message: 'Delete this record?',
  }
  const { rerender } = render(<ConfirmDialog {...props} loading />)

  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled()
  expect(screen.getByRole('heading', { name: 'Confirmar acción' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument()

  await user.keyboard('{Escape}')
  fireEvent.click(screen.getByRole('dialog'))
  expect(onCancel).not.toHaveBeenCalled()

  rerender(<ConfirmDialog {...props} loading={false} />)

  await user.click(screen.getByRole('button', { name: 'Cerrar' }))
  await user.keyboard('{Escape}')
  fireEvent.click(screen.getByRole('dialog'))
  expect(onCancel).toHaveBeenCalledTimes(3)
})
