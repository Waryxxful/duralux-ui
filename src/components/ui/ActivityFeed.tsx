import React from 'react';

/**
 * ActivityFeed — feed de log/eventos con riel de color por tipo de evento.
 *
 * Estructura basada en duralux-admin/widgets-lists.html:
 *   ul.list-unstyled.mb-0.activity-feed-1 > li.feed-item.feed-item-{variant}
 * El riel de color es CSS puro (::before/::after) — ya está compilado en
 * scss/themes/widgets/_widgets-lists.scss y se mantiene con la adaptación
 * GranCRM del theme.
 */
export type ActivityFeedVariant = 'primary' | 'success' | 'danger' | 'warning' | 'info';

export interface ActivityFeedItem {
  key: string | number;
  variant: ActivityFeedVariant;
  title: React.ReactNode;
  description?: React.ReactNode;
  time?: React.ReactNode;
  /** Slot final (badges, acciones, avatares agrupados, etc.) */
  extra?: React.ReactNode;
}

export interface ActivityFeedProps {
  items: ActivityFeedItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <ul className={['list-unstyled mb-0 activity-feed-1', className].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <li key={item.key} className={`feed-item feed-item-${item.variant}`}>
          <div className="d-flex gap-4 justify-content-between">
            <div>
              <div className="mb-2 text-truncate-1-line">
                <span className="fw-semibold text-dark">{item.title}</span>
              </div>
              {item.description != null && (
                <p className="fs-12 text-muted mb-2 text-truncate-2-line">{item.description}</p>
              )}
              {item.extra}
            </div>
            {item.time != null && (
              <div className="fs-10 fw-medium text-uppercase text-muted text-nowrap">{item.time}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
