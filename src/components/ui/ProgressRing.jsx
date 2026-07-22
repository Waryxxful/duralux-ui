/**
 * ProgressRing — anillo de progreso SVG circular.
 *
 * Props:
 *   value   — 0-100
 *   size    — diámetro en px (default 80)
 *   stroke  — grosor del trazo (default 8)
 *   color   — color del progreso (default $primary)
 *   label   — texto central (default muestra el porcentaje)
 */
export function ProgressRing({ value = 0, size = 80, stroke = 8, color = '#3454d1', label }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="position-relative d-inline-flex align-items-center justify-content-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--gcu-border, #eff0f6)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span
        className="position-absolute fw-bold"
        style={{ fontSize: size * 0.22, color }}
      >
        {label ?? `${Math.round(value)}%`}
      </span>
    </div>
  )
}
