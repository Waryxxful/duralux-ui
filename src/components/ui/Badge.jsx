/**
 * Badge — badge de estado con variantes de color.
 *
 * Props:
 *   variant — "success" | "warning" | "danger" | "primary" | "info" | "secondary" (default "primary")
 *   soft    — usar variante suave (bg-success-100 text-success)
 *   pill    — rounded-pill shape
 */
export function Badge({ variant = 'primary', soft, pill, children }) {
  const base = soft
    ? `bg-${variant}-100 text-${variant}`
    : `bg-${variant}`

  return (
    <span className={`badge ${base}${pill ? ' rounded-pill' : ''}`}>
      {children}
    </span>
  )
}
