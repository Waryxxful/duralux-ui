import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'
import { FormField } from '../src/components/form/FormField.jsx'
import { InputGroup } from '../src/components/form/InputGroup.jsx'
import { MultiSelect } from '../src/components/form/MultiSelect.jsx'
import { SearchableSelect } from '../src/components/form/SearchableSelect.jsx'
import { Select } from '../src/components/form/Select.jsx'

const OPTIONS = [
  { value: 1, label: 'México', icon: 'feather-flag' },
  { value: 2, label: 'Argentina' },
  { value: 3, label: 'Deshabilitada', disabled: true },
]

describe('SearchableSelect', () => {
  test('filters, skips disabled options, selects by keyboard and submits only the selected value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(
      <form>
        <FormField label="País" required helpText="Elegí uno">
          <SearchableSelect name="country" options={OPTIONS} onChange={onChange} />
        </FormField>
      </form>,
    )

    const input = screen.getByRole('combobox', { name: /País/ })
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAttribute('aria-describedby')
    await user.type(input, 'mex')
    expect(screen.getByRole('option', { name: 'México' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Argentina' })).not.toBeInTheDocument()
    await user.keyboard('{Enter}')

    expect(input).toHaveValue('México')
    expect(onChange).toHaveBeenCalledWith(1, OPTIONS[0])
    const data = new FormData(container.querySelector('form'))
    expect(data.getAll('country')).toEqual(['1'])
    expect(container.querySelector('input[role="combobox"]')).not.toHaveAttribute('name')
  })

  test('keeps controlled value authoritative and exposes type-aware identities', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(
      <SearchableSelect
        aria-label="Cuenta"
        value={1}
        onChange={onChange}
        options={[{ value: 1, label: 'Numérica' }, { value: '1', label: 'Texto' }]}
      />,
    )
    const input = screen.getByRole('combobox', { name: 'Cuenta' })
    expect(input).toHaveValue('Numérica')
    await user.click(input)
    await user.click(screen.getByRole('option', { name: 'Texto' }))
    expect(onChange).toHaveBeenCalledWith('1', expect.objectContaining({ value: '1' }))
    expect(input).toHaveValue('Numérica')
    rerender(
      <SearchableSelect aria-label="Cuenta" value="1" onChange={onChange} options={[{ value: 1, label: 'Numérica' }, { value: '1', label: 'Texto' }]} />,
    )
    expect(input).toHaveValue('Texto')
  })

  test('is SSR-safe and omits disabled/dead behavior', () => {
    expect(() => renderToString(<SearchableSelect aria-label="SSR" options={OPTIONS} />)).not.toThrow()
    render(<SearchableSelect aria-label="Disabled" disabled options={OPTIONS} />)
    expect(screen.getByRole('combobox', { name: 'Disabled' })).toBeDisabled()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  test('keeps required form validity tied to selected values while the list is open', async () => {
    const user = userEvent.setup()
    render(
      <form>
        <SearchableSelect aria-label="Cuenta" required defaultValue={1} options={OPTIONS} />
        <MultiSelect aria-label="Etiquetas" required defaultValue={[1]} options={OPTIONS} />
      </form>,
    )

    const single = screen.getByRole('combobox', { name: 'Cuenta' })
    const multi = screen.getByRole('combobox', { name: 'Etiquetas' })
    expect(single).not.toHaveAttribute('required')
    expect(multi).not.toHaveAttribute('required')

    await user.click(single)
    await user.click(multi)
    expect(single).not.toHaveAttribute('required')
    expect(multi).not.toHaveAttribute('required')
  })
})

describe('MultiSelect', () => {
  test('selects multiple values, stays open, removes chips and submits one hidden input per value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(
      <form>
        <MultiSelect aria-label="Etiquetas" name="tags" options={OPTIONS} onChange={onChange} />
      </form>,
    )
    const input = screen.getByRole('combobox', { name: 'Etiquetas' })
    await user.click(input)
    await user.click(screen.getByRole('option', { name: 'México' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: 'Argentina' }))
    expect(onChange).toHaveBeenLastCalledWith([1, 2], [OPTIONS[0], OPTIONS[1]])
    expect(new FormData(container.querySelector('form')).getAll('tags')).toEqual(['1', '2'])

    await user.click(screen.getByRole('button', { name: 'Quitar México' }))
    expect(onChange).toHaveBeenLastCalledWith([2], [OPTIONS[1]])
  })

  test('enforces max and skips unavailable values without callback loops', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { rerender } = render(
      <MultiSelect aria-label="Máximo" defaultValue={[1]} max={1} options={OPTIONS} onChange={onChange} />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Máximo' }))
    expect(screen.getByRole('option', { name: 'Argentina' })).toHaveAttribute('aria-disabled', 'true')
    await user.click(screen.getByRole('option', { name: 'Argentina' }))
    expect(onChange).not.toHaveBeenCalled()

    rerender(<MultiSelect aria-label="Máximo" defaultValue={[1]} max={1} options={OPTIONS.slice(1)} onChange={onChange} />)
    expect(screen.queryByRole('button', { name: 'Quitar México' })).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  test('supports keyboard selection and backspace removal', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MultiSelect aria-label="Teclado" options={OPTIONS} onChange={onChange} />)
    const input = screen.getByRole('combobox', { name: 'Teclado' })
    await user.click(input)
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalled()
    await user.keyboard('{Backspace}')
    expect(onChange).toHaveBeenLastCalledWith([], [])
  })
})

test('InputGroup forwards FormField semantics to one control without losing external descriptions', () => {
  render(
    <FormField label="Monto" required helpText="En pesos" error="Inválido">
      <InputGroup prepend="$">
        <input aria-describedby="external" />
      </InputGroup>
    </FormField>,
  )
  const input = screen.getByRole('textbox', { name: /Monto/ })
  expect(input).toBeRequired()
  expect(input).toHaveAttribute('aria-invalid', 'true')
  const descriptions = input.getAttribute('aria-describedby').split(' ')
  expect(descriptions[0]).toBe('external')
  expect(descriptions).toHaveLength(3)
})

test('select render escape hatches fall back safely when a renderer returns an invalid child', async () => {
  const user = userEvent.setup()
  const hostile = { toString: () => { throw new Error('no render') } }

  render(
    <>
      <SearchableSelect
        aria-label="Opciones seguras"
        options={OPTIONS}
        renderOption={() => hostile}
      />
      <MultiSelect
        aria-label="Valores seguros"
        options={OPTIONS}
        defaultValue={[1]}
        renderValue={() => hostile}
      />
    </>,
  )

  expect(screen.getByRole('button', { name: 'Quitar México' })).toBeInTheDocument()
  await user.click(screen.getByRole('combobox', { name: 'Opciones seguras' }))
  expect(screen.getByRole('option', { name: 'México' })).toBeInTheDocument()
})


test('disabled advanced selects close, ignore form submission and preserve native input attributes', async () => {
  const user = userEvent.setup()
  const onKeyDown = vi.fn()
  const { container, rerender } = render(
    <form>
      <SearchableSelect
        aria-label="Cuenta deshabilitable"
        name="account"
        defaultValue={1}
        options={OPTIONS}
        data-testid="account-select"
        inputMode="numeric"
        readOnly
        tabIndex={3}
        onKeyDown={onKeyDown}
      />
      <MultiSelect aria-label="Etiquetas deshabilitables" name="tags" defaultValue={[1, 2]} options={OPTIONS} />
    </form>,
  )

  const account = screen.getByRole('combobox', { name: 'Cuenta deshabilitable' })
  expect(account).toHaveAttribute('data-testid', 'account-select')
  expect(account).toHaveAttribute('inputmode', 'numeric')
  expect(account).toHaveAttribute('readonly')
  expect(account).toHaveAttribute('tabindex', '3')
  await user.click(account)
  fireEvent.keyDown(account, { key: 'ArrowDown' })
  expect(onKeyDown).toHaveBeenCalled()
  expect(screen.getAllByRole('listbox')).toHaveLength(1)

  rerender(
    <form>
      <SearchableSelect aria-label="Cuenta deshabilitable" name="account" disabled defaultValue={1} options={OPTIONS} />
      <MultiSelect aria-label="Etiquetas deshabilitables" name="tags" disabled defaultValue={[1, 2]} options={OPTIONS} />
    </form>,
  )

  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  const data = new FormData(container.querySelector('form'))
  expect(data.getAll('account')).toEqual([])
  expect(data.getAll('tags')).toEqual([])
})

test('advanced listboxes dismiss on a pointer outside their layer', async () => {
  const user = userEvent.setup()
  render(<SearchableSelect aria-label="Fuera" options={OPTIONS} />)

  await user.click(screen.getByRole('combobox', { name: 'Fuera' }))
  expect(screen.getByRole('listbox')).toBeInTheDocument()
  await user.click(document.body)
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})

test('hostile cyclic renderer output falls back without recursion and ARIA labels stay textual', async () => {
  const user = userEvent.setup()
  const cycle = []
  cycle.push(cycle)

  render(
    <>
      <SearchableSelect
        aria-label="Cíclico"
        options={[{ value: 1, label: 'Alternativa' }]}
        renderOption={() => cycle}
      />
      <MultiSelect
        aria-label="Etiqueta visual"
        options={[{ value: 1, label: <strong>Visual</strong> }]}
        defaultValue={[1]}
      />
    </>,
  )

  expect(screen.getByRole('button', { name: 'Quitar 1' })).toBeInTheDocument()
  await user.click(screen.getByRole('combobox', { name: 'Cíclico' }))
  expect(screen.getByRole('option', { name: 'Alternativa' })).toBeInTheDocument()
})

test('native Select ignores invalid options and uses type-aware option keys', () => {
  const originalError = console.error
  const consoleError = vi.fn()
  console.error = consoleError
  try {
    render(<Select aria-label="Nativo" options={[null, 1, '1', { value: 2, label: 'Dos' }]} />)
    const select = screen.getByRole('combobox', { name: 'Nativo' })
    expect([...select.options].map(option => option.value)).toEqual(['1', '1', '2'])
    expect(consoleError).not.toHaveBeenCalledWith(expect.stringMatching(/unique "key"/i))
  } finally {
    console.error = originalError
  }
})
