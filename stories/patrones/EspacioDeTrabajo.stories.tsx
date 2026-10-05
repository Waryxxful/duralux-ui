import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActivityFeed, Badge, Button, Card, DashGrid, DescriptionList, KpiCard, PageHeader, RankList, Tabs, log } from '../../src'
import { TrendLine } from '../../src/charts/apex'
import { AGENTES, HORAS, conShell, mss, tresTemas } from './soporte'

const CONTACTABILIDAD_HOY = [55, 58, 61, 63, 60, 62, 64, 61]
const CONTACTABILIDAD_AYER = [57, 59, 60, 61, 62, 60, 61, 60]
const COBRANZA = AGENTES.filter(a => a.equipo === 'Cobranza' || a.equipo === 'Servicio')

const ACTIVIDAD = [
  { key: 1, variant: 'danger' as const, title: 'La contactabilidad bajó de 65 %', description: 'Alerta automática a las 13:00 · meta 70 %.', time: '13:00' },
  { key: 2, variant: 'primary' as const, title: 'Paula Herrera asignó 4 ejecutivos', description: 'Desde Servicio, hasta el cierre del turno.', time: '11:24' },
  { key: 3, variant: 'success' as const, title: 'Se cargó la base de octubre', description: '18.240 registros válidos · 312 descartados por teléfono inválido.', time: '09:02' },
  { key: 4, variant: 'warning' as const, title: 'Guion actualizado a la versión 3', description: 'Nueva oferta de repactación en 6 cuotas.', time: '08:40' },
]

function CampanaEnProfundidad() {
  const asignar = () => log.info('Patrón Espacio de trabajo: asignar ejecutivos a Cobranza Q4')
  return (
    <>
      <PageHeader
        title="Cobranza Q4"
        breadcrumbs={[{ label: 'Campañas', href: '#campanas' }, { label: 'Cobranza Q4' }]}
        className="sticky-top"
        actions={(
          <>
            <Button variant="light-brand" startIcon="edit-2">Editar campaña</Button>
            <Button variant="primary" startIcon="user-plus" onClick={asignar}>Asignar ejecutivos</Button>
          </>
        )}
      />
      <div className="main-content">
        <DashGrid>
          <DashGrid.Row layout={[12]}>
            <Card>
              <div className="sb-patron-entidad">
                <DescriptionList
                  columns={3}
                  items={[
                    { label: 'ID', value: '#4101', mono: true },
                    { label: 'Estado', value: <Badge variant="success" soft>Activa</Badge> },
                    { label: 'Área', value: 'Cobranza' },
                    { label: 'Ejecutivos', value: '24 · 4 prestados de Servicio' },
                    { label: 'Vigencia', value: '01-10-2026 a 31-12-2026' },
                    { label: 'Responsable', value: 'Paula Herrera' },
                  ]}
                />
                <KpiCard
                  label="Contactabilidad de hoy"
                  headingLevel={2}
                  value={61}
                  unit="%"
                  tone="warning"
                  status="Bajo la meta"
                  context="Meta 70 %"
                  delta={{ value: -4, unit: 'pts', label: 'vs. semana pasada' }}
                />
              </div>
            </Card>
          </DashGrid.Row>
          <DashGrid.Row layout={[8, 4]}>
            <Card title="Desempeño" subtitle="Hoy, por hora">
              <Tabs
                ariaLabel="Vistas de desempeño"
                tabs={[
                  {
                    key: 'tendencia',
                    label: 'Tendencia',
                    content: (
                      <TrendLine
                        ariaLabel="Contactabilidad por hora, hoy y ayer, con la meta de 70 %"
                        categories={HORAS}
                        series={[{ name: 'Hoy', data: CONTACTABILIDAD_HOY }, { name: 'Ayer', data: CONTACTABILIDAD_AYER }]}
                        target={{ value: 70, label: 'Meta 70 %' }}
                        tone="warning"
                        formatValue={(v: number) => `${v} %`}
                        height={240}
                      />
                    ),
                  },
                  {
                    key: 'ejecutivos',
                    label: 'Ejecutivos',
                    content: (
                      <RankList
                        label="Llamadas por ejecutivo"
                        unit="llamadas"
                        items={COBRANZA.map(a => ({ id: a.id, label: a.nombre, meta: `TMO ${mss(a.tmo)}`, value: a.llamadas }))}
                      />
                    ),
                  },
                ]}
              />
            </Card>
            <Card title="Actividad reciente" subtitle="Hoy">
              <ActivityFeed items={ACTIVIDAD} />
            </Card>
          </DashGrid.Row>
        </DashGrid>
      </div>
    </>
  )
}

const meta: Meta = {
  title: 'Patrones/Espacio de trabajo',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Una entidad en profundidad: cabecera con metadatos y la cifra clave, luego 8+4 con el trabajo a la izquierda y el contexto a la derecha. Ver docs/PATRONES.md.' } },
  },
  decorators: [conShell('/campanas')],
  render: () => <CampanaEnProfundidad />,
}
export default meta

export const { Claro, Oscuro, Navy } = tresTemas<StoryObj>()
