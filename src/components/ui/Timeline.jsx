/**
 * Timeline — línea de tiempo de actividad estilo Duralux.
 *
 * Props:
 *   items — [{
 *     id, title, description, time,
 *     icon, iconBg,
 *     user: { name, avatar }
 *   }]
 */
export function Timeline({ items = [] }) {
  return (
    <ul className="list-unstyled mb-0">
      {items.map((item, i) => (
        <li key={item.id || i} className={`d-flex gap-3${i < items.length - 1 ? ' mb-4' : ''}`}>
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className={`avatar-text avatar-sm rounded-circle ${item.iconBg || 'bg-soft-primary'} text-${item.color || 'primary'}`}>
              <i className={item.icon || 'feather-activity'}></i>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-start justify-content-between">
              <div>
                <p className="fw-semibold fs-13 mb-0">{item.title}</p>
                {item.description && (
                  <p className="fs-12 text-muted mb-1">{item.description}</p>
                )}
                {item.user && (
                  <div className="d-flex align-items-center gap-2 mt-1">
                    {item.user.avatar && (
                      <div className="avatar-image avatar-xs">
                        <img src={item.user.avatar} alt="" className="img-fluid rounded-circle" />
                      </div>
                    )}
                    <span className="fs-11 text-muted">{item.user.name}</span>
                  </div>
                )}
              </div>
              <span className="fs-11 text-muted flex-shrink-0 ms-3">{item.time}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
