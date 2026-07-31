/**
 * ChartMetricsFooter — fila de 2-4 métricas bajo un chart (patrón
 * TimeSpentChart/PaymentRecordChartTwo de Duralux v2: "Billable Hours 120h / Unbillable Hours 40h").
 *
 * Props:
 *   metrics — [{ label, value, color? }] (color: clase de texto Bootstrap, ej. "text-primary")
 */
export function ChartMetricsFooter({ metrics = [] }) {
  return (
    <div className="d-flex flex-wrap border-top pt-3 mt-1">
      {metrics.map((m, i) => (
        <div
          key={i}
          className={`flex-fill text-center px-2${i > 0 ? ' border-start' : ''}`}
        >
          <div className={`fs-5 fw-bolder ${m.color || 'text-dark'}`}>{m.value}</div>
          <p className="fs-12 text-muted mb-0">{m.label}</p>
        </div>
      ))}
    </div>
  )
}
