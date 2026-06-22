import { AreaChartWidget, BarChartWidget, LineChartWidget, PieChartWidget } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

const MONTHLY_DATA = [
  { name: 'Ene', ventas: 400, gastos: 240 },
  { name: 'Feb', ventas: 300, gastos: 139 },
  { name: 'Mar', ventas: 600, gastos: 380 },
  { name: 'Abr', ventas: 800, gastos: 430 },
  { name: 'May', ventas: 500, gastos: 280 },
  { name: 'Jun', ventas: 900, gastos: 490 },
]

const PIE_DATA = [
  { name: 'Facebook', value: 44, color: '#3454d1' },
  { name: 'Google', value: 28, color: '#22c55e' },
  { name: 'Email', value: 15, color: '#f59e0b' },
  { name: 'LinkedIn', value: 13, color: '#ef4444' },
]

export function RechartsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Recharts Widgets</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>
        Wrappers de Recharts para uso rápido. Para configuración avanzada usa <code>ApexChart</code>.
      </p>

      <ShowcaseSection
        title="AreaChartWidget"
        description="Props: data, series=[{key, color, label}], height, grid"
        preview={
          <AreaChartWidget
            data={MONTHLY_DATA}
            series={[
              { key: 'ventas', color: '#3454d1', label: 'Ventas' },
              { key: 'gastos', color: '#ef4444', label: 'Gastos' },
            ]}
            height={250}
          />
        }
        code={`<AreaChartWidget
  data={[{ name: 'Ene', ventas: 400, gastos: 240 }, ...]}
  series={[
    { key: 'ventas', color: '#3454d1', label: 'Ventas' },
    { key: 'gastos', color: '#ef4444', label: 'Gastos' },
  ]}
  height={250}
/>`}
      />

      <ShowcaseSection
        title="BarChartWidget"
        description="Props: data, series, height, stacked, rounded, barSize"
        preview={
          <BarChartWidget
            data={MONTHLY_DATA}
            series={[
              { key: 'ventas', color: '#3454d1', label: 'Ventas' },
              { key: 'gastos', color: '#a2acc7', label: 'Gastos' },
            ]}
            height={250}
          />
        }
        code={`<BarChartWidget
  data={data}
  series={[
    { key: 'ventas', color: '#3454d1', label: 'Ventas' },
    { key: 'gastos', color: '#a2acc7', label: 'Gastos' },
  ]}
  height={250}
/>`}
      />

      <ShowcaseSection
        title="PieChartWidget"
        description="Props: data=[{name, value, color}], donut, height, legend"
        preview={
          <div className="row">
            <div className="col-6">
              <PieChartWidget data={PIE_DATA} donut={false} height={250} />
            </div>
            <div className="col-6">
              <PieChartWidget data={PIE_DATA} donut height={250} />
            </div>
          </div>
        }
        code={`// Pie
<PieChartWidget data={[{ name: 'Facebook', value: 44, color: '#3454d1' }, ...]} height={250} />

// Donut
<PieChartWidget data={data} donut height={250} />`}
      />
    </div>
  )
}
