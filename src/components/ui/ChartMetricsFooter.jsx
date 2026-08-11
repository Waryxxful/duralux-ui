/**
 * ChartMetricsFooter — fila de 2-4 métricas bajo un chart (patrón
 * TimeSpentChart/PaymentRecordChartTwo de Duralux v2: "Billable Hours 120h / Unbillable Hours 40h").
 *
 * Props:
 *   metrics — [{ id?, label, value, color? }] (color: clase de texto Bootstrap, ej. "text-primary")
 */
function metricIdentity(metric) {
  const candidate = metric?.id ?? metric?.label ?? metric?.value
  return typeof candidate === 'string' || typeof candidate === 'number'
    ? `${typeof candidate}:${String(candidate)}`
    : 'metric'
}

function metricEntries(metrics) {
  const occurrences = new Map()
  return (Array.isArray(metrics) ? metrics : []).map((metric, position) => {
    const identity = metricIdentity(metric)
    const occurrence = (occurrences.get(identity) ?? 0) + 1
    occurrences.set(identity, occurrence)
    return { metric, position, key: `${identity}~${occurrence}` }
  })
}

export function ChartMetricsFooter({ metrics = [] }) {
  return (
    <div className="d-flex flex-wrap border-top pt-3 mt-1">
      {metricEntries(metrics).map(({ metric, position, key }) => (
        <div
          key={key}
          className={`flex-fill text-center px-2${position > 0 ? ' border-start' : ''}`}
        >
          <div className={`fs-5 fw-bolder ${metric.color || 'text-dark'}`}>{metric.value}</div>
          <p className="fs-12 text-muted mb-0">{metric.label}</p>
        </div>
      ))}
    </div>
  )
}
