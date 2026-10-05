import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button, Card, DashGrid, DescriptionList, EmptyState, List, PageHeader, Person, Score, ScoreHero, Severity, log } from '../../src'
import type { SeverityLevel } from '../../src'
import { conShell, mss, tresTemas } from './soporte'

interface Evaluacion {
  id: number
  agente: string
  campana: string
  motivo: string
  duracion: number
  fecha: string
  puntaje: number
  prioridad: SeverityLevel
  criterios: { nombre: string; puntaje: number; max: number }[]
}

const EVALUACIONES: Evaluacion[] = [
  { id: 48213, agente: 'Diego Rojas', campana: 'Retención Fibra', motivo: 'Solicitud de baja', duracion: 512, fecha: '04-10-2026 15:48', puntaje: 58, prioridad: 'critical',
    criterios: [{ nombre: 'Saludo y validación de identidad', puntaje: 10, max: 10 }, { nombre: 'Oferta de retención', puntaje: 8, max: 30 }, { nombre: 'Manejo de objeciones', puntaje: 20, max: 30 }, { nombre: 'Cierre y registro', puntaje: 20, max: 30 }] },
  { id: 48207, agente: 'Felipe Vera', campana: 'Venta cruzada Hogar', motivo: 'Reclamo por cobro', duracion: 437, fecha: '04-10-2026 15:21', puntaje: 64, prioridad: 'critical',
    criterios: [{ nombre: 'Saludo y validación de identidad', puntaje: 6, max: 10 }, { nombre: 'Diagnóstico', puntaje: 18, max: 30 }, { nombre: 'Solución ofrecida', puntaje: 20, max: 30 }, { nombre: 'Cierre y registro', puntaje: 20, max: 30 }] },
  { id: 48198, agente: 'Hugo Lagos', campana: 'Soporte técnico', motivo: 'Falla de servicio', duracion: 366, fecha: '04-10-2026 14:55', puntaje: 76, prioridad: 'warning',
    criterios: [{ nombre: 'Saludo y validación de identidad', puntaje: 10, max: 10 }, { nombre: 'Diagnóstico', puntaje: 22, max: 30 }, { nombre: 'Solución ofrecida', puntaje: 24, max: 30 }, { nombre: 'Cierre y registro', puntaje: 20, max: 30 }] },
  { id: 48190, agente: 'Bruno Díaz', campana: 'Cobranza Q4', motivo: 'Compromiso de pago', duracion: 288, fecha: '04-10-2026 14:12', puntaje: 81, prioridad: 'normal',
    criterios: [{ nombre: 'Saludo y validación de identidad', puntaje: 10, max: 10 }, { nombre: 'Negociación', puntaje: 24, max: 30 }, { nombre: 'Compromiso registrado', puntaje: 25, max: 30 }, { nombre: 'Cierre', puntaje: 22, max: 30 }] },
  { id: 48184, agente: 'Ana Torres', campana: 'Cobranza Q4', motivo: 'Compromiso de pago', duracion: 241, fecha: '04-10-2026 13:40', puntaje: 92, prioridad: 'normal',
    criterios: [{ nombre: 'Saludo y validación de identidad', puntaje: 10, max: 10 }, { nombre: 'Negociación', puntaje: 28, max: 30 }, { nombre: 'Compromiso registrado', puntaje: 27, max: 30 }, { nombre: 'Cierre', puntaje: 27, max: 30 }] },
]

function DetalleEvaluacion({ evaluacion }: { evaluacion: Evaluacion }) {
  return (
    <Card
      title={<>Llamada <span className="font-monospace">#{evaluacion.id}</span></>}
      subtitle={`${evaluacion.motivo} · ${evaluacion.fecha}`}
      footer={(
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <Button variant="light-brand" startIcon="message-square" onClick={() => log.info(`Patrón Bandeja: pedir revisión de #${evaluacion.id}`)}>Pedir segunda revisión</Button>
          <Button variant="primary" startIcon="check" onClick={() => log.info(`Patrón Bandeja: confirmar evaluación #${evaluacion.id}`)}>Confirmar evaluación</Button>
        </div>
      )}
    >
      <div className="sb-patron-stack">
        <div className="sb-patron-entidad">
          <DescriptionList
            columns={2}
            items={[
              { label: 'Ejecutivo', value: <Person name={evaluacion.agente} size="sm" /> },
              { label: 'Campaña', value: evaluacion.campana },
              { label: 'Duración', value: mss(evaluacion.duracion) },
              { label: 'Prioridad', value: <Severity level={evaluacion.prioridad} size="sm" /> },
            ]}
          />
          <ScoreHero value={evaluacion.puntaje} label="Puntaje sugerido" context="Meta 80 · pauta Retención v3" />
        </div>
        <List
          label="Criterios de la pauta"
          density="compact"
          items={evaluacion.criterios.map(c => ({
            id: c.nombre,
            title: c.nombre,
            trailing: <Score value={c.puntaje} max={c.max} size="sm" />,
          }))}
        />
      </div>
    </Card>
  )
}

function BandejaCalidad({ vacia = false }: { vacia?: boolean }) {
  const items = vacia ? [] : EVALUACIONES
  const [seleccion, setSeleccion] = useState<number>(EVALUACIONES[0].id)
  const actual = items.find(e => e.id === seleccion)

  return (
    <>
      <PageHeader
        title="Evaluaciones por revisar"
        breadcrumbs={[{ label: 'Calidad', href: '#calidad' }, { label: 'Por revisar' }]}
        className="sticky-top"
        actions={<Button variant="light-brand" startIcon="filter">Filtrar por campaña</Button>}
      />
      <div className="main-content">
        <DashGrid>
          <DashGrid.Row layout={[5, 7]}>
            <Card title="Pendientes" subtitle={`${items.length} llamadas · las críticas primero`} noPadding>
              <div className="gcu-scroll sb-patron-bandeja__lista">
                <List
                  label="Evaluaciones pendientes"
                  selectionMode="single"
                  selectedIds={[seleccion]}
                  onSelectionChange={ids => {
                    const id = Number(ids[0])
                    log.info(`Patrón Bandeja: se abre la evaluación #${id}`)
                    if (ids.length) setSeleccion(id)
                  }}
                  empty={<EmptyState compact icon="check-circle" title="No hay evaluaciones pendientes" message="Las llamadas nuevas aparecen aquí cuando la IA termina de puntuarlas." />}
                  items={items.map(e => ({
                    id: e.id,
                    textValue: `${e.agente} ${e.motivo}`,
                    leading: <Severity level={e.prioridad} label={false} />,
                    title: `${e.agente} · ${e.motivo}`,
                    meta: `#${e.id} · ${e.campana} · ${e.fecha.slice(11)}`,
                    trailing: <Score value={e.puntaje} size="sm" showRange={false} />,
                  }))}
                />
              </div>
            </Card>
            {actual ? <DetalleEvaluacion evaluacion={actual} /> : (
              <Card>
                <EmptyState icon="inbox" title="Nada que revisar" message="Cuando haya una llamada pendiente, su detalle se muestra aquí." />
              </Card>
            )}
          </DashGrid.Row>
        </DashGrid>
      </div>
    </>
  )
}

const meta: Meta = {
  title: 'Patrones/Bandeja',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Trabajo uno a uno: lista seleccionable a la izquierda (5 col.) y detalle fijo a la derecha (7 col.) con la única acción primaria. Ver docs/PATRONES.md.' } },
  },
  decorators: [conShell('/calidad')],
  render: () => <BandejaCalidad />,
}
export default meta

export const { Claro, Oscuro, Navy } = tresTemas<StoryObj>()

export const Vacia: StoryObj = { name: 'Vacía', render: () => <BandejaCalidad vacia /> }
