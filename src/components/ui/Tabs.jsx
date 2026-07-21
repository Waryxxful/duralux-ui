import { useEffect, useId, useRef, useState } from 'react'

export function Tabs({
  tabs = [],
  className = '',
  tabClassName = '',
  activeKey,
  defaultActiveKey,
  onChange,
}) {
  const isControlled = activeKey !== undefined
  const [uncontrolledActiveKey, setUncontrolledActiveKey] = useState(
    () => defaultActiveKey ?? tabs[0]?.key,
  )
  const requestedActiveKey = isControlled ? activeKey : uncontrolledActiveKey
  const active = tabs.some((tab) => tab.key === requestedActiveKey)
    ? requestedActiveKey
    : tabs[0]?.key
  const idPrefix = useId()
  const tabRefs = useRef(new Map())

  useEffect(() => {
    if (!isControlled && tabs.length > 0 && uncontrolledActiveKey !== active) {
      setUncontrolledActiveKey(active)
    }
  }, [active, isControlled, tabs.length, uncontrolledActiveKey])

  const selectTab = (key) => {
    if (key === active) return
    if (!isControlled) setUncontrolledActiveKey(key)
    onChange?.(key)
  }

  const handleKeyDown = (event, index) => {
    let nextIndex

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % tabs.length
        break
      case 'ArrowLeft':
        nextIndex = (index - 1 + tabs.length) % tabs.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = tabs.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    const nextTab = tabs[nextIndex]
    tabRefs.current.get(nextTab.key)?.focus()
    selectTab(nextTab.key)
  }

  const getTabId = (key) => `${idPrefix}-tab-${encodeURIComponent(String(key))}`
  const getPanelId = (key) => `${idPrefix}-panel-${encodeURIComponent(String(key))}`

  return (
    <>
      <ul className={`nav nav-tabs ${className}`} role="tablist" aria-orientation="horizontal">
        {tabs.map((tab, index) => (
          <li key={tab.key} className={`nav-item ${tabClassName}`} role="presentation">
            <button
              ref={(node) => {
                if (node) tabRefs.current.set(tab.key, node)
                else tabRefs.current.delete(tab.key)
              }}
              id={getTabId(tab.key)}
              className={`nav-link${active === tab.key ? ' active' : ''}`}
              onClick={() => selectTab(tab.key)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              type="button"
              role="tab"
              aria-controls={getPanelId(tab.key)}
              aria-selected={active === tab.key}
              tabIndex={active === tab.key ? 0 : -1}
            >
              {tab.icon && <i className={`${tab.icon} me-2`} aria-hidden></i>}
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            id={getPanelId(tab.key)}
            className={`tab-pane fade${active === tab.key ? ' show active' : ''}`}
            role="tabpanel"
            aria-labelledby={getTabId(tab.key)}
            hidden={active !== tab.key}
          >
            {active === tab.key && tab.content}
          </div>
        ))}
      </div>
    </>
  )
}
