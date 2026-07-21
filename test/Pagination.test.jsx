import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { Pagination } from '../src/components/data/Pagination.jsx'

function PaginationFixture() {
  const [page, setPage] = useState(1)
  return <Pagination page={page} totalPages={5} onPageChange={setPage} />
}

test('preserves a numbered button and its focus after changing page', async () => {
  const user = userEvent.setup()
  render(<PaginationFixture />)
  const pageTwo = screen.getByRole('button', { name: 'Página 2' })

  await user.click(pageTwo)

  expect(screen.getByRole('button', { name: 'Página 2' })).toBe(pageTwo)
  expect(pageTwo).toHaveFocus()
  expect(pageTwo).toHaveAttribute('aria-current', 'page')
})
