import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
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

test('keeps the page window bounded and exposes navigation/current-page semantics', () => {
  render(<Pagination page={500} totalPages={1000000} onPageChange={() => {}} />)

  const nav = screen.getByRole('navigation', { name: 'Paginación' })
  const buttons = within(nav).getAllByRole('button')

  expect(buttons).toHaveLength(7)
  expect(within(nav).getByRole('button', { name: 'Página 1' })).toBeInTheDocument()
  expect(within(nav).getByRole('button', { name: 'Página 499' })).toBeInTheDocument()
  expect(within(nav).getByRole('button', { name: 'Página 500' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(within(nav).getByRole('button', { name: 'Página 501' })).toBeInTheDocument()
  expect(within(nav).getByRole('button', { name: 'Página 1000000' })).toBeInTheDocument()
  expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  expect(within(nav).getAllByText('…')).toHaveLength(2)
  expect(nav.querySelectorAll('[aria-hidden="true"][role]')).toHaveLength(0)
})

test('keeps sibling windows constant even when sibling is absurdly large', () => {
  render(
    <Pagination
      page={500000000}
      totalPages={1000000000}
      sibling={1000000000}
      onPageChange={() => {}}
    />,
  )

  const nav = screen.getByRole('navigation', { name: 'Paginación' })
  const buttons = within(nav).getAllByRole('button')

  expect(buttons.length).toBeLessThanOrEqual(13)
  expect(buttons.length).toBeGreaterThan(0)
  expect(within(nav).getByRole('button', { name: 'Página 500000000' }))
    .toHaveAttribute('aria-current', 'page')
  expect(within(nav).getAllByText('…')).toHaveLength(2)
})

test('normalizes invalid page inputs and never emits an out-of-range page', async () => {
  const user = userEvent.setup()
  const onPageChange = vi.fn()

  const { rerender } = render(
    <Pagination page={Infinity} totalPages={3} onPageChange={onPageChange} />,
  )

  expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page')
  await user.click(screen.getByRole('button', { name: 'Página anterior' }))
  expect(onPageChange).not.toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
  expect(onPageChange).toHaveBeenLastCalledWith(2)

  rerender(<Pagination page={0} totalPages={NaN} onPageChange={onPageChange} />)
  rerender(<Pagination page={0} totalPages={Infinity} onPageChange={onPageChange} />)
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
})
