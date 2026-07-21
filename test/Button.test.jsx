import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from '../src/index.js'

test('renders and handles clicks through the public export', async () => {
  const user = userEvent.setup()
  const handleClick = vi.fn()

  render(<Button onClick={handleClick}>Save</Button>)

  const button = screen.getByRole('button', { name: 'Save' })
  expect(button).toBeInTheDocument()

  await user.click(button)
  expect(handleClick).toHaveBeenCalledOnce()
})
