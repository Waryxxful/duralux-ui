import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button, IconButton, resolveVariant } from '../src/components/ui/Button.jsx'

test('renders and handles clicks through the public export', async () => {
  const user = userEvent.setup()
  const handleClick = vi.fn()

  render(<Button onClick={handleClick}>Save</Button>)

  const button = screen.getByRole('button', { name: 'Save' })
  expect(button).toBeInTheDocument()

  await user.click(button)
  expect(handleClick).toHaveBeenCalledOnce()
})

test('soft light-* theme variants emit btn-light-{tone}, not btn-primary', () => {
  const { rerender } = render(<Button variant="light-danger">Soft danger</Button>)
  expect(screen.getByRole('button', { name: 'Soft danger' })).toHaveClass('btn', 'btn-light-danger')
  expect(screen.getByRole('button', { name: 'Soft danger' })).not.toHaveClass('btn-primary')
  expect(screen.getByRole('button', { name: 'Soft danger' })).not.toHaveClass('btn-danger')

  for (const tone of ['primary', 'success', 'warning', 'info', 'secondary']) {
    rerender(<Button variant={`light-${tone}`}>Soft {tone}</Button>)
    const el = screen.getByRole('button', { name: `Soft ${tone}` })
    expect(el).toHaveClass(`btn-light-${tone}`)
    expect(el).not.toHaveClass('btn-primary')
  }
})

test('outline variants are banned and map to light-brand class', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  render(<Button variant="outline-primary">Retry</Button>)
  const el = screen.getByRole('button', { name: 'Retry' })
  expect(el).toHaveClass('btn-light-brand')
  expect(el.className).not.toMatch(/btn-outline/)
  expect(resolveVariant('outline-danger')).toBe('light-brand')
  expect(resolveVariant('outline')).toBe('light-brand')
  warn.mockRestore()
})

test('IconButton uses resolveVariant so light-danger stays soft', () => {
  render(<IconButton icon="trash-2" label="Eliminar" variant="light-danger" />)
  const el = screen.getByRole('button', { name: 'Eliminar' })
  expect(el).toHaveClass('btn', 'btn-icon', 'btn-light-danger')
  expect(el).not.toHaveClass('btn-primary')
})

test('resolveVariant keeps solid semantic tones and light-brand', () => {
  expect(resolveVariant('danger')).toBe('danger')
  expect(resolveVariant('light-brand')).toBe('light-brand')
  expect(resolveVariant('light-danger')).toBe('light-danger')
  expect(resolveVariant('primary')).toBe('primary')
})
