import { ProgressRing } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function ProgressPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>ProgressRing</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>value (0-100), size, stroke, color, label</code></p>

      <ShowcaseSection
        title="Anillos de progreso"
        preview={
          <div className="d-flex gap-4 flex-wrap align-items-center">
            <ProgressRing value={25} color="#ef4444" label="25%" />
            <ProgressRing value={50} color="#f59e0b" label="50%" />
            <ProgressRing value={75} color="#3454d1" label="75%" />
            <ProgressRing value={100} color="#22c55e" label="100%" />
          </div>
        }
        code={`<ProgressRing value={75} color="#3454d1" label="75%" />
<ProgressRing value={100} color="#22c55e" label="Completado" />`}
      />

      <ShowcaseSection
        title="Tamaños"
        preview={
          <div className="d-flex gap-4 flex-wrap align-items-center">
            <ProgressRing value={60} color="#3454d1" label="60%" size={50} stroke={5} />
            <ProgressRing value={60} color="#3454d1" label="60%" size={80} stroke={8} />
            <ProgressRing value={60} color="#3454d1" label="60%" size={120} stroke={12} />
          </div>
        }
        code={`<ProgressRing value={60} size={50} stroke={5} color="#3454d1" label="60%" />
<ProgressRing value={60} size={120} stroke={12} color="#3454d1" label="60%" />`}
      />
    </div>
  )
}
