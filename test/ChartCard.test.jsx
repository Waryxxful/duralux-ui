import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { ChartCard } from '../src/index.js'

test('invokes a chart action and closes its React-owned menu', async () => {
  const user = userEvent.setup()
  const onExport = vi.fn()

  render(
    <ChartCard title="Ventas" actions={[{ label: 'Exportar', onClick: onExport }]}>
      chart
    </ChartCard>,
  )

  const trigger = screen.getByRole('button', { name: 'Acciones de Ventas' })
  expect(trigger).not.toHaveAttribute('data-bs-toggle')

  await user.click(trigger)
  await user.click(screen.getByRole('button', { name: 'Exportar' }))

  expect(onExport).toHaveBeenCalledOnce()
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(trigger).toHaveFocus()
})
