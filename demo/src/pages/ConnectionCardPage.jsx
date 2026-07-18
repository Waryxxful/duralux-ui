import { useState } from 'react'
import { ConnectionCard, Icon } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

function DemoIcon({ name }) {
  return (
    <div className="d-flex align-items-center justify-content-center wd-40 ht-40 rounded-circle bg-soft-primary text-primary">
      <Icon name={name} />
    </div>
  )
}

export function ConnectionCardPage() {
  const [google, setGoogle] = useState(true)
  const [slack, setSlack] = useState(false)

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>ConnectionCard</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>
        Props: <code>icon, title, description, checked, onChange, disabled, className</code>
      </p>

      <ShowcaseSection
        title="Tarjetas de integración"
        description="Markup 1:1 de customers-view.html (#connectionTab .development-connections)."
        preview={
          <div>
            <ConnectionCard
              icon={<DemoIcon name="database" />}
              title="Google Drive: almacenamiento y compartición"
              description="Búsqueda y colaboración integradas para tu equipo."
              checked={google}
              onChange={setGoogle}
            />
            <ConnectionCard
              icon={<DemoIcon name="message-square" />}
              title="Slack: notificaciones del equipo"
              description="Recibí alertas de nuevos leads directo en el canal."
              checked={slack}
              onChange={setSlack}
            />
            <ConnectionCard
              icon={<DemoIcon name="shield" />}
              title="Integración deshabilitada"
              description="Este conector está bloqueado por política de la cuenta."
              checked={false}
              onChange={() => {}}
              disabled
            />
          </div>
        }
        code={`<ConnectionCard
  icon={<Icon name="database" />}
  title="Google Drive: almacenamiento y compartición"
  description="Búsqueda y colaboración integradas para tu equipo."
  checked={checked}
  onChange={setChecked}
/>`}
      />
    </div>
  )
}
