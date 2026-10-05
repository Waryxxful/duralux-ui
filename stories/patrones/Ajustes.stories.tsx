import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Alert, Button, Card, Fieldset, FormField, Input, List, PageHeader, RadioGroup, Select, Switch, log } from '../../src'
import { conShell, tresTemas } from './soporte'

const SECCIONES = [
  { id: 'atencion', title: 'Atención', meta: 'Horario, umbrales y colas' },
  { id: 'notificaciones', title: 'Notificaciones', meta: 'Alertas a supervisores' },
  { id: 'calidad', title: 'Calidad', meta: 'Requiere rol de analista de calidad', disabled: true },
  { id: 'integraciones', title: 'Integraciones', meta: 'Requiere rol de administrador', disabled: true },
]

function AjustesCuenta() {
  const [seccion, setSeccion] = useState('atencion')
  const [cambios, setCambios] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const marcar = () => { setCambios(true); setGuardado(false) }
  const guardar = () => {
    log.info(`Patrón Ajustes: guardar la sección ${seccion}`)
    setCambios(false)
    setGuardado(true)
  }

  return (
    <>
      <PageHeader
        title="Ajustes de la cuenta"
        breadcrumbs={[{ label: 'Administración', href: '#admin' }, { label: 'Ajustes' }]}
        className="sticky-top"
        actions={(
          <>
            <Button variant="light-brand" disabled={!cambios} title={cambios ? undefined : 'No hay cambios por descartar'} onClick={() => setCambios(false)}>Descartar cambios</Button>
            <Button variant="primary" startIcon="save" disabled={!cambios} title={cambios ? undefined : 'Modifica un campo para guardar'} onClick={guardar}>Guardar cambios</Button>
          </>
        )}
      />
      <div className="main-content">
        <div className="row g-4">
          <div className="col-lg-3">
            <Card noPadding>
              <nav aria-label="Secciones de ajustes">
                <List
                  items={SECCIONES.map(s => ({
                    ...s,
                    active: s.id === seccion,
                    onClick: () => {
                      log.info(`Patrón Ajustes: se abre la sección ${s.id}`)
                      setSeccion(s.id)
                    },
                  }))}
                />
              </nav>
            </Card>
          </div>
          <div className="col-lg-9">
            {seccion === 'atencion' ? (
            <Card title="Atención" subtitle="Se aplica a todas las colas de la cuenta Comercial Andes">
              <div className="sb-patron-stack">
                {guardado ? <Alert variant="success" soft announce onDismiss={() => setGuardado(false)}>Cambios guardados. Se aplican desde la próxima llamada.</Alert> : null}
                <Fieldset legend="Horario de atención" description="Fuera de este horario las llamadas van al buzón de voz." columns={2}>
                  <FormField label="Apertura" htmlFor="ajustes-apertura">
                    <Input id="ajustes-apertura" type="time" defaultValue="08:30" onChange={marcar} />
                  </FormField>
                  <FormField label="Cierre" htmlFor="ajustes-cierre">
                    <Input id="ajustes-cierre" type="time" defaultValue="20:00" onChange={marcar} />
                  </FormField>
                </Fieldset>
                <Fieldset legend="Umbrales de la cola" columns={2}>
                  <FormField label="Espera máxima (segundos)" htmlFor="ajustes-espera" helpText="Sobre este valor la cola pasa a crítica en el tablero.">
                    <Input id="ajustes-espera" type="number" inputMode="numeric" defaultValue={180} onChange={marcar} />
                  </FormField>
                  <FormField label="Meta de nivel de servicio" htmlFor="ajustes-meta" helpText="Porcentaje de llamadas atendidas antes de 20 s.">
                    <Select id="ajustes-meta" defaultValue="80" onChange={marcar} options={[{ value: '75', label: '75 %' }, { value: '80', label: '80 %' }, { value: '85', label: '85 %' }]} />
                  </FormField>
                </Fieldset>
                <RadioGroup
                  legend="Desborde cuando no hay ejecutivos libres"
                  name="ajustes-desborde"
                  defaultValue="cola"
                  onChange={marcar}
                  options={[
                    { value: 'cola', label: 'Mantener en espera', description: 'La llamada sigue en la cola hasta la espera máxima.' },
                    { value: 'reasignar', label: 'Desbordar a otra cola', description: 'Pasa a Servicio después de 2 minutos.' },
                    { value: 'callback', label: 'Ofrecer devolución de llamada', description: 'El cliente deja su número y se agenda.' },
                  ]}
                />
                <Switch label="Grabar todas las llamadas" description="Necesario para evaluar calidad. Se avisa al cliente al inicio." defaultChecked onChange={marcar} />
              </div>
            </Card>
            ) : (
            <Card title={SECCIONES.find(s => s.id === seccion)?.title} subtitle={SECCIONES.find(s => s.id === seccion)?.meta}>
              <Fieldset legend="Avisos a supervisores" description="Cada aviso llega al supervisor de turno de la cola afectada.">
                <Switch label="Cola en estado crítico" description="Cuando la espera supera el máximo configurado." defaultChecked onChange={marcar} />
                <Switch label="Campaña bajo la meta" description="Resumen a las 13:00 y a las 18:00." defaultChecked onChange={marcar} />
                <Switch label="Evaluación con error grave" description="Se avisa apenas la IA anula un puntaje." onChange={marcar} />
              </Fieldset>
            </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const meta: Meta = {
  title: 'Patrones/Ajustes',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Navegación lateral de secciones y formulario con guardado explícito en la cabecera de la página. Ver docs/PATRONES.md.' } },
  },
  decorators: [conShell('/ajustes')],
  render: () => <AjustesCuenta />,
}
export default meta

// Exportaciones explícitas: el indexador de Storybook ignora las desestructuradas.
const temas = tresTemas<StoryObj>()
export const Claro = temas.Claro
export const Oscuro = temas.Oscuro
export const Navy = temas.Navy
