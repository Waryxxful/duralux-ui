import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button, LinkButton } from '../src/components/ui/Button.jsx'

test.each([
  ['disabled', <Button href="/target" disabled>Open</Button>],
  ['loading', <LinkButton href="/target" loading>Open</LinkButton>],
])('blocks %s anchors without emitting native disabled', (_, anchor) => {
  const onClick = vi.fn()
  const onParentClick = vi.fn()

  const { container } = render(<div onClick={onParentClick}>{anchor.type === Button
    ? <Button {...anchor.props} onClick={onClick} />
    : <LinkButton {...anchor.props} onClick={onClick} />}</div>)
  const link = container.querySelector('a')

  expect(link).not.toHaveAttribute('disabled')
  expect(link).toHaveAttribute('aria-disabled', 'true')
  expect(link).toHaveAttribute('tabindex', '-1')
  expect(link).not.toHaveAttribute('href')

  fireEvent.click(link)
  expect(onClick).not.toHaveBeenCalled()
  expect(onParentClick).not.toHaveBeenCalled()
})

test('preserves normal anchor and button click behavior', async () => {
  const user = userEvent.setup()
  const onLinkClick = vi.fn((event) => event.preventDefault())
  const onButtonClick = vi.fn()

  render(
    <>
      <LinkButton href="/target" onClick={onLinkClick} tabIndex={2}>Open</LinkButton>
      <Button onClick={onButtonClick}>Save</Button>
      <Button onClick={onButtonClick} disabled>Disabled save</Button>
    </>,
  )

  const link = screen.getByRole('link', { name: 'Open' })
  expect(link).toHaveAttribute('href', '/target')
  expect(link).toHaveAttribute('tabindex', '2')
  expect(link).not.toHaveAttribute('aria-disabled')
  await user.click(link)
  await user.click(screen.getByRole('button', { name: 'Save' }))
  await user.click(screen.getByRole('button', { name: 'Disabled save' }))

  expect(onLinkClick).toHaveBeenCalledOnce()
  expect(onButtonClick).toHaveBeenCalledOnce()
  expect(screen.getByRole('button', { name: 'Disabled save' })).toBeDisabled()
})
