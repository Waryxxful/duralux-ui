/**
 * GranCRM-specific components with no Duralux template equivalent
 * (CardHeader/CardBody/CardFooter as standalone sub-parts).
 * StatusBadge/StatusButton/StatCard wrap the real Badge/card primitives —
 * see Badge.jsx and StatsCard.jsx for the Bootstrap-real versions.
 */
import React from 'react';
import type { SemanticVariant, StatusVariant } from '../../tokens';
import { Badge } from '../ui/Badge';

// ── CardHeader / CardBody / CardFooter (sub-components not in @duralux/ui) ────

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
}

export function CardHeader({ title, actions, className, children, ...rest }: CardHeaderProps) {
  const content = children ?? (
    <>
      {typeof title === 'string' ? <h5 className="gcu-card__title">{title}</h5> : title}
      {actions && <div className="gcu-card__actions">{actions}</div>}
    </>
  );
  return (
    <div className={['gcu-card__header', className].filter(Boolean).join(' ')} {...rest}>
      {content}
    </div>
  );
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className, children, ...rest }: CardBodyProps) {
  return (
    <div className={['gcu-card__body', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div className={['gcu-card__footer', className].filter(Boolean).join(' ')} {...rest}>
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
  const changePositive = change && change.value >= 0;
  const changeIcon = changePositive ? 'arrow-up' : 'arrow-down';

  return (
    <div className={['card stretch stretch-full', className].filter(Boolean).join(' ')} {...rest}>
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <p className="fs-12 text-muted mb-0">{title}</p>
          {icon && (
            <div className={`avatar-text avatar-sm bg-soft-${variant} text-${variant}`}>
              <i className={`feather-${icon}`} aria-hidden="true" />
            </div>
          )}
        </div>
        <h4 className="fs-4 fw-bold text-dark mb-0">{value}</h4>
        {change && (
          <Badge variant={changePositive ? 'success' : 'danger'} soft className="mt-2">
            <i className={`feather-${changeIcon} fs-10 me-1`} aria-hidden="true" />
            {Math.abs(change.value)}%{change.label ? ` ${change.label}` : ''}
          </Badge>
        )}
      </div>
      {footer && <div className="card-footer fs-11 fw-bold text-uppercase text-center">{footer}</div>}
    </div>
  );
}
