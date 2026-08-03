import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { Sidebar } from '../src/components/layout/Sidebar'

const navItems = [
  {
    label: 'Accounts',
    children: [{ label: 'Teams', to: '/accounts/teams' }],
  },
]

test('submenu triggers are real buttons with aria-expanded/aria-controls', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <Sidebar navItems={navItems} />
    </MemoryRouter>,
  )

  const trigger = screen.getByRole('button', { name: /Accounts/ })
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  const submenuId = trigger.getAttribute('aria-controls')
  expect(document.getElementById(submenuId)).not.toBeInTheDocument()

  await user.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(document.getElementById(submenuId)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Teams' })).toBeInTheDocument()
})
