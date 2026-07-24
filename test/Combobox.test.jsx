import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Combobox } from '../src/index.js'

const OPTIONS = [
  { value: 'a', label: 'Campaña A' },
  { value: 'b', label: 'Campaña B' },
]

test('shows the selected option in the box and lets the user pick another one', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<Combobox options={OPTIONS} value="a" onChange={onChange} aria-label="Campaña" />)

  expect(screen.getByRole('combobox')).toHaveValue('Campaña A')

  await user.click(screen.getByRole('combobox'))
  await user.click(await screen.findByText('Campaña B'))

  expect(onChange).toHaveBeenCalledWith('b')
})

test('is directly typable and filters options as the user types', async () => {
  const user = userEvent.setup()
  render(<Combobox options={OPTIONS} value="" onChange={vi.fn()} aria-label="Campaña" />)

  await user.type(screen.getByRole('combobox'), 'B')

  expect(screen.queryByText('Campaña A')).not.toBeInTheDocument()
  expect(screen.getByText('Campaña B')).toBeInTheDocument()
})

test('reverts to the selected label after closing without picking anything', async () => {
  const user = userEvent.setup()
  render(<Combobox options={OPTIONS} value="a" onChange={vi.fn()} aria-label="Campaña" />)

  const input = screen.getByRole('combobox')
  await user.type(input, 'xyz')
  await user.keyboard('{Escape}')

  expect(input).toHaveValue('Campaña A')
})
