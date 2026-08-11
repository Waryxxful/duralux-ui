import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { AvatarGroup } from '../src/components/ui/AvatarGroup.jsx'
import { Card } from '../src/components/ui/Card.jsx'
import { CardLoader } from '../src/components/ui/CardLoader.jsx'
import { Timeline } from '../src/components/ui/Timeline.jsx'
import { Footer } from '../src/components/layout/Footer.jsx'
import { AuthLayout } from '../src/components/layout/AuthLayout.jsx'
import { PageHeader } from '../src/components/layout/PageHeader.jsx'
import { StatCard } from '../src/components/shell/GranCrmExtras.tsx'

test('CardLoader is a named public status and Card composes one overlay spinner', () => {
  const { container, rerender } = render(
    <Card title={0} loading loadingLabel="Loading records" footer={<button type="button">Save</button>}>
      Body
    </Card>,
  )

  expect(screen.getByRole('heading', { name: '0' })).toBeInTheDocument()
  expect(screen.getByRole('status', { name: 'Loading records' })).toHaveClass('card-loader')
  expect(container.querySelectorAll('.card-loader .spinner-border')).toHaveLength(1)
  expect(container.querySelector('.card-footer')).toHaveTextContent('Save')

  rerender(<Card title={false} footer={0}>Body</Card>)
  expect(container.querySelector('.card-header')).not.toBeInTheDocument()
  expect(container.querySelector('.card-footer')).toHaveTextContent('0')

  rerender(<CardLoader label="Loading directly" />)
  expect(screen.getByRole('status', { name: 'Loading directly' })).toBeInTheDocument()
  expect(container.querySelectorAll('.spinner-border')).toHaveLength(1)
})

test('Card exposes only accessible callback actions without dead links', async () => {
  const user = userEvent.setup()
  const callbacks = [vi.fn(), vi.fn(), vi.fn()]
  const { container } = render(
    <Card onRefresh={callbacks[0]} onRemove={callbacks[1]} onExpand={callbacks[2]}>
      Body
    </Card>,
  )

  const buttons = screen.getAllByRole('button')
  expect(buttons).toHaveLength(3)
  expect(container.querySelector('[href="#"]')).not.toBeInTheDocument()
  for (const button of buttons) await user.click(button)
  for (const callback of callbacks) expect(callback).toHaveBeenCalledOnce()
})

test('AvatarGroup composes decorative Avatars, normalizes max, and keeps overflow static unless actionable', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  const { container } = render(
    <AvatarGroup
      max="2"
      items={[
        { id: 0, name: 'Ada Lovelace', src: '/ada.png', onClick },
        { id: 'second', name: 'Grace Hopper', src: '/grace.png', href: '/grace' },
        { id: 'third', name: 'Linus Torvalds', src: '/linus.png' },
        { name: 'Missing identity', src: '/missing.png' },
      ]}
    />,
  )

  const group = container.querySelector('.img-group')
  expect(group).toBeInTheDocument()
  expect(group.querySelectorAll('img')).toHaveLength(2)
  expect([...group.querySelectorAll('img')].every((image) => image.getAttribute('alt') === '')).toBe(true)
  expect(screen.getByRole('button', { name: 'Ada Lovelace' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Grace Hopper' })).toHaveAttribute('href', '/grace')
  expect(screen.getByRole('img', { name: '2 personas más' })).toHaveTextContent('+2')

  await user.click(screen.getByRole('button', { name: 'Ada Lovelace' }))
  expect(onClick).toHaveBeenCalledOnce()
})

test('AvatarGroup uses a button for actionable overflow and supports item renderers', async () => {
  const user = userEvent.setup()
  const onOverflowClick = vi.fn()
  const renderItem = vi.fn((item) => <span>{item.name} custom</span>)
  render(
    <AvatarGroup
      max={1}
      onOverflowClick={onOverflowClick}
      renderItem={renderItem}
      items={[{ id: 'one', name: 'One' }, { id: 'two', name: 'Two' }]}
    />,
  )

  expect(screen.getByText('One custom')).toBeInTheDocument()
  const overflow = screen.getByRole('button', { name: '1 persona más' })
  await user.click(overflow)
  expect(onOverflowClick).toHaveBeenCalledOnce()
  expect(renderItem).toHaveBeenCalledWith(expect.objectContaining({ id: 'one', name: 'One' }), 0)
})

test('Footer preserves AppLayout DOM and chooses anchor, button, or static entry by contract', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  render(
    <Footer
      copyright="Copyright test"
      links={[
        { id: 'help', label: 'Help', href: '/help' },
        { id: 'save', label: 'Save', onClick },
        { id: 'legal', label: 'Legal' },
      ]}
    />,
  )

  const footer = document.querySelector('footer.footer')
  expect(footer).toBeInTheDocument()
  expect(footer.querySelector('p')).toHaveTextContent('Copyright test')
  expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/help')
  const save = screen.getByRole('button', { name: 'Save' })
  expect(save).not.toHaveAttribute('href')
  await user.click(save)
  expect(onClick).toHaveBeenCalledOnce()
  expect(screen.getByText('Legal').tagName).toBe('SPAN')
  expect(footer.querySelector('[href="#"]')).not.toBeInTheDocument()
})

test('Timeline keeps id zero, warns for missing or duplicate identities, and marks icons decorative', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { container, rerender } = render(
    <Timeline
      items={[
        { id: 0, title: 'Zero', time: '10:00', icon: 'feather-clock' },
        { id: 'same', title: 'First', time: '11:00' },
        { id: 'same', title: 'Second', time: '12:00' },
        { title: 'Missing', time: '13:00' },
      ]}
    />,
  )

  expect(screen.getByRole('list')).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(4)
  expect(screen.getByText('Zero')).toBeInTheDocument()
  expect(screen.queryAllByRole('img', { hidden: true })).toHaveLength(0)
  expect(container.querySelectorAll('i[aria-hidden="true"]')).toHaveLength(4)
  expect(container.querySelectorAll('time')).toHaveLength(4)
  expect(warn).toHaveBeenCalled()

  const before = container.innerHTML
  rerender(
    <Timeline
      items={[
        { id: 0, title: 'Zero', time: '10:00', icon: 'feather-clock' },
        { id: 'same', title: 'First', time: '11:00' },
        { id: 'same', title: 'Second', time: '12:00' },
        { title: 'Missing', time: '13:00' },
      ]}
    />,
  )
  expect(container.innerHTML).toBe(before)
  warn.mockRestore()
})

test('PageHeader and AuthLayout expose named semantic structure without empty action chrome', () => {
  const { rerender } = render(
    <PageHeader
      title="Customers"
      breadcrumbs={[{ id: 'home', label: 'Home', href: '/home' }, { id: 0, label: 'Customers' }]}
      actions={0}
    />,
  )

  expect(screen.getByRole('heading', { name: 'Customers' })).toHaveProperty('tagName', 'H1')
  expect(screen.getByRole('navigation', { name: 'Miga de pan' })).toBeInTheDocument()
  expect(document.querySelector('.page-header-right')).not.toBeInTheDocument()

  rerender(
    <AuthLayout image="/cover.png" imageAlt="Brand illustration">
      <form aria-label="Sign in">Form</form>
    </AuthLayout>,
  )

  expect(screen.getByRole('main')).toHaveClass('auth-cover-wrapper')
  expect(screen.getByRole('img', { name: 'Brand illustration' })).toHaveAttribute('src', '/cover.png')
  expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument()
})

test('GranCRM StatCard adapts the runtime StatsCard while preserving legacy props and root attributes', () => {
  render(
    <StatCard
      title="Open tickets"
      value={0}
      icon="alert-circle"
      variant="warning"
      change={{ value: 0, label: 'vs last month' }}
      footer={0}
      data-testid="legacy-stat"
    />,
  )

  const card = screen.getByTestId('legacy-stat')
  expect(card).toHaveClass('card', 'gcu-stats-card')
  expect(within(card).getByText('Open tickets')).toBeInTheDocument()
  expect(card.querySelector('.fs-4')).toHaveTextContent('0')
  expect(card.querySelector('.avatar-lg')).toHaveClass('bg-soft-warning', 'text-warning')
  expect(card.querySelector('.feather-alert-circle')).toBeInTheDocument()
  expect(card.querySelector('.card-footer')).toHaveTextContent('0')
})
