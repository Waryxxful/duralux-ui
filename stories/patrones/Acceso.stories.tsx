import type { Meta, StoryObj } from '@storybook/react-vite'
import type * as React from 'react'
import { useState } from 'react'
import { Alert, AuthLayout, Button, Checkbox, FormField, Input, log } from '../../src'
import { tresTemas } from './soporte'

function FormularioAcceso({ errorInicial = false }: { errorInicial?: boolean }) {
  const [error, setError] = useState(errorInicial)
  const [enviando, setEnviando] = useState(false)

  const ingresar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    log.info('Patrón Acceso: intento de ingreso')
    setEnviando(true)
    window.setTimeout(() => {
      setEnviando(false)
      setError(true)
    }, 600)
  }

  return (
    <form className="sb-patron-acceso" onSubmit={ingresar} noValidate>
      <div>
        <h1 className="sb-patron-acceso__titulo">Ingresa a GranCRM</h1>
        <p className="sb-patron-acceso__lead">Usa el correo de tu cuenta de In-Touch.</p>
      </div>
      {error ? (
        <Alert variant="danger" soft announce title="No pudimos validar tus datos">
          Revisa el correo y la contraseña. Después de 5 intentos la cuenta se bloquea por 15 minutos.
        </Alert>
      ) : null}
      <FormField label="Correo" htmlFor="acceso-correo" required>
        <Input id="acceso-correo" type="email" autoComplete="username" defaultValue="paula.herrera@in-touchcrm.cl" invalid={error} />
      </FormField>
      <FormField label="Contraseña" htmlFor="acceso-clave" required hint={<a href="#recuperar">¿Olvidaste tu contraseña?</a>}>
        <Input id="acceso-clave" type="password" autoComplete="current-password" invalid={error} />
      </FormField>
      <Checkbox id="acceso-recordar" label="Mantener la sesión en este equipo" />
      <Button type="submit" variant="primary" loading={enviando} className="w-100">Ingresar</Button>
    </form>
  )
}

const meta: Meta = {
  title: 'Patrones/Acceso',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Pantalla de acceso con AuthLayout: un título, el formulario y un error accesible que no borra lo escrito. Ver docs/PATRONES.md.' } },
  },
  render: () => <AuthLayout><FormularioAcceso /></AuthLayout>,
}
export default meta

export const { Claro, Oscuro, Navy } = tresTemas<StoryObj>()

export const ConError: StoryObj = {
  name: 'Con error',
  render: () => <AuthLayout><FormularioAcceso errorInicial /></AuthLayout>,
}
