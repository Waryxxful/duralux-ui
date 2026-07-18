import React, { useId } from 'react';

/**
 * ConnectionCard — tarjeta de integración con switch on/off.
 *
 * Markup 1:1 de duralux-admin/customers-view.html, tab #connectionTab,
 * sección .development-connections (~línea 3617): hstack + wd-40 + switch.
 *
 * Nota de fidelidad: la plantilla original marca el <label> del switch con la
 * clase `fw-500`, que no existe en ningún SCSS de la plantilla (ni fuente ni
 * compilado) — el label ahí es visualmente vacío, así que la clase no hace
 * nada. Se omite acá en vez de inventar una regla `.fw-500` que no es canon.
 */
export interface ConnectionCardProps {
  /** Logo/ícono de la integración (ej. <Icon/> o <img>) */
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function ConnectionCard({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled,
  className,
}: ConnectionCardProps) {
  const titleId = useId();
  const switchId = useId();

  return (
    <div
      className={[
        'hstack justify-content-between p-4 mb-3 border border-dashed border-gray-3 rounded-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="hstack me-4">
        <div className="wd-40">{icon}</div>
        <div className="ms-4">
          <div id={titleId} className="fw-bold mb-1 text-truncate-1-line">
            {title}
          </div>
          {description != null && (
            <div className="fs-12 text-muted text-truncate-1-line">{description}</div>
          )}
        </div>
      </div>
      <div className="form-check form-switch form-switch-sm">
        <label className="form-check-label c-pointer" htmlFor={switchId} />
        <input
          className="form-check-input c-pointer"
          type="checkbox"
          id={switchId}
          checked={checked}
          disabled={disabled}
          aria-labelledby={titleId}
          onChange={(event) => onChange(event.target.checked)}
        />
      </div>
    </div>
  );
}
