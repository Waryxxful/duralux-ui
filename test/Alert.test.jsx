import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import { Alert } from '../src/index.js'

test('variante solida por defecto', () => {
  render(<Alert variant="success">Ok</Alert>)
  expect(screen.getByRole('alert')).toHaveClass('alert-success')
})

test('prop soft genera la clase alert-soft-{variant}-message', () => {
  render(<Alert variant="warning" soft>Cuidado</Alert>)
  const el = screen.getByRole('alert')
  expect(el).toHaveClass('alert-soft-warning-message')
  expect(el).not.toHaveClass('alert-warning')
})
