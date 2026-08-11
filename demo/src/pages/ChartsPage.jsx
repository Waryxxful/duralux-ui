import { tokens } from '@duralux/ui'
import { ApexChart, ChartCard } from '@duralux/ui/charts/apex'
import { ShowcaseSection } from '../ShowcaseSection'

const CHART_COLORS = [
  tokens.colors.primary,
  tokens.colors.secondary,
  tokens.colors.success,
  tokens.colors.warning,
  tokens.colors.danger,
  tokens.colors.indigo,
]

const AREA_OPTIONS = {
  chart: { type: 'area', toolbar: { show: false } },
  colors: [CHART_COLORS[0]],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
  xaxis: { categories: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago'] },
  dataLabels: { enabled: false },
}

const BAR_OPTIONS = {
  chart: { type: 'bar', toolbar: { show: false } },
  colors: [CHART_COLORS[0], CHART_COLORS[1]],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
  xaxis: { categories: ['Ene','Feb','Mar','Abr','May','Jun'] },
  dataLabels: { enabled: false },
  legend: { position: 'top' },
}

const DONUT_OPTIONS = {
  chart: { type: 'donut' },
  colors: [CHART_COLORS[0], CHART_COLORS[2], CHART_COLORS[3], CHART_COLORS[4], CHART_COLORS[5]],
  labels: ['Facebook','Google','Email','LinkedIn','Referido'],
  legend: { position: 'bottom' },
  plotOptions: { pie: { donut: { size: '65%' } } },
}

const LINE_OPTIONS = {
  chart: { type: 'line', toolbar: { show: false } },
  colors: [CHART_COLORS[0], CHART_COLORS[2]],
  stroke: { curve: 'smooth', width: [2, 2] },
  xaxis: { categories: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago'] },
  dataLabels: { enabled: false },
  legend: { position: 'top' },
}

export function ChartsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>ApexChart</h1>
      <p style={{ color: tokens.colors.secondary, marginBottom: 32 }}>
        Props: <code>type, options, series, height, width</code><br />
        Wrapper directo de <code>react-apexcharts</code> — misma configuración que los init files del template Duralux.
      </p>

      <ShowcaseSection
        title="Area chart"
        preview={
          <ApexChart ariaLabel="Ventas por mes" type="area" options={AREA_OPTIONS}
            series={[{ name: 'Ventas', data: [31,40,28,51,42,82,56,74] }]} height={250} />
        }
        code={`<ApexChart
  type="area"
  options={{
    colors: [tokens.colors.primary],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
    xaxis: { categories: ['Ene','Feb','Mar','Abr','May','Jun'] },
  }}
  series={[{ name: 'Ventas', data: [31,40,28,51,42,82] }]}
  height={250}
/>`}
      />

      <ShowcaseSection
        title="Bar chart (múltiples series)"
        preview={
          <ApexChart ariaLabel="Ingresos y gastos por mes" type="bar" options={BAR_OPTIONS}
            series={[
              { name: 'Ingresos', data: [44,55,41,67,22,43] },
              { name: 'Gastos', data: [13,23,20,8,13,27] },
            ]} height={260} />
        }
        code={`<ApexChart
  type="bar"
  options={{ colors: [tokens.colors.primary, tokens.colors.secondary], plotOptions: { bar: { borderRadius: 4 } } }}
  series={[
    { name: 'Ingresos', data: [44,55,41,67,22,43] },
    { name: 'Gastos', data: [13,23,20,8,13,27] },
  ]}
  height={260}
/>`}
      />

      <ShowcaseSection
        title="Donut chart"
        preview={
          <ApexChart ariaLabel="Fuentes de leads" type="donut" options={DONUT_OPTIONS}
            series={[44,55,23,18,12]} height={320} />
        }
        code={`<ApexChart
  type="donut"
  options={{ labels: ['Facebook','Google','Email','LinkedIn','Referido'] }}
  series={[44,55,23,18,12]}
  height={320}
/>`}
      />

      <ShowcaseSection
        title="Line chart (múltiples series)"
        preview={
          <ApexChart ariaLabel="Leads y conversiones por mes" type="line" options={LINE_OPTIONS}
            series={[
              { name: 'Leads', data: [10,41,35,51,49,62,69,91] },
              { name: 'Convertidos', data: [5,22,18,30,25,41,50,70] },
            ]} height={250} />
        }
        code={`<ApexChart
  type="line"
  options={{ colors: [tokens.colors.primary, tokens.colors.success], stroke: { curve: 'smooth' } }}
  series={[
    { name: 'Leads', data: [10,41,35,51,49,62] },
    { name: 'Convertidos', data: [5,22,18,30,25,41] },
  ]}
  height={250}
/>`}
      />

      <ShowcaseSection
        title="ChartCard wrapper"
        description="Envuelve ApexChart en una Card con título y acciones."
        preview={
          <ChartCard title="Tendencia de Ventas" subtitle="Últimos 8 meses"
            actions={[{ label: 'Mensual', onClick: () => {} }, { label: 'Anual', onClick: () => {} }]}>
            <ApexChart type="area" options={AREA_OPTIONS}
              series={[{ name: 'Ventas', data: [31,40,28,51,42,82,56,74] }]} height={200} />
          </ChartCard>
        }
        code={`<ChartCard title="Ventas" subtitle="Últimos 8 meses"
  actions={[{ label: 'Mensual', onClick: () => {} }]}>
  <ApexChart type="area" options={...} series={[...]} height={200} />
</ChartCard>`}
      />
    </div>
  )
}
