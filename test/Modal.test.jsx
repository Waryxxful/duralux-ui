import { useState } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { Modal } from '../src/components/ui/Modal'

afterEach(() => {
  cleanup()
  document.body.classList.remove('modal-open', 'page-ready')
  document.body.style.removeProperty('overflow')
})

function ModalFixture() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open modal</button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit record"
        footer={<button type="button">Save</button>}
      >
        <input aria-label="Record name" />
      </Modal>
    </>
  )
}

test('focuses the first control, traps focus, and restores the opener', async () => {
  const user = userEvent.setup()
  render(<ModalFixture />)
  const opener = screen.getByRole('button', { name: 'Open modal' })

  await user.click(opener)

  const closeButton = screen.getByRole('button', { name: 'Cerrar' })
  const lastButton = screen.getByRole('button', { name: 'Save' })
  expect(closeButton).toHaveFocus()

  await user.tab({ shift: true })
  expect(lastButton).toHaveFocus()

  await user.tab()
  expect(closeButton).toHaveFocus()

  await user.click(closeButton)
  expect(opener).toHaveFocus()
})

test('focuses the dialog when it has no focusable children', () => {
  render(
    <Modal open onClose={vi.fn()}>
      <p>Nothing interactive</p>
    </Modal>,
  )

  expect(screen.getByRole('dialog')).toHaveFocus()
})

test('keeps the body locked until the last stacked modal closes', () => {
  document.body.classList.add('page-ready')
  document.body.style.overflow = 'clip'

  const { rerender } = render(
    <>
      <Modal open title="First modal">First</Modal>
      <Modal open title="Second modal">Second</Modal>
    </>,
  )

  expect(document.body).toHaveClass('modal-open', 'page-ready')
  expect(document.body.style.overflow).toBe('hidden')

  rerender(
    <>
      <Modal open title="First modal">First</Modal>
      <Modal open={false} title="Second modal">Second</Modal>
    </>,
  )

  expect(document.body).toHaveClass('modal-open', 'page-ready')
  expect(document.body.style.overflow).toBe('hidden')

  rerender(
    <>
      <Modal open={false} title="First modal">First</Modal>
      <Modal open={false} title="Second modal">Second</Modal>
    </>,
  )

  expect(document.body).not.toHaveClass('modal-open')
  expect(document.body).toHaveClass('page-ready')
  expect(document.body.style.overflow).toBe('clip')
})

test('shares modal coordination state through globalThis', () => {
  const state = globalThis[Symbol.for('@duralux/ui/modal-state')]
  expect(state).toEqual({ modalStack: [], bodyLockState: null })
  document.body.classList.add('modal-open')

  const { unmount } = render(<Modal open title="Shared modal">Content</Modal>)

  expect(globalThis[Symbol.for('@duralux/ui/modal-state')]).toBe(state)
  expect(state.modalStack).toHaveLength(1)
  expect(state.bodyLockState).toEqual(expect.objectContaining({
    body: document.body,
    lockedOverflow: 'hidden',
  }))

  unmount()

  expect(state.modalStack).toHaveLength(0)
  expect(state.bodyLockState).toBeNull()
  expect(document.body).toHaveClass('modal-open')
})

test('does not overwrite a newer inline body overflow value', () => {
  document.body.style.overflow = 'auto'
  const { unmount } = render(<Modal open title="Locked modal">Content</Modal>)
  expect(document.body.style.overflow).toBe('hidden')

  document.body.style.overflow = 'scroll'
  unmount()

  expect(document.body.style.overflow).toBe('scroll')
  expect(document.body).not.toHaveClass('modal-open')
})

test('only lets the topmost modal respond to Escape', async () => {
  const user = userEvent.setup()
  const closeFirst = vi.fn()
  const closeSecond = vi.fn()

  render(
    <>
      <Modal open onClose={closeFirst} title="First modal">First</Modal>
      <Modal open onClose={closeSecond} title="Second modal">Second</Modal>
    </>,
  )

  await user.keyboard('{Escape}')

  expect(closeFirst).not.toHaveBeenCalled()
  expect(closeSecond).toHaveBeenCalledOnce()
})

test('focuses the remaining modal when a stacked modal opener becomes disabled', async () => {
  const user = userEvent.setup()

  function StackedModalFixture() {
    const [secondOpen, setSecondOpen] = useState(false)
    const [openerDisabled, setOpenerDisabled] = useState(false)

    return (
      <Modal open title="First modal">
        <button
          type="button"
          disabled={openerDisabled}
          onClick={() => setSecondOpen(true)}
        >
          Open second modal
        </button>
        <Modal
          open={secondOpen}
          title="Second modal"
          onClose={() => {
            setOpenerDisabled(true)
            setSecondOpen(false)
          }}
        >
          Second modal content
        </Modal>
      </Modal>
    )
  }

  render(<StackedModalFixture />)
  await user.click(screen.getByRole('button', { name: 'Open second modal' }))
  await user.keyboard('{Escape}')

  const remainingDialog = screen.getByRole('dialog', { name: 'First modal' })
  expect(within(remainingDialog).getByRole('button', { name: 'Cerrar' })).toHaveFocus()
})

test('focuses the remaining modal when restoring the stacked modal opener fails', async () => {
  const user = userEvent.setup()

  function StackedModalFixture() {
    const [secondOpen, setSecondOpen] = useState(false)
    return (
      <Modal open title="First modal">
        <button type="button" onClick={() => setSecondOpen(true)}>Open second modal</button>
        <Modal
          open={secondOpen}
          title="Second modal"
          onClose={() => setSecondOpen(false)}
        >
          Second modal content
        </Modal>
      </Modal>
    )
  }

  render(<StackedModalFixture />)
  const opener = screen.getByRole('button', { name: 'Open second modal' })
  await user.click(opener)
  const focus = vi.spyOn(opener, 'focus').mockImplementation(() => {})
  await user.keyboard('{Escape}')

  const remainingDialog = screen.getByRole('dialog', { name: 'First modal' })
  expect(within(remainingDialog).getByRole('button', { name: 'Cerrar' })).toHaveFocus()
  focus.mockRestore()
})

test('honors the backdrop dismissal policy', () => {
  const onClose = vi.fn()
  const { rerender } = render(
    <Modal open onClose={onClose} title="Dismissible modal">Content</Modal>,
  )

  fireEvent.click(screen.getByRole('dialog'))
  expect(onClose).toHaveBeenCalledOnce()

  onClose.mockClear()
  rerender(
    <Modal open onClose={onClose} title="Persistent modal" closeOnBackdrop={false}>Content</Modal>,
  )

  fireEvent.click(screen.getByRole('dialog'))
  expect(onClose).not.toHaveBeenCalled()
})
