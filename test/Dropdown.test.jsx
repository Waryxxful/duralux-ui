import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Dropdown, DropdownMenu, Modal } from '../src/index.js'

function DropdownFixture({ align = 'start', desktopHover = false }) {
  return (
    <>
      <Dropdown
        align={align}
        data-testid="dropdown"
        desktopHover={desktopHover}
        trigger={(triggerProps, { open }) => (
          <button {...triggerProps} className={open ? 'show' : ''}>
            Options
          </button>
        )}
      >
        <DropdownMenu>
          <button type="button">Run action</button>
        </DropdownMenu>
      </Dropdown>
      <button type="button">Outside</button>
    </>
  )
}

test('opens and closes from its trigger click', async () => {
  const user = userEvent.setup()
  render(<DropdownFixture />)
  const trigger = screen.getByRole('button', { name: 'Options' })
  const menu = document.getElementById(trigger.getAttribute('aria-controls'))

  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(menu).not.toHaveClass('show')

  await user.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(menu).toHaveClass('show')

  await user.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(menu).not.toHaveClass('show')
})

test('closes on an outside click', async () => {
  const user = userEvent.setup()
  render(<DropdownFixture />)
  const trigger = screen.getByRole('button', { name: 'Options' })
  const outside = screen.getByRole('button', { name: 'Outside' })

  await user.click(trigger)
  await user.click(outside)

  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(outside).toHaveFocus()
})

test('closes on Escape and restores focus to the trigger', async () => {
  const user = userEvent.setup()
  render(<DropdownFixture />)
  const trigger = screen.getByRole('button', { name: 'Options' })

  await user.click(trigger)
  const item = screen.getByRole('button', { name: 'Run action' })
  item.focus()
  await user.keyboard('{Escape}')

  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(trigger).toHaveFocus()
})

test('supports end alignment and opt-in hover state', () => {
  render(<DropdownFixture align="end" desktopHover />)
  const root = screen.getByTestId('dropdown')
  const trigger = screen.getByRole('button', { name: 'Options' })
  const menu = document.getElementById(trigger.getAttribute('aria-controls'))

  expect(menu).toHaveClass('dropdown-menu-end')
  fireEvent.mouseEnter(root)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  fireEvent.mouseLeave(root)
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('keeps a hover-opened menu open through the following pointer click', async () => {
  const user = userEvent.setup()
  render(<DropdownFixture desktopHover />)
  const root = screen.getByTestId('dropdown')
  const trigger = screen.getByRole('button', { name: 'Options' })

  fireEvent.mouseEnter(root)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')

  fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
  fireEvent.mouseDown(trigger, { button: 0 })
  fireEvent.pointerUp(trigger, { pointerType: 'mouse' })
  fireEvent.mouseUp(trigger, { button: 0 })
  fireEvent.click(trigger, { detail: 1 })
  expect(trigger).toHaveAttribute('aria-expanded', 'true')

  trigger.focus()
  await user.keyboard('{Enter}')
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

test('dismisses a modal before an already-open background dropdown', async () => {
  const user = userEvent.setup()

  function Fixture() {
    const [modalOpen, setModalOpen] = useState(false)
    return (
      <>
        <Dropdown trigger={(triggerProps) => <button {...triggerProps}>Options</button>}>
          <DropdownMenu>
            <button
              type="button"
              data-dropdown-keep-open
              onClick={() => setModalOpen(true)}
            >
              Open modal
            </button>
          </DropdownMenu>
        </Dropdown>
        <Modal open={modalOpen} title="Dialog" onClose={() => setModalOpen(false)}>
          Modal content
        </Modal>
      </>
    )
  }

  render(<Fixture />)
  const trigger = screen.getByRole('button', { name: 'Options' })
  await user.click(trigger)
  await user.click(screen.getByRole('button', { name: 'Open modal' }))
  await user.keyboard('{Escape}')

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
})

test('lets a non-dismissible top layer block a background dropdown', async () => {
  const user = userEvent.setup()

  function Fixture() {
    const [modalOpen, setModalOpen] = useState(false)
    return (
      <>
        <Dropdown trigger={(triggerProps) => <button {...triggerProps}>Options</button>}>
          <DropdownMenu>
            <button
              type="button"
              data-dropdown-keep-open
              onClick={() => setModalOpen(true)}
            >
              Open persistent modal
            </button>
          </DropdownMenu>
        </Dropdown>
        <Modal
          open={modalOpen}
          title="Persistent dialog"
          closeOnEscape={false}
          onClose={() => setModalOpen(false)}
        >
          Modal content
        </Modal>
      </>
    )
  }

  render(<Fixture />)
  const trigger = screen.getByRole('button', { name: 'Options' })
  await user.click(trigger)
  await user.click(screen.getByRole('button', { name: 'Open persistent modal' }))
  const escape = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  })
  fireEvent(document, escape)

  expect(escape.defaultPrevented).toBe(true)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
})

test('consumes the first Escape before an enclosing modal', async () => {
  const user = userEvent.setup()
  const onModalClose = vi.fn()

  function ModalFixture() {
    const [open, setOpen] = useState(true)
    return (
      <Modal
        open={open}
        title="Dialog"
        onClose={() => {
          onModalClose()
          setOpen(false)
        }}
      >
        <Dropdown
          trigger={(triggerProps) => <button {...triggerProps}>Options</button>}
        >
          <DropdownMenu>
            <button type="button">Run action</button>
          </DropdownMenu>
        </Dropdown>
      </Modal>
    )
  }

  render(<ModalFixture />)
  const trigger = screen.getByRole('button', { name: 'Options' })
  await user.click(trigger)
  await user.keyboard('{Escape}')

  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(trigger).toHaveFocus()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(onModalClose).not.toHaveBeenCalled()

  await user.keyboard('{Escape}')

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(onModalClose).toHaveBeenCalledOnce()
})
