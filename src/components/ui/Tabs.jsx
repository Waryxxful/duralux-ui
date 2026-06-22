import { useState } from 'react'

export function Tabs({ tabs = [], className = '', tabClassName = '' }) {
  const [active, setActive] = useState(tabs[0]?.key)

  return (
    <>
      <ul className={`nav nav-tabs ${className}`} role="tablist">
        {tabs.map((tab) => (
          <li key={tab.key} className={`nav-item ${tabClassName}`} role="presentation">
            <button
              className={`nav-link${active === tab.key ? ' active' : ''}`}
              onClick={() => setActive(tab.key)}
              type="button"
              role="tab"
            >
              {tab.icon && <i className={`${tab.icon} me-2`}></i>}
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`tab-pane fade${active === tab.key ? ' show active' : ''}`}
            role="tabpanel"
          >
            {active === tab.key && tab.content}
          </div>
        ))}
      </div>
    </>
  )
}
