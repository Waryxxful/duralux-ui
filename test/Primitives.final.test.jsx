import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { Alert } from '../src/components/ui/Alert.jsx'
import { Avatar } from '../src/components/ui/Avatar.jsx'
import { Button, IconButton } from '../src/components/ui/Button.jsx'
import { FormField } from '../src/components/form/FormField.jsx'
import { Input } from '../src/components/form/Input.jsx'
import { Modal } from '../src/components/ui/Modal.jsx'
import { Progress } from '../src/components/ui/Progress.jsx'
import { StatsCard } from '../src/components/ui/StatsCard.jsx'
import { Tabs } from '../src/components/ui/Tabs.jsx'
import { Toast } from '../src/components/ui/Toast.tsx'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test('Alert keeps all public solid and soft tones instead of collapsing to primary', () => {
  const tones = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'teal', 'indigo']
  const bootstrapSolidTones = new Set(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'])
  const { rerender, container } = render(<Alert variant={tones[0]}>Message</Alert>)

  for (const tone of tones) {
    rerender(<Alert variant={tone}>Message</Alert>)
    const alert = container.querySelector('.gcu-alert')
    expect(alert).toHaveClass('gcu-alert', `gcu-alert--${tone}`)
    if (bootstrapSolidTones.has(tone)) expect(alert).toHaveClass(`alert-${tone}`)
    else expect(alert).not.toHaveClass(`alert-${tone}`)

    rerender(<Alert variant={tone} soft>Message</Alert>)
    expect(container.querySelector('.gcu-alert')).toHaveClass(`alert-soft-${tone}-message`, 'gcu-alert', `gcu-alert--${tone}`)
  }
})

test('Avatar defaults to one explicit decorative mode and labels only on request', () => {
  const { rerender, container } = render(<Avatar src="/ada.png" name="Ada Lovelace" />)
  let image = container.querySelector('img')
  expect(image).toHaveAttribute('alt', '')
  expect(image).toHaveAttribute('aria-hidden', 'true')
  expect(screen.queryByRole('img')).not.toBeInTheDocument()

  rerender(<Avatar src="/ada.png" name="Ada Lovelace" alt="Ada Lovelace" />)
  image = container.querySelector('img')
  expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBe(image)
  expect(container.firstElementChild).not.toHaveAttribute('aria-label')

  rerender(<Avatar name="Élodie Brûlé" aria-label="Customer avatar" rounded="3" />)
  const initials = screen.getByRole('img', { name: 'Customer avatar' })
  expect(initials).toHaveTextContent('ÉB')
  expect(initials).toHaveClass('rounded-3')

  rerender(
    <div>
      <Avatar name="Ada Lovelace" />
      <span>Ada Lovelace</span>
    </div>,
  )
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
})

test('disabled custom Button preserves navigation/type props and blocks click and keyboard bubbling', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  const onParentClick = vi.fn()
  function RouterLink({ to, ...props }) {
    return <a href={to} {...props} />
  }

  render(
    <div onClick={onParentClick}>
      <Button as={RouterLink} to="/customers" type="submit" disabled onClick={onClick}>
        Customers
      </Button>
    </div>,
  )

  const link = screen.getByRole('link', { name: 'Customers' })
  expect(link).toHaveAttribute('href', '/customers')
  expect(link).toHaveAttribute('type', 'submit')
  expect(link).toHaveAttribute('disabled')
  expect(link).toHaveAttribute('aria-disabled', 'true')
  expect(link).toHaveAttribute('tabindex', '-1')

  await user.click(link)
  fireEvent.keyDown(link, { key: 'Enter' })
  fireEvent.keyUp(link, { key: ' ' })
  expect(onClick).not.toHaveBeenCalled()
  expect(onParentClick).not.toHaveBeenCalled()
})

test('IconButton keeps its required label while forwarding an explicit native type', () => {
  render(<IconButton icon="save" label="Save record" aria-label="Wrong" title="Wrong" type="submit" />)
  const button = screen.getByRole('button', { name: 'Save record' })
  expect(button).toHaveAttribute('aria-label', 'Save record')
  expect(button).toHaveAttribute('title', 'Save record')
  expect(button).toHaveAttribute('type', 'submit')
})

test('Tabs tolerate non-arrays, duplicate typed keys and lone surrogates with safe unique IDs', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  expect(() => render(<Tabs tabs="not-an-array" />)).not.toThrow()

  const loneSurrogate = '\ud800'
  render(
    <Tabs
      tabs={[
        { key: 1, label: 'Number one', content: 'N' },
        { key: '1', label: 'String one', content: 'S' },
        { key: 'duplicate', label: 'Duplicate A', content: 'A' },
        { key: 'duplicate', label: 'Duplicate B', content: 'B' },
        { key: loneSurrogate, label: 'Surrogate', content: 'U' },
      ]}
    />,
  )

  const tabs = screen.getAllByRole('tab')
  const ids = tabs.map((tab) => tab.id)
  expect(new Set(ids).size).toBe(ids.length)
  expect(ids.every((id) => !id.includes(loneSurrogate))).toBe(true)
  expect(tabs.map((tab) => tab.getAttribute('aria-controls'))).toEqual(
    expect.arrayContaining(tabs.map((tab) => expect.any(String))),
  )
  expect(warn).toHaveBeenCalled()
})

test('Modal inertizes only background and restores previous values without passing events to onClose', async () => {
  const user = userEvent.setup()
  const onClose = vi.fn()
  const background = document.createElement('main')
  background.setAttribute('data-testid', 'background')
  background.setAttribute('aria-hidden', 'false')
  document.body.appendChild(background)

  const { rerender } = render(<Modal open title="   " onClose={onClose}>Content</Modal>)
  const dialog = screen.getByRole('dialog', { name: 'Modal' })
  const backdrop = document.querySelector('.modal-backdrop')

  expect(background).toHaveAttribute('aria-hidden', 'true')
  expect(background).toHaveAttribute('inert')
  expect(dialog).not.toHaveAttribute('inert')
  expect(backdrop).not.toHaveAttribute('inert')
  expect(dialog).not.toHaveAttribute('aria-labelledby')
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()

  fireEvent.click(backdrop)
  expect(onClose).toHaveBeenCalledWith()
  rerender(<Modal open title="Named" onClose={onClose} />)
  await user.click(screen.getByRole('button', { name: 'Cerrar' }))
  expect(onClose).toHaveBeenLastCalledWith()

  background.setAttribute('aria-hidden', 'false')
  rerender(<Modal open={false} title="Named" onClose={onClose} />)
  expect(background).toHaveAttribute('aria-hidden', 'false')
  expect(background).not.toHaveAttribute('inert')
  background.remove()
})

test('Modal preserves a background owner that changes inert values while open', async () => {
  const background = document.createElement('main')
  document.body.appendChild(background)
  const { unmount } = render(<Modal open title="Owned modal">Content</Modal>)

  background.setAttribute('aria-hidden', 'false')
  background.removeAttribute('inert')
  if ('inert' in background) background.inert = false
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

  expect(background).toHaveAttribute('aria-hidden', 'true')
  expect(background).toHaveAttribute('inert')

  unmount()
  expect(background).toHaveAttribute('aria-hidden', 'false')
  expect(background).not.toHaveAttribute('inert')
  background.remove()
})

test('Toast safely normalizes hostile JavaScript props and leaves a foreign viewport alone', () => {
  vi.useFakeTimers()
  const foreignViewport = document.createElement('div')
  foreignViewport.id = 'gcu-toast-viewport'
  foreignViewport.setAttribute('data-gcu-toast-owned', 'true')
  document.body.appendChild(foreignViewport)

  expect(() => render(<Toast variant="bogus" title="Saved" show onClose={null} autoHideMs={1} />)).not.toThrow()
  expect(screen.getByRole('status')).toHaveClass('gcu-toast--info')
  expect(() => fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }))).not.toThrow()
  act(() => vi.advanceTimersByTime(301))
  expect(document.getElementById('gcu-toast-viewport')).toBe(foreignViewport)
  foreignViewport.remove()
})

test('Progress rejects invalid height while preserving caller style and StatsCard keeps footer zero', () => {
  render(
    <>
      <Progress value={25} height={-4} style={{ opacity: 0.5 }} data-testid="progress" />
      <StatsCard value="10" label="Customers" footer={0} onFooter={() => {}} />
    </>,
  )
  const progress = screen.getByTestId('progress')
  expect(progress.style.height).toBe('')
  expect(progress.style.opacity).toBe('0.5')
  const footer = screen.getByRole('button', { name: '0' })
  expect(footer).toHaveClass('btn', 'border-0')
})

test('FormField keeps external, help and error descriptions and does not require visual wrappers', () => {
  function Visual({ children, ...props }) {
    return <div {...props}>{children}</div>
  }

  render(
    <FormField label="Amount" required helpText="Use whole units" error="Amount is invalid">
      <Input aria-describedby="external-description external-description" />
    </FormField>,
  )
  const control = screen.getByLabelText(/Amount/)
  const help = screen.getByText('Use whole units')
  const error = screen.getByRole('alert')
  expect(control.getAttribute('aria-describedby').split(' ')).toEqual([
    'external-description',
    help.id,
    error.id,
  ])
  expect(screen.getByText('Use whole units')).toBeInTheDocument()

  render(
    <FormField label="Visual" required>
      <Visual>Not a control</Visual>
    </FormField>,
  )
  expect(screen.getByText('Not a control').closest('div')).not.toHaveAttribute('required')
})

test('FormField does not turn native visual progress into a required control', () => {
  render(
    <FormField label="Completion" required>
      <progress value="2" max="4" />
    </FormField>,
  )

  expect(screen.getByRole('progressbar')).not.toHaveAttribute('required')
  expect(screen.queryByText('*')).not.toBeInTheDocument()
})
