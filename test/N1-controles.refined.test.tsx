import { createRef, useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Segmented } from '../src/components/ui/Segmented'
import { Accordion } from '../src/components/ui/Accordion'
import { Switch } from '../src/components/form/Switch'
import { Fieldset } from '../src/components/form/Fieldset'
import { RadioGroup } from '../src/components/form/RadioGroup'
import { ChoiceCard } from '../src/components/form/ChoiceCard'

afterEach(() => vi.restoreAllMocks())

describe('Segmented', () => {
  const options = ['Hoy', 'Semana', { value: 'mes', label: 'Mes', disabled: true }] as const

  test('radiogroup con radios nativos; no controlado notifica el valor elegido', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Segmented aria-label="Rango" options={options} defaultValue="Hoy" onChange={onChange} />)
    expect(screen.getByRole('radiogroup', { name: 'Rango' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Hoy' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Mes' })).toBeDisabled()
    await user.click(screen.getByText('Semana'))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('Semana')
    expect(screen.getByRole('radio', { name: 'Semana' })).toBeChecked()
  })

  test('los radios comparten name: una sola parada de Tab y flechas nativas', () => {
    render(<Segmented aria-label="Vista" options={['Lista', 'Tablero']} defaultValue="Lista" />)
    const [first, second] = screen.getAllByRole('radio')
    expect(first.getAttribute('name')).toBe(second.getAttribute('name'))
  })

  test('controlado: solo cambia cuando el padre actualiza', async () => {
    const user = userEvent.setup()
    function Controlado() {
      const [value, setValue] = useState('Hoy')
      return <><Segmented aria-label="Rango" options={['Hoy', 'Semana']} value={value} onChange={setValue} /><output>{value}</output></>
    }
    render(<Controlado />)
    await user.click(screen.getByText('Semana'))
    expect(screen.getByRole('status')).toHaveTextContent('Semana')
  })

  test('avisa por log sin nombre de grupo ni valor válido', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Segmented options={['A', 'B']} value="C" />)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('aria-label'))
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('"C"'))
  })
})

describe('Switch', () => {
  test('role="switch" con etiqueta clicable; ref al input', async () => {
    const user = userEvent.setup()
    const ref = createRef<HTMLInputElement>()
    render(<Switch ref={ref} label="Notificar por correo" description="Se avisa al supervisor." />)
    const control = screen.getByRole('switch', { name: 'Notificar por correo' })
    expect(ref.current).toBe(control)
    expect(control).toHaveAccessibleDescription('Se avisa al supervisor.')
    await user.click(screen.getByText('Notificar por correo'))
    expect(control).toBeChecked()
  })

  test('controlado declara aria-checked', () => {
    render(<Switch label="Activo" checked onChange={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

})

describe('Fieldset y RadioGroup', () => {
  test('Fieldset: legend nombra el grupo; descripción y error lo describen', () => {
    render(<Fieldset legend="Datos de la cuenta" description="Se usan en la factura." error="Completa el RUT."><input aria-label="RUT" /></Fieldset>)
    const group = screen.getByRole('group', { name: 'Datos de la cuenta' })
    expect(group).toHaveAccessibleDescription('Se usan en la factura. Completa el RUT.')
    expect(screen.getByRole('alert')).toHaveTextContent('Completa el RUT.')
  })

  test('RadioGroup: selección no controlada, onChange con valor y error del grupo', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RadioGroup
        legend="Frecuencia del reporte"
        options={[
          { value: 'diaria', label: 'Diaria' },
          { value: 'semanal', label: 'Semanal', description: 'Los lunes a las 8:00' },
        ]}
        defaultValue="diaria"
        onChange={onChange}
        error="Elige una frecuencia."
        orientation="horizontal"
      />,
    )
    expect(screen.getByRole('group', { name: 'Frecuencia del reporte' })).toBeInTheDocument()
    const semanal = screen.getByRole('radio', { name: 'Semanal' })
    expect(semanal).toHaveAccessibleDescription('Los lunes a las 8:00')
    expect(semanal).toHaveAttribute('aria-invalid', 'true')
    await user.click(semanal)
    expect(onChange).toHaveBeenCalledWith('semanal', expect.anything())
    expect(semanal).toBeChecked()
  })

  test('RadioGroup avisa si el valor no está entre las opciones', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<RadioGroup legend="Canal" options={[{ value: 'voz', label: 'Voz' }]} value="chat" />)
    expect(warn).toHaveBeenCalledWith('[duralux]', expect.stringContaining('"chat"'))
  })
})

describe('ChoiceCard', () => {
  test('toda la tarjeta selecciona; título como nombre y descripción asociada', async () => {
    const user = userEvent.setup()
    render(
      <>
        <ChoiceCard name="plan" value="basico" title="Básico" description="Hasta 10 agentes" />
        <ChoiceCard name="plan" value="pro" title="Pro" description="Agentes ilimitados" />
      </>,
    )
    const pro = screen.getByRole('radio', { name: 'Pro' })
    expect(pro).toHaveAccessibleDescription('Agentes ilimitados')
    await user.click(screen.getByText('Agentes ilimitados'))
    expect(pro).toBeChecked()
  })

  test('type="checkbox" permite varias', () => {
    render(<ChoiceCard type="checkbox" title="Chat" />)
    expect(screen.getByRole('checkbox', { name: 'Chat' })).toBeInTheDocument()
  })
})

describe('Accordion (APG)', () => {
  const items = [
    { value: 'a', title: 'Horario', content: 'Lunes a viernes' },
    { value: 'b', title: 'Canales', content: 'Voz y chat' },
    { value: 'c', title: 'Archivado', content: 'No disponible', disabled: true },
  ]

  test('botón con aria-expanded/aria-controls y región nombrada; cerrado queda inert', async () => {
    const user = userEvent.setup()
    render(<Accordion items={items} defaultValue={['a']} />)
    const horario = screen.getByRole('button', { name: 'Horario' })
    expect(horario).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('region', { name: 'Horario' })).toHaveTextContent('Lunes a viernes')
    const canalesPanel = document.getElementById(screen.getByRole('button', { name: 'Canales' }).getAttribute('aria-controls') ?? '')
    expect(canalesPanel).toHaveAttribute('inert')
    await user.click(screen.getByRole('button', { name: 'Canales' }))
    expect(horario).toHaveAttribute('aria-expanded', 'false')
    expect(canalesPanel).not.toHaveAttribute('inert')
  })

  test('multiple deja varias abiertas y notifica el arreglo', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Accordion items={items} multiple defaultValue={['a']} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Canales' }))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'])
  })

  test('flechas, Inicio y Fin recorren los títulos habilitados', () => {
    render(<Accordion items={items} headingLevel={4} />)
    const horario = screen.getByRole('button', { name: 'Horario' })
    act(() => { horario.focus() })
    fireEvent.keyDown(horario, { key: 'ArrowDown' })
    expect(screen.getByRole('button', { name: 'Canales' })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole('button', { name: 'Canales' }), { key: 'ArrowDown' })
    expect(horario).toHaveFocus()
    fireEvent.keyDown(horario, { key: 'End' })
    expect(screen.getByRole('button', { name: 'Canales' })).toHaveFocus()
    expect(screen.getByRole('heading', { level: 4, name: 'Horario' })).toBeInTheDocument()
  })
})
