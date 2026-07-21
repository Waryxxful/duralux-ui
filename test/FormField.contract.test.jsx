import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { FormField } from '../src/components/form/FormField.jsx'

test('clones one control to associate its label and error semantics', () => {
  render(
    <FormField label="Email" required error="Email is required">
      <input aria-describedby="external-description" />
    </FormField>,
  )
  const control = screen.getByLabelText(/Email/)
  const error = screen.getByText('Email is required')

  expect(control.id).not.toBe('')
  expect(control).toBeRequired()
  expect(control).toHaveAttribute('aria-required', 'true')
  expect(control).toHaveAttribute('aria-invalid', 'true')
  expect(control.getAttribute('aria-describedby').split(' ')).toEqual([
    'external-description',
    error.id,
  ])
})

test('links help text while preserving explicit IDs and ARIA values', () => {
  render(
    <FormField label="Name" htmlFor="ignored" required error={null} helpText="Use your legal name">
      <input
        id="explicit-name"
        aria-describedby="owned-description"
        aria-required="false"
        aria-invalid="false"
      />
    </FormField>,
  )
  const control = screen.getByLabelText(/Name/)
  const help = screen.getByText('Use your legal name')

  expect(control).toHaveAttribute('id', 'explicit-name')
  expect(control).toHaveAttribute('aria-required', 'false')
  expect(control).toHaveAttribute('aria-invalid', 'false')
  expect(control.getAttribute('aria-describedby').split(' ')).toEqual([
    'owned-description',
    help.id,
  ])
})

test('applies error and help semantics to a render-prop control using one argument', () => {
  const renderControl = vi.fn(() => <input aria-describedby="render-description" />)
  const { rerender } = render(
    <FormField label="Rendered" required error="Rendered error">{renderControl}</FormField>,
  )
  let control = screen.getByLabelText(/Rendered/)
  const error = screen.getByText('Rendered error')

  expect(control.id).not.toBe('')
  expect(control).toBeRequired()
  expect(control).toHaveAttribute('aria-required', 'true')
  expect(control).toHaveAttribute('aria-invalid', 'true')
  expect(control.getAttribute('aria-describedby').split(' ')).toEqual([
    'render-description',
    error.id,
  ])
  expect(renderControl).toHaveBeenCalledWith(expect.any(String))

  rerender(<FormField label="Rendered" helpText="Rendered help">{renderControl}</FormField>)
  control = screen.getByLabelText('Rendered')
  const help = screen.getByText('Rendered help')

  expect(control.getAttribute('aria-describedby').split(' ')).toEqual([
    'render-description',
    help.id,
  ])
  expect(renderControl.mock.calls.every((call) => call.length === 1)).toBe(true)
})

test('avoids generated label associations for multiple children', () => {
  render(
    <FormField label="Range">
      <input data-testid="start" />
      <input data-testid="end" />
    </FormField>,
  )
  const label = screen.getByText('Range').closest('label')

  expect(label).not.toHaveAttribute('for')
  expect(screen.getByTestId('start')).not.toHaveAttribute('id')
  expect(screen.getByTestId('end')).not.toHaveAttribute('id')
})
