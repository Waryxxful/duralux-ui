import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Input } from '../src/components/form/Input.jsx'

test('sets aria-invalid when invalid/error is truthy', () => {
  const { rerender } = render(<Input aria-label="Nombre" error />)
  expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveAttribute('aria-invalid', 'true')

  rerender(<Input aria-label="Nombre" />)
  expect(screen.getByRole('textbox', { name: 'Nombre' })).not.toHaveAttribute('aria-invalid')
})

test('respeta aria-invalid explícito cuando no hay error', () => {
  render(<Input aria-label="Nombre" aria-invalid="grammar" />)
  expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveAttribute('aria-invalid', 'grammar')
})
