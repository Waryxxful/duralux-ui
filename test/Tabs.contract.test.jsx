import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Tabs } from '../src/components/ui/Tabs.jsx'

const tabs = [
  { key: 'account', label: 'Account', content: 'Account panel' },
  { key: 'security', label: 'Security', content: 'Security panel' },
  { key: 'history', label: 'History', content: 'History panel' },
]

test('links tabs and panels with stable ARIA state', () => {
  const { rerender } = render(<Tabs tabs={tabs} defaultActiveKey="security" />)
  const accountTab = screen.getByRole('tab', { name: 'Account' })
  const securityTab = screen.getByRole('tab', { name: 'Security' })
  const accountPanel = document.getElementById(accountTab.getAttribute('aria-controls'))
  const securityPanel = document.getElementById(securityTab.getAttribute('aria-controls'))
  const accountTabId = accountTab.id
  const securityTabId = securityTab.id

  expect(accountTab).toHaveAttribute('aria-selected', 'false')
  expect(accountTab).toHaveAttribute('tabindex', '-1')
  expect(accountPanel).toHaveAttribute('aria-labelledby', accountTab.id)
  expect(accountPanel).toHaveAttribute('hidden')
  expect(securityTab).toHaveAttribute('aria-selected', 'true')
  expect(securityTab).toHaveAttribute('tabindex', '0')
  expect(securityPanel).toHaveAttribute('aria-labelledby', securityTab.id)
  expect(securityPanel).not.toHaveAttribute('hidden')

  rerender(<Tabs tabs={tabs} defaultActiveKey="security" />)
  expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('id', accountTabId)
  expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('id', securityTabId)
})

test('supports controlled selection without mutating it internally', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  const { rerender } = render(<Tabs tabs={tabs} activeKey="security" onChange={onChange} />)

  await user.click(screen.getByRole('tab', { name: 'Account' }))
  expect(onChange).toHaveBeenCalledWith('account')
  expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true')

  rerender(<Tabs tabs={tabs} activeKey="account" onChange={onChange} />)
  expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true')
})

test('recovers when tabs arrive or the active tab is removed', async () => {
  const user = userEvent.setup()
  const { rerender } = render(<Tabs tabs={[]} />)

  rerender(<Tabs tabs={tabs} />)
  expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true')

  await user.click(screen.getByRole('tab', { name: 'Security' }))
  expect(screen.getByRole('tab', { name: 'Security' })).toHaveAttribute('aria-selected', 'true')

  rerender(<Tabs tabs={[tabs[0], tabs[2]]} />)
  expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByText('Account panel')).toBeVisible()
})

test('moves focus and selection with arrow, Home, and End keys', async () => {
  const user = userEvent.setup()
  render(<Tabs tabs={tabs} />)
  const accountTab = screen.getByRole('tab', { name: 'Account' })
  const securityTab = screen.getByRole('tab', { name: 'Security' })
  const historyTab = screen.getByRole('tab', { name: 'History' })

  await user.tab()
  expect(accountTab).toHaveFocus()

  await user.keyboard('{ArrowRight}')
  expect(securityTab).toHaveFocus()
  expect(securityTab).toHaveAttribute('tabindex', '0')

  await user.keyboard('{End}')
  expect(historyTab).toHaveFocus()

  await user.keyboard('{Home}')
  expect(accountTab).toHaveFocus()

  await user.keyboard('{ArrowLeft}')
  expect(historyTab).toHaveFocus()
  expect(historyTab).toHaveAttribute('aria-selected', 'true')
})
