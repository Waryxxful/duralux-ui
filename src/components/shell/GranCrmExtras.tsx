/**
 * GranCRM-only components not present in @duralux/ui.
 * Kept locally; re-exported from ui/index.ts alongside the @duralux/ui re-exports.
 */
import React from 'react';
import type { SemanticVariant, StatusVariant } from '../../tokens';

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
  const text = label ?? children;
  const cls = ['gcu-badge', `gcu-badge--${status}`, soft ? 'gcu-badge--soft' : '', className]
    .filter(Boolean)
    .join(' ');
  return <span className={cls} {...rest}>{text}</span>;
}

export interface StatusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: StatusVariant;
  label?: string;
  soft?: boolean;
}

export function StatusButton({ status, label, soft, className, children, type = 'button', ...rest }: StatusButtonProps) {
  const text = label ?? children;
  const cls = [
    'gcu-badge gcu-status-button',
    `gcu-badge--${status}`,
    soft ? 'gcu-badge--soft' : '',
    className,
  ].filter(Boolean).join(' ');

  return <button type={type} className={cls} {...rest}>{text}</button>;
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
  const changeIcon = changePositive ? 'trending-up' : 'trending-down';
  const changeColor = changePositive ? 'gcu-stat-card__change--positive' : 'gcu-stat-card__change--negative';

  return (
    <div className={['gcu-card gcu-stat-card', className].filter(Boolean).join(' ')} {...rest}>
      <div className="gcu-card__body">
        <div className="gcu-stat-card__header">
          <p className="gcu-stat-card__label">{title}</p>
          {icon && (
            <div className={`gcu-stat-card__icon gcu-stat-card__icon--${variant}`}>
              <i className={`gcu-icon feather-${icon}`} aria-hidden="true" />
            </div>
          )}
        </div>
        <h4 className="gcu-stat-card__value">{value}</h4>
        {change && (
          <p className={`gcu-stat-card__change ${changeColor}`}>
            <i className={`gcu-icon feather-${changeIcon}`} aria-hidden="true" />
            {Math.abs(change.value)}%{change.label ? ` ${change.label}` : ''}
          </p>
        )}
        {footer && <div className="gcu-stat-card__footer">{footer}</div>}
      </div>
    </div>
  );
}
