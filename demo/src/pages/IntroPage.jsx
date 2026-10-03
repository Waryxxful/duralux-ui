export function IntroPage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>@duralux/ui</h1>
      <p style={{ color: 'var(--gcu-muted)', marginBottom: 32, fontSize: 15 }}>
        Librería de componentes React para proyectos con Bootstrap 5 + Duralux CSS.<br />
        31 componentes listos para usar — UI, Forms, Charts, Chat y Layout.
      </p>
      <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '20px 24px', borderRadius: 10, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8, marginBottom: 32 }}>
        <div style={{ color: '#94a3b8' }}># Instalación desde GitHub</div>
        <div>npm install github:tu-usuario/duralux-ui</div>
        <br />
        <div style={{ color: '#94a3b8' }}># Uso</div>
        <div><span style={{ color: '#38bdf8' }}>import</span> {`{ Button, Card, StatsCard, DataTable }`} <span style={{ color: '#38bdf8' }}>from</span> <span style={{ color: '#86efac' }}>'@duralux/ui'</span></div>
      </div>
      <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10, padding: '14px 18px', marginBottom: 32, fontSize: 13 }}>
        ⚠️ <strong>Requisito del host:</strong> El proyecto que usa esta librería debe cargar Bootstrap 5 + Duralux CSS. Los componentes no incluyen CSS propio.
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Componentes disponibles</h2>
      {[
        { cat: 'UI Base', items: 'Button · Badge · Card · Modal · Tabs · Alert · Avatar · AvatarGroup · Timeline · ProgressRing · StatsCard · MiniStatCard · ColoredStatCard' },
        { cat: 'Forms', items: 'Input · Select · SearchableSelect · MultiSelect · Textarea · FormField · InputGroup' },
        { cat: 'Data', items: 'DataTable · DataTableToolbar · Table · Pagination' },
        { cat: 'Charts (ApexCharts)', items: 'ApexChart · ChartCard (subpath /charts/apex)' },
        { cat: 'Charts (Recharts)', items: 'AreaChartWidget · BarChartWidget · LineChartWidget · PieChartWidget (subpath /charts/recharts)' },
        { cat: 'Chat', items: 'ChatSidebar · ChatBubble · ChatTypingIndicator · ChatInputBar · ChatWindow' },
        { cat: 'Layout', items: 'AppLayout · AuthLayout · Sidebar · Header · PageHeader · Footer' },
      ].map(({ cat, items }) => (
        <div key={cat} style={{ marginBottom: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gcu-primary-text)' }}>{cat}</span>
          <span style={{ color: 'var(--gcu-muted)', fontSize: 13 }}> — {items}</span>
        </div>
      ))}
    </div>
  )
}
