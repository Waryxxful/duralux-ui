import { NavLink, Outlet } from 'react-router-dom'

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
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '24px 0', overflowY: 'auto', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '0 20px 24px', fontWeight: 800, fontSize: 16, color: '#3454d1' }}>
          @duralux/ui
        </div>
        {NAV.map((item, i) =>
          item.type === 'caption'
            ? <div key={i} style={{ padding: '12px 20px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>{item.label}</div>
            : <NavLink key={i} to={item.to} end={item.to === '/'}
                style={({ isActive }) => ({
                  display: 'block', padding: '6px 20px', fontSize: 13, fontWeight: 500,
                  color: isActive ? '#3454d1' : '#475569',
                  background: isActive ? '#eff4ff' : 'transparent',
                  textDecoration: 'none', borderLeft: isActive ? '3px solid #3454d1' : '3px solid transparent',
                })}
              >{item.label}</NavLink>
        )}
      </aside>
      <main style={{ flex: 1, padding: '40px', maxWidth: 900, overflowX: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
