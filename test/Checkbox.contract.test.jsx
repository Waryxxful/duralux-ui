import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Checkbox } from '../src/components/form/Checkbox.jsx'

test('sets aria-invalid when error is truthy', () => {
  const { rerender } = render(<Checkbox label="Acepto" error />)
  expect(screen.getByRole('checkbox', { name: 'Acepto' })).toHaveAttribute('aria-invalid', 'true')

  rerender(<Checkbox label="Acepto" />)
  expect(screen.getByRole('checkbox', { name: 'Acepto' })).not.toHaveAttribute('aria-invalid')
})
