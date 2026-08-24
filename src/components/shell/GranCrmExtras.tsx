/**
 * GranCRM-specific components with no Duralux template equivalent
 * (CardHeader/CardBody/CardFooter as standalone sub-parts).
 * StatusBadge/StatusButton/StatCard wrap the real Badge/card primitives —
 * see Badge.jsx and StatsCard.jsx for the Bootstrap-real versions.
 */
import React from 'react';
import type { SemanticVariant, StatusVariant } from '../../tokens';
import { Badge } from '../ui/Badge';
import { StatsCard as RuntimeStatsCard } from '../ui/StatsCard';
import { isString } from '../../utils/typeGuards';

// ── CardHeader / CardBody / CardFooter (sub-components not in @duralux/ui) ────

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
}

export function CardHeader({ title, actions, className, children, ...rest }: CardHeaderProps) {
  // Duralux-first: .card-header / .card-title / .card-header-action (not legacy gcu-card__*).
  const content = children ?? (
    <>
      {isString(title) ? <h2 className="h5 card-title mb-0">{title}</h2> : title}
      {actions && <div className="card-header-action">{actions}</div>}
    </>
  );
  return (
    <div className={['card-header', className].filter(Boolean).join(' ')} {...rest}>
      {content}
    </div>
  );
}

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export function CardBody({ className, children, ...rest }: CardBodyProps) {
  return (
    <div className={['card-body', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div className={['card-footer', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

// ── StatusBadge / StatusButton ────────────────────────────────────────────────

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusVariant;
  label?: string;
  soft?: boolean;
}

export function StatusBadge({ status, label, soft, className, children, ...rest }: StatusBadgeProps) {
  return (
    <Badge variant={status} soft={soft} className={className} {...rest}>
      {label ?? children}
    </Badge>
  );
}

export interface StatusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: StatusVariant;
  label?: string;
  soft?: boolean;
}

export function StatusButton({ status, label, soft, className, children, type = 'button', ...rest }: StatusButtonProps) {
  return (
    <Badge as="button" type={type} variant={status} soft={soft} className={className} {...rest}>
      {label ?? children}
    </Badge>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  value: React.ReactNode;
  icon?: string;
  variant?: Exclude<SemanticVariant, 'link'>;
  change?: { value: number; label?: string };
  footer?: React.ReactNode;
}

/**
 * Compatibility adapter for the older GranCRM signature.
 *
 * StatsCard.jsx is the runtime source of truth. Its current signature does
 * not accept the legacy `className`/HTML passthrough or GranCRM's `change`,
 * so this adapter maps those props and clones only the runtime root to retain
 * the old attributes without reimplementing a second card DOM.
 */
export function StatCard({
  title,
  value,
  icon,
  variant = 'primary',
  change,
  footer,
  className,
  ...rest
}: StatCardProps) {
  const trend = change
    ? {
      value: `${change.value}%${change.label ? ` ${change.label}` : ''}`,
      up: change.value >= 0,
    }
    : undefined;
  const runtimeCard = RuntimeStatsCard({
    icon: icon ? (icon.startsWith('feather-') ? icon : `feather-${icon}`) : undefined,
    iconBg: `bg-soft-${variant} text-${variant}`,
    value,
    label: title,
    trend,
    footer,
  });

  return React.cloneElement(runtimeCard, {
    className: [runtimeCard.props.className, className].filter(Boolean).join(' '),
    ...rest,
  });
}
