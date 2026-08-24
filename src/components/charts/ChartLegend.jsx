import { isArray } from '../../utils/typeGuards'

/** Keeps chart series color on a mark, never on the readable label text. */
export function ChartLegend({ payload, theme }) {
  const entries = isArray(payload) ? payload : []
  if (entries.length === 0) return null

  return (
    <ul className="d-flex flex-wrap justify-content-center gap-3 list-unstyled mb-0 pt-2" style={{ fontSize: 11 }}>
      {entries.map((entry, index) => (
        <li key={`${entry.dataKey ?? entry.value ?? 'series'}-${index}`} className="d-inline-flex align-items-center gap-1" style={{ color: theme.text }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flex: 'none' }} />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}
