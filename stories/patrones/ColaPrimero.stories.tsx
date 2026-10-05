import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Card, DashGrid, PageHeader, Severity, Spotlight, StatGroup, Table, WelcomeBand, log } from '../../src'
import type { SeverityLevel } from '../../src'
import { Sparkline } from '../../src/charts/apex'
import { COLAS, HORAS, conShell, mss, pct, tresTemas } from './soporte'
import type { Cola } from './soporte'

const NIVEL_SERVICIO = [78, 81, 79, 84, 86, 85, 83, 81]

function severidad(cola: Cola): SeverityLevel {
  if (cola.esperaMax >= 180 || cola.nivelServicio < 70) return 'critical'
  if (cola.esperaMax >= 120 || cola.nivelServicio < 80) return 'warning'
  return 'normal'
}

const COLUMNAS = [
  { key: 'nombre', header: 'Cola', render: (c: Cola) => <span className="fw-medium">{c.nombre}</span> },
  { key: 'estado', header: 'Estado', render: (c: Cola) => <Severity level={severidad(c)} size="sm" /> },
  { key: 'enEspera', header: 'En espera', numeric: true },
  { key: 'esperaMax', header: 'Espera máx.', numeric: true, render: (c: Cola) => mss(c.esperaMax) },
  { key: 'libres', header: 'Ejecutivos libres', numeric: true },
  { key: 'nivelServicio', header: 'Nivel de servicio', numeric: true, render: (c: Cola) => pct(c.nivelServicio) },
]

function TableroOperacion() {
  const reasignar = () => log.info('Patrón Cola primero: reasignar ejecutivos a Cobranza temprana')
  return (
    <>
      <PageHeader
        title="Tablero del contact center"
        className="sticky-top sb-patron-sin-miga"
        actions={<Button variant="light-brand" startIcon="download">Exportar resumen</Button>}
      />
      <div className="main-content">
        <DashGrid>
          <DashGrid.Row layout={[8, 4]}>
            <WelcomeBand
              title="Cobranza temprana tiene 18 llamadas en espera"
              lede="La espera llega a 4:32 y no hay ejecutivos libres. Reasigna dos ejecutivos de Ventas Hogar, que tiene 4 libres."
              stats={[
                { label: 'En espera', value: 18 },
                { label: 'Espera máxima', value: '4:32' },
                { label: 'Ejecutivos libres', value: 0 },
              ]}
              actions={(
                <>
                  <Button variant="light" onClick={reasignar}>Reasignar ejecutivos</Button>
                  <Button variant="link" className="text-white" href="#colas">Ver la cola</Button>
                </>
              )}
              tone="danger"
            />
            <Spotlight label="Nivel de servicio de hoy" value={81} unit="%" delta={{ value: -3, unit: 'pts', label: 'vs. ayer' }} context="Meta 80 %" tone="indigo">
              <Sparkline ariaLabel="Nivel de servicio por hora" data={NIVEL_SERVICIO} categories={HORAS} onColor />
            </Spotlight>
          </DashGrid.Row>
          <DashGrid.Row layout={[8, 4]}>
            <Card title="Colas en riesgo" subtitle="Ordenadas por espera máxima · actualizado a las 16:42" noPadding>
              <Table<Cola> aria-label="Colas en riesgo" columns={COLUMNAS} rows={COLAS} rowKey="id" density="compact" />
            </Card>
            <StatGroup
              title="Hoy, hasta las 16:42"
              headingLevel={2}
              items={[
                { label: 'Llamadas atendidas', value: 2840, icon: 'phone-incoming', tone: 'primary', delta: { value: 6, unit: '%', label: 'vs. martes pasado' } },
                { label: 'Abandono', value: 4.8, unit: '%', icon: 'phone-missed', tone: 'warning', delta: { value: 1.2, unit: 'pts', goodWhen: 'down', label: 'vs. ayer' }, context: 'Máximo 5 %' },
                { label: 'TMO', value: '5:12', icon: 'clock', tone: 'info', delta: { value: -14, unit: 's', goodWhen: 'down', label: 'vs. ayer' } },
              ]}
            />
          </DashGrid.Row>
        </DashGrid>
      </div>
    </>
  )
}

const meta: Meta = {
  title: 'Patrones/Cola primero',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Tablero que abre con lo que hay que atender: WelcomeBand + Spotlight en 8+4, la cola en riesgo y un StatGroup con contexto. Ver docs/PATRONES.md.' } },
  },
  decorators: [conShell('/tablero')],
  render: () => <TableroOperacion />,
}
export default meta

// Exportaciones explícitas: el indexador de Storybook ignora las desestructuradas.
const temas = tresTemas<StoryObj>()
export const Claro = temas.Claro
export const Oscuro = temas.Oscuro
export const Navy = temas.Navy
