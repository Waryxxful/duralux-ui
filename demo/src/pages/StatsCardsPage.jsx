import { StatsCard, MiniStatCard, ColoredStatCard, StatCard, StatusBadge, StatusButton } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function StatsCardsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Stats Cards</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>StatsCard · MiniStatCard · ColoredStatCard · StatCard · StatusBadge · StatusButton</p>

      <ShowcaseSection
        title="StatsCard"
        description="Props: icon, iconBg, value, label, trend ({value, up}), progress, footer"
        preview={
          <div className="row g-3">
            <div className="col-md-6">
              <StatsCard icon="feather-users" value="26,595" label="Total Clientes" trend={{ value: '+36.85%', up: true }} />
            </div>
            <div className="col-md-6">
              <StatsCard icon="feather-dollar-sign" value="$48,250" label="Ingresos" trend={{ value: '-5.2%', up: false }} />
            </div>
            <div className="col-md-6">
              <StatsCard icon="feather-briefcase" value="385" label="Proyectos" trend={{ value: '+12.4%', up: true }} progress={{ value: 65, color: 'primary', label: '65% completado' }} />
            </div>
            <div className="col-md-6">
              <StatsCard icon="feather-check-circle" value="245" label="Completados" trend={{ value: '+22.1%', up: true }} />
            </div>
          </div>
        }
        code={`<StatsCard
  icon="feather-users"
  value="26,595"
  label="Total Clientes"
  trend={{ value: '+36.85%', up: true }}
/>

// Con barra de progreso
<StatsCard
  icon="feather-briefcase"
  value="385"
  label="Proyectos"
  trend={{ value: '+12.4%', up: true }}
  progress={{ value: 65, color: 'primary', label: '65% completado' }}
/>`}
      />

      <ShowcaseSection
        title="MiniStatCard"
        description="Props: icon, value, label, color"
        preview={
          <div className="row g-3">
            {[
              { color: 'primary', icon: 'feather-users', value: '1,254', label: 'Nuevos Leads' },
              { color: 'success', icon: 'feather-dollar-sign', value: '$8,420', label: 'Pagos' },
              { color: 'warning', icon: 'feather-clock', value: '18', label: 'En Riesgo' },
              { color: 'danger', icon: 'feather-alert-circle', value: '5', label: 'Urgentes' },
            ].map(p => (
              <div key={p.color} className="col-6">
                <MiniStatCard {...p} />
              </div>
            ))}
          </div>
        }
        code={`<MiniStatCard icon="feather-users" value="1,254" label="Nuevos Leads" color="primary" />
<MiniStatCard icon="feather-dollar-sign" value="$8,420" label="Pagos" color="success" />`}
      />

      <ShowcaseSection
        title="ColoredStatCard"
        description="Props: icon, value, label, trend, trendUp, bg, chart"
        preview={
          <div className="row g-3">
            <div className="col-md-4">
              <ColoredStatCard icon="feather-users" value="26,595" label="Clientes" trend="+36.85%" trendUp bg="bg-primary" />
            </div>
            <div className="col-md-4">
              <ColoredStatCard icon="feather-dollar-sign" value="$48,250" label="Ingresos" trend="+18.5%" trendUp bg="bg-success" />
            </div>
            <div className="col-md-4">
              <ColoredStatCard icon="feather-alert-circle" value="18" label="En Riesgo" trend="-3.2%" bg="bg-danger" />
            </div>
          </div>
        }
        code={`<ColoredStatCard
  icon="feather-users"
  value="26,595"
  label="Clientes"
  trend="+36.85%"
  trendUp
  bg="bg-primary"
/>`}
      />

      <ShowcaseSection
        title="StatCard / StatusBadge / StatusButton (GranCRM)"
        description="Props: title, value, icon, variant, change ({value, label}), footer / status, label, soft"
        preview={
          <div className="row g-3">
            <div className="col-md-6">
              <StatCard
                title="Tickets abiertos"
                value="128"
                icon="alert-circle"
                variant="warning"
                change={{ value: 12, label: 'vs. semana pasada' }}
                footer="Ver todos"
              />
            </div>
            <div className="col-md-6 d-flex align-items-center gap-2 flex-wrap">
              <StatusBadge status="success" label="Activo" />
              <StatusBadge status="danger" label="Vencido" soft />
              <StatusButton status="info" label="Reintentar" onClick={() => {}} />
            </div>
          </div>
        }
        code={`<StatCard title="Tickets abiertos" value="128" icon="alert-circle" variant="warning"
  change={{ value: 12, label: 'vs. semana pasada' }} footer="Ver todos" />

<StatusBadge status="success" label="Activo" />
<StatusButton status="info" label="Reintentar" onClick={handleRetry} />`}
      />
    </div>
  )
}
