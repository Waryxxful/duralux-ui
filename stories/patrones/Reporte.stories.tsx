import type { Meta, StoryObj } from '@storybook/react-vite'
import dayjs from 'dayjs'
import { useState } from 'react'
import { ActiveFilters, Button, Card, DashGrid, DataTable, FormField, PageHeader, Segmented, Select, StatGroup, log } from '../../src'
import type { ActiveFilter, DataTableColumn } from '../../src'
import { DateRangeFilter, DuraluxAntdProvider } from '../../src/antd'
import { TrendLine } from '../../src/charts/apex'
import { DIAS, conShell, miles, mss, pct, temaDe, tresTemas } from './soporte'
import type { DiaReporte, TemaPatron } from './soporte'

const COLUMNAS: ReadonlyArray<DataTableColumn<DiaReporte>> = [
  { key: 'fecha', label: 'Fecha', sortable: true, hideable: false },
  { key: 'ofrecidas', label: 'Ofrecidas', sortable: true, numeric: true, render: d => miles(d.ofrecidas) },
  { key: 'atendidas', label: 'Atendidas', sortable: true, numeric: true, render: d => miles(d.atendidas) },
  { key: 'abandono', label: 'Abandono', sortable: true, numeric: true, render: d => pct(d.abandono) },
  { key: 'nivelServicio', label: 'Nivel de servicio', sortable: true, numeric: true, render: d => pct(d.nivelServicio) },
  { key: 'tmo', label: 'TMO', sortable: true, numeric: true, render: d => mss(d.tmo) },
]

const FILTROS_INICIALES: ActiveFilter[] = [
  { key: 'campana', label: 'Campaña', value: 'Cobranza Q4' },
  { key: 'turno', label: 'Turno', value: 'Mañana' },
]

function ReporteNivelServicio({ tema }: { tema: TemaPatron }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [granularidad, setGranularidad] = useState('dia')
  const quitar = (key: string) => {
    log.info(`Patrón Reporte: se quita el filtro ${key}`)
    setFiltros(actuales => actuales.filter(f => f.key !== key))
  }

  return (
    <>
      <PageHeader
        title="Reporte de nivel de servicio"
        breadcrumbs={[{ label: 'Reportes', href: '#reportes' }, { label: 'Nivel de servicio' }]}
        className="sticky-top"
        actions={(
          <>
            <Button variant="light-brand" startIcon="calendar">Programar envío</Button>
            <Button variant="primary" startIcon="download" onClick={() => log.info('Patrón Reporte: exportar')}>Exportar reporte</Button>
          </>
        )}
      />
      <div className="main-content">
        <DashGrid>
          <DashGrid.Row layout={[12]}>
            <Card title="Filtros" subtitle="El reporte se recalcula al cambiar el período o la campaña">
              <div className="sb-patron-stack">
                <DuraluxAntdProvider theme={tema}>
                  <div className="sb-patron-filtros">
                    <FormField label="Período" htmlFor="reporte-periodo">
                      <DateRangeFilter id="reporte-periodo" defaultValue={[dayjs('2026-09-21'), dayjs('2026-10-04')]} />
                    </FormField>
                    <FormField label="Campaña" htmlFor="reporte-campana">
                      <Select id="reporte-campana" defaultValue="cobranza" options={[
                        { value: 'todas', label: 'Todas las campañas' },
                        { value: 'cobranza', label: 'Cobranza Q4' },
                        { value: 'retencion', label: 'Retención Fibra' },
                      ]} />
                    </FormField>
                    <Segmented aria-label="Agrupar por" value={granularidad} onChange={setGranularidad} options={[
                      { value: 'hora', label: 'Por hora' },
                      { value: 'dia', label: 'Por día' },
                      { value: 'semana', label: 'Por semana' },
                    ]} />
                  </div>
                </DuraluxAntdProvider>
                <ActiveFilters filters={filtros} onRemove={quitar} onClear={() => setFiltros([])} resultCount={DIAS.length} />
              </div>
            </Card>
          </DashGrid.Row>
          <DashGrid.Row layout={[8, 4]}>
            <Card title="Nivel de servicio por día" subtitle="Llamadas atendidas antes de 20 s · 21-09-2026 a 04-10-2026">
              <TrendLine
                ariaLabel="Nivel de servicio por día, con la meta de 80 %"
                categories={DIAS.map(d => d.fecha.slice(0, 5))}
                series={[{ name: 'Nivel de servicio', data: DIAS.map(d => d.nivelServicio) }]}
                target={{ value: 80, label: 'Meta 80 %' }}
                formatValue={(v: number) => pct(v)}
                height={260}
              />
            </Card>
            <StatGroup
              title="Resumen del período"
              headingLevel={2}
              items={[
                { label: 'Nivel de servicio', value: 85.6, unit: '%', tone: 'success', context: 'Meta 80 %', delta: { value: 2.1, unit: 'pts', label: 'vs. período anterior' } },
                { label: 'Abandono', value: 3.9, unit: '%', tone: 'warning', context: 'Máximo 5 %', delta: { value: 0.4, unit: 'pts', goodWhen: 'down', label: 'vs. período anterior' } },
                { label: 'Llamadas ofrecidas', value: 35350, tone: 'primary', delta: { value: 7, unit: '%', label: 'vs. período anterior' } },
              ]}
            />
          </DashGrid.Row>
          <DashGrid.Row layout={[12]}>
            <Card title="Detalle por día" noPadding>
              <DataTable<DiaReporte>
                aria-label="Detalle por día"
                columns={COLUMNAS}
                data={DIAS}
                pageSize={7}
                density="compact"
                columnMenu
              />
            </Card>
          </DashGrid.Row>
        </DashGrid>
      </div>
    </>
  )
}

const meta: Meta = {
  title: 'Patrones/Reporte',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Analítica: barra de filtros con DateRangeFilter y filtros activos, tendencia con meta y tabla de detalle. Ver docs/PATRONES.md.' } },
  },
  decorators: [conShell('/reportes')],
  render: (_args, { globals }) => <ReporteNivelServicio tema={temaDe(globals.theme)} />,
}
export default meta

export const { Claro, Oscuro, Navy } = tresTemas<StoryObj>()
