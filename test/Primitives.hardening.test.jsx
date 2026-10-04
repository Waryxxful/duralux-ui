import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Alert } from '../src/components/ui/Alert.jsx'
import { Avatar } from '../src/components/ui/Avatar.jsx'
import { Button } from '../src/components/ui/Button.jsx'
import { Modal } from '../src/components/ui/Modal.jsx'
import { Progress } from '../src/components/ui/Progress.jsx'
import { ProgressRing } from '../src/components/ui/ProgressRing.jsx'
import { StatsCard } from '../src/components/ui/StatsCard.jsx'
import { Tabs } from '../src/components/ui/Tabs.jsx'
import { Toast } from '../src/components/ui/Toast.tsx'
import { FormField } from '../src/components/form/FormField'
import { Input } from '../src/components/form/Input'
import { Select } from '../src/components/form/Select'
import { Textarea } from '../src/components/form/Textarea'

test('Progress merges caller styles when height is supplied', () => {
  render(
    <Progress
      value={25}
      height="8px"
      style={{ backgroundColor: 'papayawhip', opacity: 0.75 }}
      data-testid="progress"
    />,
  )

  const progress = screen.getByTestId('progress')
  expect(progress.style.height).toBe('8px')
  expect(progress.style.backgroundColor).toBe('papayawhip')
  expect(progress.style.opacity).toBe('0.75')
})

test('ProgressRing uses the primary CSS token and keeps absurd geometry finite', () => {
  render(<ProgressRing value={50} size={Number.MAX_VALUE} stroke={Number.MAX_VALUE} />)

  const ring = screen.getByRole('progressbar')
  const svg = ring.querySelector('svg')
  const track = ring.querySelector('circle')
  const indicator = ring.querySelector('.gcu-progress-ring__indicator')

  expect(indicator).toHaveAttribute('stroke', 'var(--gcu-primary-text, #3454d1)')
  expect(Number.isFinite(Number(svg.getAttribute('width')))).toBe(true)
  expect(Number.isFinite(Number(svg.getAttribute('height')))).toBe(true)
  expect(Number(track.getAttribute('r'))).toBeGreaterThan(0)
  expect(Number(indicator.getAttribute('stroke-width'))).toBeGreaterThan(0)
  expect(Number.isFinite(Number(indicator.getAttribute('stroke-dasharray')))).toBe(true)
  expect(Number.isFinite(Number(indicator.getAttribute('stroke-dashoffset')))).toBe(true)
})

test('StatsCard uses a button only for an actual footer action', async () => {
  const user = userEvent.setup()
  const onFooter = vi.fn()
  const { rerender } = render(
    <StatsCard value="10" label="Customers" footer="View all" onFooter={onFooter} />,
  )

  const action = screen.getByRole('button', { name: 'View all' })
  expect(action).not.toHaveAttribute('href')
  await user.click(action)
  expect(onFooter).toHaveBeenCalledOnce()

  rerender(<StatsCard value="10" label="Customers" footer="View all" />)
  expect(screen.queryByRole('button', { name: 'View all' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'View all' })).not.toBeInTheDocument()
  expect(screen.getByText('View all')).toBeInTheDocument()
  expect(document.querySelector('[href="#"]')).not.toBeInTheDocument()
})

test('StatsCard keeps progress output finite and exposed as progressbar semantics', () => {
  render(
    <StatsCard
      value="10"
      label="Customers"
      progress={{ value: Number.POSITIVE_INFINITY, max: 0, label: 'Completion' }}
    />,
  )

  const progress = screen.getByRole('progressbar', { name: 'Completion' })
  expect(progress).toHaveAttribute('aria-valuenow', '0')
  expect(progress).toHaveAttribute('aria-valuemax', '100')
  expect(progress).toHaveStyle({ width: '0%' })
})

test('Input and Textarea hide decorative icons and do not leave class whitespace', () => {
  const { rerender } = render(<Input icon="feather-user" aria-label="Name" />)
  const input = screen.getByRole('textbox', { name: 'Name' })
  expect(input.className).toBe('form-control')

  const inputIcon = render(<Input icon="feather-user" aria-label="Name with icon" />).container.querySelector('i')
  expect(inputIcon).toHaveAttribute('aria-hidden', 'true')

  rerender(<Textarea icon="feather-align-left" aria-label="Description" />)
  const textarea = screen.getByRole('textbox', { name: 'Description' })
  expect(textarea.className).toBe('form-control')
  expect(textarea.closest('.input-group').querySelector('i')).toHaveAttribute('aria-hidden', 'true')
})

test('Select also keeps its native class contract without trailing whitespace', () => {
  render(<Select aria-label="Status" options={['Ready']} />)
  expect(screen.getByRole('combobox', { name: 'Status' }).className).toBe('form-control form-select')
})

test('FormField preserves compound control props and joins help/error descriptions', () => {
  const { rerender } = render(
    <FormField label="Amount" required helpText="Use whole units">
      <Input
        startAddon="$"
        endAddon="USD"
        name="amount"
        data-testid="amount"
        aria-describedby="external-description"
      />
    </FormField>,
  )

  const control = screen.getByTestId('amount')
  const help = screen.getByText('Use whole units')
  expect(control).toHaveAttribute('id')
  expect(screen.getByText('Amount').closest('label')).toHaveAttribute('for', control.id)
  expect(control).toBeRequired()
  expect(control).toHaveAttribute('name', 'amount')
  expect(control).toHaveAttribute('aria-describedby', `external-description ${help.id}`)

  rerender(
    <FormField label="Amount" required error="Amount is required">
      <Input startAddon="$" aria-invalid="false" data-testid="amount" />
    </FormField>,
  )

  const errorControl = screen.getByTestId('amount')
  const error = screen.getByText('Amount is required')
  expect(errorControl).toBeRequired()
  expect(errorControl).toHaveAttribute('aria-invalid', 'false')
  expect(errorControl).toHaveAttribute('aria-describedby', error.id)
})

test('Button marks loading state, keeps spinner decorative, and hides legacy icon', () => {
  const { rerender } = render(
    <Button loading icon="feather-save">
      Save
    </Button>,
  )

  const button = screen.getByRole('button', { name: 'Save' })
  expect(button).toBeDisabled()
  expect(button).toHaveAttribute('aria-busy', 'true')
  expect(button.querySelector('.spinner-border')).toHaveAttribute('aria-hidden', 'true')
  expect(button.querySelector('.spinner-border')).not.toHaveAttribute('role')

  rerender(<Button icon="feather-save">Save</Button>)
  expect(button.querySelector('i')).toHaveAttribute('aria-hidden', 'true')
  expect(button).not.toHaveAttribute('aria-busy')
})

test('disabled native anchors and custom links block activation while retaining custom props', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  const onParentClick = vi.fn()
  function RouterLink({ to, ...props }) {
    return <a href={to} {...props} />
  }

  const { rerender } = render(
    <div onClick={onParentClick}>
      <Button as="a" href="/customers" disabled onClick={onClick} data-route="customers">
        Customers
      </Button>
    </div>,
  )

  const anchor = screen.getByText('Customers').closest('a')
  expect(anchor).not.toHaveAttribute('href')
  expect(anchor).toHaveAttribute('aria-disabled', 'true')
  expect(anchor).toHaveAttribute('tabindex', '-1')
  expect(anchor).toHaveAttribute('data-route', 'customers')
  await user.click(anchor)
  expect(onClick).not.toHaveBeenCalled()
  expect(onParentClick).not.toHaveBeenCalled()

  rerender(
    <div onClick={onParentClick}>
      <Button as={RouterLink} to="/customers" disabled onClick={onClick} data-route="customers">
        Customers
      </Button>
    </div>,
  )

  const customLink = screen.getByRole('link', { name: 'Customers' })
  expect(customLink).toHaveAttribute('href', '/customers')
  expect(customLink).toHaveAttribute('data-route', 'customers')
  await user.click(customLink)
  expect(onClick).not.toHaveBeenCalled()
  expect(onParentClick).not.toHaveBeenCalled()
})

test('Avatar gives an explicit label to the meaningful image without duplicating it on the wrapper', () => {
  const { container } = render(
    <Avatar src="/ada.png" name="Ada Lovelace" aria-label="Customer avatar" />,
  )

  expect(screen.getAllByRole('img')).toHaveLength(1)
  expect(screen.getByRole('img', { name: 'Customer avatar' })).toBeInTheDocument()
  expect(container.firstElementChild).not.toHaveAttribute('aria-label')
})

test('Avatar keeps explicit decorative images out of the accessibility tree', () => {
  const { container } = render(<Avatar src="/decorative.png" name="Ada Lovelace" alt="" aria-hidden="true" />)
  const image = container.querySelector('img')

  expect(image).toHaveAttribute('alt', '')
  expect(image).toHaveAttribute('aria-hidden', 'true')
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

test('Alert exposes a variant/icon styling seam without forcing white icon text', () => {
  const { container } = render(
    <Alert variant="warning" soft icon="feather-alert-triangle">
      Check the value.
    </Alert>,
  )

  const alert = container.querySelector('.gcu-alert')
  const icon = alert.querySelector('.gcu-alert__icon')
  expect(alert).toHaveClass('gcu-alert--warning')
  expect(icon).toBeInTheDocument()
  expect(icon).not.toHaveClass('text-white')
  expect(icon.querySelector('i')).toHaveAttribute('aria-hidden', 'true')
})

test('Alert falls back to its documented primary variant for unknown tones', () => {
  const { container } = render(<Alert variant="not-a-tone">Message</Alert>)
  expect(container.querySelector('.gcu-alert')).toHaveClass('alert-primary', 'gcu-alert--primary')
})

test('Tabs skip disabled items on click and roving keyboard navigation', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(
    <Tabs
      tabs={[
        { key: 'one', label: 'One', content: 'One panel' },
        { key: 'two', label: 'Two', content: 'Two panel', disabled: true },
        { key: 'three', label: 'Three', content: 'Three panel' },
        { key: 'four', label: 'Four', content: 'Four panel', disabled: true },
      ]}
      onChange={onChange}
    />,
  )

  const one = screen.getByRole('tab', { name: 'One' })
  const two = screen.getByRole('tab', { name: 'Two' })
  const three = screen.getByRole('tab', { name: 'Three' })
  const four = screen.getByRole('tab', { name: 'Four' })

  expect(two).toBeDisabled()
  expect(two).toHaveAttribute('aria-disabled', 'true')
  expect(four).toBeDisabled()
  await user.click(two)
  expect(one).toHaveAttribute('aria-selected', 'true')
  expect(onChange).not.toHaveBeenCalled()

  await user.tab()
  expect(one).toHaveFocus()
  await user.keyboard('{ArrowRight}')
  expect(three).toHaveFocus()
  expect(three).toHaveAttribute('aria-selected', 'true')
  expect(onChange).toHaveBeenLastCalledWith('three')

  await user.keyboard('{ArrowRight}')
  expect(one).toHaveFocus()
  await user.keyboard('{End}')
  expect(three).toHaveFocus()
  await user.keyboard('{Home}')
  expect(one).toHaveFocus()
})

test('Tabs ignore keyboard events delivered to a disabled tab', () => {
  render(
    <Tabs
      tabs={[
        { key: 'one', label: 'One', content: 'One panel' },
        { key: 'two', label: 'Two', content: 'Two panel', disabled: true },
        { key: 'three', label: 'Three', content: 'Three panel' },
      ]}
    />,
  )

  const disabled = screen.getByRole('tab', { name: 'Two' })
  const enabled = screen.getByRole('tab', { name: 'Three' })
  enabled.focus()
  fireEvent.keyDown(disabled, { key: 'ArrowRight' })
  expect(enabled).toHaveFocus()
})

test('Tabs fall back to an enabled tab for controlled and uncontrolled selection', async () => {
  const controlledOnChange = vi.fn()
  const { rerender } = render(
    <Tabs
      tabs={[
        { key: 'disabled', label: 'Disabled', content: 'Disabled panel', disabled: true },
        { key: 'enabled', label: 'Enabled', content: 'Enabled panel' },
      ]}
      activeKey="disabled"
      onChange={controlledOnChange}
    />,
  )

  expect(screen.getByRole('tab', { name: 'Enabled' })).toHaveAttribute('aria-selected', 'true')
  await waitFor(() => expect(controlledOnChange).toHaveBeenCalledWith('enabled'))
  expect(controlledOnChange).toHaveBeenCalledOnce()

  rerender(
    <Tabs
      tabs={[
        { key: 'disabled', label: 'Disabled', content: 'Disabled panel', disabled: true },
        { key: 'enabled', label: 'Enabled', content: 'Enabled panel' },
      ]}
      defaultActiveKey="disabled"
    />,
  )
  expect(screen.getByRole('tab', { name: 'Enabled' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: 'Disabled' })).not.toHaveAttribute('aria-selected', 'true')
})

test('Tabs keep selection valid when tabs are empty or change dynamically', async () => {
  const { rerender } = render(<Tabs tabs={[]} />)
  expect(screen.queryAllByRole('tab')).toHaveLength(0)

  rerender(
    <Tabs
      tabs={[
        { key: 'first', label: 'First', content: 'First panel' },
        { key: 'second', label: 'Second', content: 'Second panel' },
      ]}
      defaultActiveKey="first"
    />,
  )
  expect(screen.getByRole('tab', { name: 'First' })).toHaveAttribute('aria-selected', 'true')

  rerender(
    <Tabs
      tabs={[
        { key: 'first', label: 'First', content: 'First panel', disabled: true },
        { key: 'second', label: 'Second', content: 'Second panel' },
      ]}
      defaultActiveKey="first"
    />,
  )
  expect(screen.getByRole('tab', { name: 'Second' })).toHaveAttribute('aria-selected', 'true')

  rerender(
    <Tabs tabs={[{ key: 'only-disabled', label: 'Only disabled', content: 'No panel', disabled: true }]} />,
  )
  expect(screen.getByRole('tab', { name: 'Only disabled' })).toBeDisabled()
  expect(screen.getByRole('tab', { name: 'Only disabled' })).not.toHaveAttribute('aria-selected', 'true')

  await Promise.resolve()
})

test('Modal closes from its actual backdrop and renders close actions only when closable', () => {
  const onClose = vi.fn()
  const { rerender } = render(<Modal open title="Closable" onClose={onClose}>Content</Modal>)

  fireEvent.click(document.querySelector('.modal-backdrop'))
  expect(onClose).toHaveBeenCalledOnce()

  rerender(<Modal open title="Read only">Content</Modal>)
  expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument()
})

test('Modal and Toast render through real server rendering without document', () => {
  const originalDocument = globalThis.document
  try {
    vi.stubGlobal('document', undefined)
    expect(renderToString(<Modal open title="Server modal">Content</Modal>)).toBe('')
    expect(renderToString(<Toast variant="success" title="Saved" show onClose={vi.fn()} />)).toBe('')
  } finally {
    vi.stubGlobal('document', originalDocument)
  }
})

test('Toast shares one viewport and cleans timers when unmounted while closing', () => {
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  const firstOnClose = vi.fn()
  const secondOnClose = vi.fn()
  const { unmount } = render(
    <>
      <Toast variant="success" title="First" show onClose={firstOnClose} autoHideMs={10} />
      <Toast variant="info" title="Second" show onClose={secondOnClose} autoHideMs={0} />
    </>,
  )

  expect(document.querySelectorAll('#gcu-toast-viewport')).toHaveLength(1)
  expect(screen.getAllByRole('status')).toHaveLength(2)
  act(() => vi.advanceTimersByTime(10))
  expect(screen.getAllByRole('status')[0]).toHaveClass('gcu-toast--closing')

  unmount()
  act(() => vi.advanceTimersByTime(300))
  expect(firstOnClose).not.toHaveBeenCalled()
  expect(secondOnClose).not.toHaveBeenCalled()
})

test('Toast removes the shared viewport only after its last consumer unmounts', () => {
  const first = render(<Toast variant="success" title="First" show onClose={vi.fn()} autoHideMs={0} />)
  const second = render(<Toast variant="info" title="Second" show onClose={vi.fn()} autoHideMs={0} />)
  const viewport = document.getElementById('gcu-toast-viewport')

  expect(viewport).toBeInTheDocument()
  first.unmount()
  expect(viewport).toBeInTheDocument()

  second.unmount()
  expect(document.getElementById('gcu-toast-viewport')).not.toBeInTheDocument()
})

test('Toast clears an obsolete closing state when it is reopened', () => {
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  const onClose = vi.fn()
  const { rerender } = render(
    <Toast variant="info" title="Updated" show onClose={onClose} autoHideMs={10} />,
  )

  act(() => vi.advanceTimersByTime(10))
  expect(screen.getByRole('status')).toHaveClass('gcu-toast--closing')

  rerender(<Toast variant="info" title="Updated" show={false} onClose={onClose} autoHideMs={10} />)
  rerender(<Toast variant="info" title="Updated" show onClose={onClose} autoHideMs={0} />)
  expect(screen.getByRole('status')).not.toHaveClass('gcu-toast--closing')
})

test('Toast close timing does not depend on a JavaScript matchMedia branch', () => {
  vi.useFakeTimers()
  vi.stubGlobal('matchMedia', () => {
    throw new Error('reduced motion is handled by CSS')
  })
  const onClose = vi.fn()
  render(<Toast variant="info" title="Updated" show onClose={onClose} autoHideMs={0} />)

  expect(() => fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }))).not.toThrow()
  expect(onClose).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(300))
  expect(onClose).toHaveBeenCalledOnce()
})
