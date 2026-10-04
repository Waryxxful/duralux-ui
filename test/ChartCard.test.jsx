import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { ChartCard } from '../src/components/charts/ChartCard'

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

test('normalizes invalid actions and omits empty card titles', async () => {
  const user = userEvent.setup()
  const onExport = vi.fn()
  const { rerender, container } = render(
    <ChartCard title={false} actions="not-an-array">
      chart
    </ChartCard>,
  )

  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  expect(container.querySelector('section')).not.toHaveAttribute('aria-labelledby')
  expect(screen.queryByRole('button', { name: /Acciones/i })).not.toBeInTheDocument()

  rerender(
    <ChartCard
      title="Ventas"
      actions={[
        { label: 'Muerta', onClick: 'not-a-function' },
        { label: 'Exportar', onClick: onExport },
      ]}
    >
      chart
    </ChartCard>,
  )

  const trigger = screen.getByRole('button', { name: 'Acciones de Ventas' })
  expect(trigger.querySelector('i')).toHaveAttribute('aria-hidden', 'true')
  await user.click(trigger)
  expect(screen.queryByRole('button', { name: 'Muerta' })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Exportar' }))
  expect(onExport).toHaveBeenCalledOnce()
})
