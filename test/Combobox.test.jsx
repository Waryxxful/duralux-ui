import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Combobox } from '../src/index.js'

const OPTIONS = [
  { value: 'a', label: 'Campaña A' },
  { value: 'b', label: 'Campaña B' },
]

test('shows the selected option and lets the user pick another one', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<Combobox options={OPTIONS} value="a" onChange={onChange} aria-label="Campaña" />)

  expect(screen.getByRole('combobox')).toHaveTextContent('Campaña A')

  await user.click(screen.getByRole('combobox'))
  await user.click(await screen.findByText('Campaña B'))

  expect(onChange).toHaveBeenCalledWith('b')
})

test('filters options as the user types', async () => {
  const user = userEvent.setup()
  render(<Combobox options={OPTIONS} value="" onChange={vi.fn()} aria-label="Campaña" />)

  await user.click(screen.getByRole('combobox'))
  await user.type(screen.getByPlaceholderText('Buscar…'), 'B')

  expect(screen.queryByText('Campaña A')).not.toBeInTheDocument()
  expect(screen.getByText('Campaña B')).toBeInTheDocument()
})
