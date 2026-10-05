import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { expect, test, vi } from 'vitest'
import { Alert } from '../src/components/ui/Alert.jsx'
import { Avatar } from '../src/components/ui/Avatar.jsx'
import { Button } from '../src/components/ui/Button.jsx'
import { Modal } from '../src/components/ui/Modal.jsx'
import { Progress } from '../src/components/ui/Progress.jsx'
import { ProgressRing } from '../src/components/ui/ProgressRing.jsx'
import { StatsCard } from '../src/components/ui/StatsCard.jsx'
import { Tabs } from '../src/components/ui/Tabs.jsx'
import { Toast } from '../src/components/ui/Toast.tsx'
import { Checkbox } from '../src/components/form/Checkbox'
import { FormField } from '../src/components/form/FormField'
import { Input } from '../src/components/form/Input'
import { Radio } from '../src/components/form/Radio'
import { Select } from '../src/components/form/Select'
import { Textarea } from '../src/components/form/Textarea'

test.each([
  ['Input', (props) => <Input {...props} />],
  ['Textarea', (props) => <Textarea {...props} />],
  ['Select', (props) => <Select {...props} options={['One']} />],
  ['Checkbox', (props) => <Checkbox {...props} label="Accept" />],
  ['Radio', (props) => <Radio {...props} label="Choice" />],
])('exposes invalid state on the native %s control and preserves explicit ARIA', (_, Control) => {
  const { rerender } = render(<Control error aria-label="Nombre legal" />)
  const control = screen.getByLabelText('Nombre legal')

  expect(control).toHaveAttribute('aria-invalid', 'true')

  rerender(<Control error aria-invalid="false" aria-label="Nombre legal" />)
  expect(screen.getByLabelText('Nombre legal')).toHaveAttribute('aria-invalid', 'false')
})

test('FormField keeps generated semantics when a composite input has addons', () => {
  render(
    <FormField label="Amount" required error="Amount is required">
      <Input startAddon="$" aria-describedby="external-description" aria-invalid="false" />
    </FormField>,
  )

  const control = screen.getByRole('textbox')
  const error = screen.getByText('Amount is required')
  const label = screen.getByText('Amount').closest('label')

  expect(control).toHaveAttribute('id')
  expect(label).toHaveAttribute('for', control.id)
  expect(control).toBeRequired()
  expect(control).toHaveAttribute('aria-describedby', `external-description ${error.id}`)
  expect(control).toHaveAttribute('aria-invalid', 'false')
})

test('Alert forwards DOM attributes without turning its semantic title into a DOM title', () => {
  render(
    <Alert
      title="Saved"
      data-testid="saved-alert"
      aria-label="Save result"
      onMouseEnter={vi.fn()}
    >
      The record is ready.
    </Alert>,
  )

  const alert = screen.getByTestId('saved-alert')
  expect(alert).toHaveAttribute('aria-label', 'Save result')
  expect(alert).not.toHaveAttribute('title')
  expect(screen.getByText('Saved')).toBeInTheDocument()
})

test('Avatar keeps the historical decorative default and accepts explicit alt', () => {
  const { container, rerender } = render(<Avatar src="/ada.png" name="Ada Lovelace" />)
  expect(container.querySelector('img')).toHaveAttribute('alt', '')
  expect(container.querySelector('img')).toHaveAttribute('aria-hidden', 'true')

  rerender(<Avatar src="/ada.png" name="Ada Lovelace" alt="Ada Lovelace" />)
  expect(container.querySelector('img')).toHaveAttribute('alt', 'Ada Lovelace')
})

test('initials avatar stays decorative until it receives an explicit label', () => {
  render(<Avatar name="Ada Lovelace" />)
  const avatar = screen.getByText('AL')

  expect(avatar).toHaveTextContent('AL')
  expect(avatar).toHaveAttribute('aria-hidden', 'true')
})

test('initials avatar resolves an explicit semantic surface instead of caller text classes', () => {
  render(<Avatar name="Success" variant="success" />)
  const avatar = screen.getByText('SU')

  expect(avatar).toHaveClass('gcu-avatar--semantic', 'gcu-avatar--success')
  expect(avatar).not.toHaveClass('text-white')
})

test('Modal has an accessible name and close button even without a title', () => {
  render(
    <Modal open aria-label="Delete customer" onClose={vi.fn()}>
      Are you sure?
    </Modal>,
  )

  expect(screen.getByRole('dialog', { name: 'Delete customer' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
})

test('Modal and Toast render on the server without touching document', () => {
  const serverModal = renderToString(<Modal open title="Server dialog">Content</Modal>)
  const serverToast = renderToString(
    <Toast variant="success" title="Saved" show onClose={vi.fn()} />,
  )
  expect(serverModal).toBe('')
  expect(serverToast).toBe('')
  expect(document.getElementById('gcu-toast-viewport')).not.toBeInTheDocument()

  const previousDocument = globalThis.document
  try {
    vi.stubGlobal('document', undefined)

    expect(() => renderToString(
      <Modal open title="Server dialog">Content</Modal>,
    )).not.toThrow()
    expect(() => renderToString(
      <Toast variant="success" title="Saved" show onClose={vi.fn()} />,
    )).not.toThrow()
  } finally {
    vi.stubGlobal('document', previousDocument)
  }
})

test('Button disables custom link components while forwarding their disabled contract', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  const onParentClick = vi.fn()
  const RouterLink = vi.fn(({ to, ...props }) => <a href={to} {...props} />)

  render(
    <div onClick={onParentClick}>
      <Button as={RouterLink} to="/customers" disabled onClick={onClick}>
        Customers
      </Button>
    </div>,
  )

  const link = screen.getByRole('link', { name: 'Customers' })
  expect(RouterLink.mock.calls[0][0]).toHaveProperty('disabled', true)
  expect(link).toHaveAttribute('disabled')
  expect(link).toHaveAttribute('aria-disabled', 'true')
  expect(link).toHaveAttribute('tabindex', '-1')

  await user.click(link)
  expect(onClick).not.toHaveBeenCalled()
  expect(onParentClick).not.toHaveBeenCalled()
})

// Corrección 2.3 (DX-016): un activeKey controlado inválido se resuelve en render y avisa por
// log.warn; ya no se notifica al padre desde un efecto (onChange solo sale de acciones del usuario).
test('Tabs resolves an invalid controlled key in render without notifying the parent', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  const onChange = vi.fn()
  const { rerender } = render(
    <Tabs
      tabs={[
        { key: 'overview', label: 'Overview', content: 'Overview panel' },
        { key: 'activity', label: 'Activity', content: 'Activity panel' },
      ]}
      activeKey="missing"
      onChange={onChange}
    />,
  )

  expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
  await waitFor(() => expect(console.warn).toHaveBeenCalled())
  expect(onChange).not.toHaveBeenCalled()

  rerender(
    <Tabs
      tabs={[
        { key: 'overview', label: 'Overview', content: 'Overview panel' },
        { key: 'activity', label: 'Activity', content: 'Activity panel' },
      ]}
      activeKey="missing"
      onChange={onChange}
    />,
  )
  expect(onChange).not.toHaveBeenCalled()
  vi.restoreAllMocks()
})

test('Progress clamps finite values in visual and ARIA output', () => {
  render(<Progress value={Infinity} max={0} label="Completion" showValue />)
  const bar = screen.getByRole('progressbar', { name: 'Completion' })

  expect(bar).toHaveAttribute('aria-valuenow', '0')
  expect(bar).toHaveAttribute('aria-valuemin', '0')
  expect(bar).toHaveAttribute('aria-valuemax', '100')
  expect(bar).toHaveStyle({ width: '0%' })
  // Corrección 2.3 (lote L3): formato de porcentaje de REGLAS §8 («0 %»).
  expect(bar).toHaveTextContent('0 %')
})

test('ProgressRing exposes a clamped progressbar and a CSS indicator class', () => {
  render(<ProgressRing value={150} />)
  const ring = screen.getByRole('progressbar')
  const indicator = document.querySelector('.gcu-progress-ring__indicator')

  expect(ring).toHaveAttribute('aria-valuenow', '100')
  expect(ring).toHaveAttribute('aria-valuemax', '100')
  expect(indicator).toBeInTheDocument()
  expect(indicator).not.toHaveStyle({ transition: expect.any(String) })
})

test('StatsCard gives its progress bar the shared normalized semantics', () => {
  render(
    <StatsCard
      icon="feather-users"
      value="10"
      label="Customers"
      progress={{ value: -10, max: 0, label: 'Customer completion' }}
    />,
  )
  const bar = screen.getByRole('progressbar', { name: 'Customer completion' })

  // DX-020 (lote L4): <progress> nativo en vez de role="progressbar"; valor y máximo van en value/max.
  expect(bar.tagName).toBe('PROGRESS')
  expect(bar).toHaveAttribute('value', '0')
  expect(bar).toHaveAttribute('max', '100')
})
