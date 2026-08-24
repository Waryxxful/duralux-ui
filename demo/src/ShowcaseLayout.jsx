import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../../src/theme/ThemeProvider'

const NAV = [
  { label: 'Introducción', to: '/' },
  { type: 'caption', label: 'UI Base' },
  { label: 'Button', to: '/buttons' },
  { label: 'Card', to: '/cards' },
  { label: 'Badge', to: '/badges' },
  { label: 'Modal', to: '/modals' },
  { label: 'Tabs', to: '/tabs' },
  { label: 'Avatar', to: '/avatars' },
  { label: 'Alert', to: '/alerts' },
  { label: 'Timeline', to: '/timeline' },
  { label: 'ProgressRing', to: '/progress' },
  { label: 'ConnectionCard', to: '/connection-card' },
  { label: 'ActivityFeed', to: '/activity-feed' },
  { type: 'caption', label: 'Feedback' },
  { label: 'EmptyState / ErrorState / Toast', to: '/feedback' },
  { type: 'caption', label: 'Data' },
  { label: 'StatsCard', to: '/stats-cards' },
  { label: 'DataTable', to: '/datatable' },
  { type: 'caption', label: 'Charts' },
  { label: 'ApexChart', to: '/charts' },
  { label: 'Recharts Widgets', to: '/recharts' },
  { type: 'caption', label: 'Forms' },
  { label: 'Input / Select / Textarea', to: '/forms' },
  { type: 'caption', label: 'Chat' },
  { label: 'Chat Components', to: '/chat' },
  { type: 'caption', label: 'Layout' },
  { label: 'AppLayout / Sidebar', to: '/layout' },
]

export function ShowcaseLayout() {
  const { dark, toggleDark } = useTheme()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="showcase-layout">
      <aside className="showcase-sidebar">
        <div className="showcase-sidebar__header">
          <div className="showcase-brand">@duralux/ui</div>
          <button
            type="button"
            className="showcase-nav-toggle"
            aria-expanded={navOpen}
            aria-controls="showcase-navigation"
            onClick={() => setNavOpen(open => !open)}
          >
            {navOpen ? 'Cerrar navegación' : 'Abrir navegación'}
          </button>
        </div>
        <button
          type="button"
          className="showcase-theme-toggle"
          aria-pressed={dark}
          onClick={toggleDark}
        >
          {dark ? 'Usar tema claro' : 'Usar tema oscuro'}
        </button>
        <nav id="showcase-navigation" className={`showcase-navigation${navOpen ? ' showcase-navigation--open' : ''}`} aria-label="Componentes">
          {NAV.map((item) => {
            const itemKey = item.to ?? `caption-${item.label}`
            return item.type === 'caption'
              ? <div key={itemKey} className="showcase-caption">{item.label}</div>
              : <NavLink
                  key={itemKey}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setNavOpen(false)}
                  className={({ isActive }) => `showcase-link${isActive ? ' showcase-link--active' : ''}`}
                >{item.label}</NavLink>
          })}
        </nav>
      </aside>
      <main className="showcase-main">
        <Outlet />
      </main>
    </div>
  )
}
