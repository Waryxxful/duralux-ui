import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { Popover, PopoverTrigger, PopoverContent } from '../src/index.js'

test('opens on trigger click and renders with Bootstrap popover classes', async () => {
  const user = userEvent.setup()
  render(
    <Popover>
      <PopoverTrigger asChild>
        <button type="button">Open</button>
      </PopoverTrigger>
      <PopoverContent>Popover body</PopoverContent>
    </Popover>,
  )

  expect(screen.queryByText('Popover body')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Open' }))

  const content = await screen.findByText('Popover body')
  expect(content).toHaveClass('popover-body')
  expect(content.closest('.popover')).toBeInTheDocument()
})
