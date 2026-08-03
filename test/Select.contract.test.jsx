import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Select } from '../src/components/form/Select.jsx'

test('renders a disabled placeholder and honors disabled object options', () => {
  render(
    <Select
      aria-label="Status"
      placeholder="Choose a status"
      options={[
        'Pending',
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived', disabled: true },
      ]}
    />,
  )
  const select = screen.getByRole('combobox', { name: 'Status' })
  const placeholder = screen.getByRole('option', { name: 'Choose a status' })
  const pending = screen.getByRole('option', { name: 'Pending' })
  const archived = screen.getByRole('option', { name: 'Archived' })

  expect(select).not.toHaveAttribute('placeholder')
  expect(placeholder).toBeDisabled()
  expect(placeholder).toHaveValue('')
  expect(pending).toHaveValue('Pending')
  expect(pending).not.toBeDisabled()
  expect(archived).toBeDisabled()
})

test('sets aria-invalid when invalid/error is truthy', () => {
  const { rerender } = render(<Select aria-label="Status" invalid options={['a']} />)
  expect(screen.getByRole('combobox', { name: 'Status' })).toHaveAttribute('aria-invalid', 'true')

  rerender(<Select aria-label="Status" options={['a']} />)
  expect(screen.getByRole('combobox', { name: 'Status' })).not.toHaveAttribute('aria-invalid')
})
