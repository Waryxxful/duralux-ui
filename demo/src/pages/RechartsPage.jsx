import { tokens } from '@duralux/ui'
import { AreaChartWidget, BarChartWidget, LineChartWidget, PieChartWidget } from '@duralux/ui/charts/recharts'
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
  { name: 'Facebook', value: 44 },
  { name: 'Google', value: 28 },
  { name: 'Email', value: 15 },
  { name: 'LinkedIn', value: 13 },
]

export function RechartsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Recharts Widgets</h1>
      <p style={{ color: `var(--gcu-muted, ${tokens.colors.secondary})`, marginBottom: 32 }}>
        Wrappers de Recharts para uso rápido. Para configuración avanzada usa <code>ApexChart</code>.
      </p>

      <ShowcaseSection
        title="AreaChartWidget"
        description="Props: data, series=[{key, color?, label}], height, grid. color es opcional y usa la paleta Duralux."
        preview={
          <AreaChartWidget
            ariaLabel="Ventas y gastos por mes"
            description="Comparación mensual de ventas y gastos"
            data={MONTHLY_DATA}
            series={[
              { key: 'ventas', label: 'Ventas' },
              { key: 'gastos', label: 'Gastos' },
            ]}
            height={250}
          />
        }
        code={`<AreaChartWidget
  data={[{ name: 'Ene', ventas: 400, gastos: 240 }, ...]}
  series={[
    { key: 'ventas', label: 'Ventas' },
    { key: 'gastos', label: 'Gastos' },
  ]}
  height={250}
/>`}
      />

      <ShowcaseSection
        title="BarChartWidget"
        description="Props: data, series, height, stacked, rounded, barSize. color omitido usa la paleta Duralux."
        preview={
          <BarChartWidget
            ariaLabel="Ventas y gastos por mes"
            data={MONTHLY_DATA}
            series={[
              { key: 'ventas', label: 'Ventas' },
              { key: 'gastos', label: 'Gastos' },
            ]}
            height={250}
          />
        }
        code={`<BarChartWidget
  data={data}
  series={[
    { key: 'ventas', label: 'Ventas' },
    { key: 'gastos', label: 'Gastos' },
  ]}
  height={250}
/>`}
      />

      <ShowcaseSection
        title="PieChartWidget"
        description="Props: data=[{name, value, color?}], donut, height, legend. Incluye alternativa tabular accesible."
        preview={
          <div className="row">
            <div className="col-6">
              <PieChartWidget ariaLabel="Fuentes de leads" data={PIE_DATA} donut={false} height={250} />
            </div>
            <div className="col-6">
              <PieChartWidget ariaLabel="Fuentes de leads en donut" data={PIE_DATA} donut height={250} />
            </div>
          </div>
        }
        code={`// Pie — color opcional, usa el fallback Duralux si se omite
<PieChartWidget ariaLabel="Fuentes de leads"
  data={[{ name: 'Facebook', value: 44 }, ...]} height={250} />

// Donut
<PieChartWidget data={data} donut height={250} />`}
      />
    </div>
  )
}
