import { Dropdown, DropdownMenu } from '../ui/Dropdown'

/**
 * ChartCard — card wrapper para gráficos con header de acciones estilo Duralux.
 *
 * Props:
 *   title      — título del card
 *   subtitle   — subtítulo o período
 *   actions    — [{ label, onClick }] para el dropdown
 *   children   — el gráfico
 *   noPad      — p-0 en el body (para gráficos flush)
 */
export function ChartCard({ title, subtitle, actions = [], noPad, children }) {
  return (
    <div className="card stretch stretch-full">
      <div className="card-header d-flex align-items-center justify-content-between">
        <div>
          <h5 className="card-title mb-0">{title}</h5>
          {subtitle && <p className="fs-12 text-muted mb-0 mt-1">{subtitle}</p>}
        </div>
        {actions.length > 0 && (
          <Dropdown
            align="end"
            trigger={(triggerProps, { open }) => (
              <button
                {...triggerProps}
                className={`avatar-text avatar-sm bg-transparent border-0 text-muted${open ? ' show' : ''}`}
                aria-label={typeof title === 'string' ? `Acciones de ${title}` : 'Acciones del gráfico'}
              >
                <i className="feather-more-vertical"></i>
              </button>
            )}
          >
            <DropdownMenu as="ul">
              {actions.map((a, i) => (
                <li key={i}>
                  <button type="button" className="dropdown-item" onClick={a.onClick}>
                    {a.label}
                  </button>
                </li>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
      <div className={`card-body${noPad ? ' p-0' : ''}`}>
        {children}
      </div>
    </div>
  )
}
