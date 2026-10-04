/**
 * Extras GranCRM sin equivalente en la plantilla Duralux: CardHeader/CardBody/CardFooter sueltos,
 * StatusBadge/StatusButton (contrato de clases de Badge) y StatCard (firma GranCRM sobre StatsCard).
 * Este archivo solo exporta componentes (fast refresh, DX-021): los tipos viven en
 * src/public/types.ts y la lógica sin JSX en ./granCrmExtras.model.ts.
 */
import { forwardRef } from 'react'
import type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  StatCardProps,
  StatusBadgeProps,
  StatusButtonProps,
} from '../../public/types'
import { cx } from '../../utils/cx'
import { isString } from '../../utils/typeGuards'
import { StatsCard } from '../ui/StatsCard'
import { statCardDelta, statCardIcon, statCardTone, statusBadgeClassName } from './granCrmExtras.model'

// ── CardHeader / CardBody / CardFooter ────────────────────────────────────────

/** Encabezado de card: `.card-header` con título (h2 visual h5) y acciones a la derecha. */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { title, actions, className, children, ...rest },
  ref,
) {
  const content = children ?? (
    <>
      {isString(title) ? <h2 className="h5 card-title mb-0">{title}</h2> : title}
      {actions && <div className="card-header-action">{actions}</div>}
    </>
  )
  return <div {...rest} ref={ref} className={cx('card-header', className)}>{content}</div>
})

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} className={cx('card-body', className)} />
})

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter({ className, ...rest }, ref) {
  return <div {...rest} ref={ref} className={cx('card-footer', className)} />
})

// ── StatusBadge / StatusButton ────────────────────────────────────────────────

/** Badge de estado (texto obligatorio vía `label` o hijos: el estado nunca va solo en color). */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge(
  { status, label, soft, className, children, ...rest },
  ref,
) {
  return (
    <span {...rest} ref={ref} className={statusBadgeClassName(status, soft, false, className)}>
      {label ?? children}
    </span>
  )
})

export const StatusButton = forwardRef<HTMLButtonElement, StatusButtonProps>(function StatusButton(
  { status, label, soft, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={statusBadgeClassName(status, soft, true, className)}
      style={{ cursor: 'pointer', ...rest.style }}
    >
      {label ?? children}
    </button>
  )
})

// ── StatCard ──────────────────────────────────────────────────────────────────

/**
 * StatCard — firma GranCRM (`title`, `variant`, `change`) sobre StatsCard, que es la fuente de verdad
 * del DOM. `change.value` es un porcentaje: se muestra con signo, `%` y flecha.
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { title, value, icon, variant = 'primary', change, footer, ...rest },
  ref,
) {
  return (
    <StatsCard
      {...rest}
      ref={ref}
      icon={statCardIcon(icon)}
      tone={statCardTone(variant)}
      value={value}
      label={title}
      delta={statCardDelta(change)}
      footer={footer}
    />
  )
})
