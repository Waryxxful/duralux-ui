import { ApexChart, ChartCard } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

const AREA_OPTIONS = {
  chart: { type: 'area', toolbar: { show: false } },
  colors: ['#3454d1'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
  xaxis: { categories: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago'] },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9' },
}

const BAR_OPTIONS = {
  chart: { type: 'bar', toolbar: { show: false } },
  colors: ['#3454d1','#a2acc7'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
  xaxis: { categories: ['Ene','Feb','Mar','Abr','May','Jun'] },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9' },
  legend: { position: 'top' },
}

const DONUT_OPTIONS = {
  chart: { type: 'donut' },
  colors: ['#3454d1','#22c55e','#f59e0b','#ef4444','#8b5cf6'],
  labels: ['Facebook','Google','Email','LinkedIn','Referido'],
  legend: { position: 'bottom' },
  plotOptions: { pie: { donut: { size: '65%' } } },
}

const LINE_OPTIONS = {
  chart: { type: 'line', toolbar: { show: false } },
  colors: ['#3454d1','#22c55e'],
  stroke: { curve: 'smooth', width: [2, 2] },
  xaxis: { categories: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago'] },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9' },
  legend: { position: 'top' },
}

export function ChartsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>ApexChart</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>
        Props: <code>type, options, series, height, width</code><br />
        Wrapper directo de <code>react-apexcharts</code> — misma configuración que los init files del template Duralux.
      </p>

      <ShowcaseSection
        title="Area chart"
        preview={
          <ApexChart type="area" options={AREA_OPTIONS}
            series={[{ name: 'Ventas', data: [31,40,28,51,42,82,56,74] }]} height={250} />
        }
        code={`<ApexChart
  type="area"
  options={{
    colors: ['#3454d1'],
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
          <ApexChart type="bar" options={BAR_OPTIONS}
            series={[
              { name: 'Ingresos', data: [44,55,41,67,22,43] },
              { name: 'Gastos', data: [13,23,20,8,13,27] },
            ]} height={260} />
        }
        code={`<ApexChart
  type="bar"
  options={{ colors: ['#3454d1','#a2acc7'], plotOptions: { bar: { borderRadius: 4 } } }}
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
          <ApexChart type="donut" options={DONUT_OPTIONS}
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
          <ApexChart type="line" options={LINE_OPTIONS}
            series={[
              { name: 'Leads', data: [10,41,35,51,49,62,69,91] },
              { name: 'Convertidos', data: [5,22,18,30,25,41,50,70] },
            ]} height={250} />
        }
        code={`<ApexChart
  type="line"
  options={{ colors: ['#3454d1','#22c55e'], stroke: { curve: 'smooth' } }}
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
