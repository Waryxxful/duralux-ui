import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  IconBolt, IconBrain, IconChartBar, IconHeadset, IconMessageChatbot, IconRobot, IconRoute, IconSparkles,
} from '@tabler/icons-react'
import { designTokens } from '../../src/tokens'
import { Icon } from '../../src/components/ui/Icon'
import { ContrastBadge, Page, Section, Token } from './parts'
import { contrast } from './contrast'

type ThemeName = keyof typeof designTokens.themes

const meta: Meta = {
  title: 'Fundamentos',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

const themeOf = (value: string): ThemeName => (value === 'dark' || value === 'navy' ? value : 'light')

const SEMANTIC_ROWS: { key: string; use: string; text?: boolean; min?: number }[] = [
  { key: 'text', use: 'Texto principal', text: true },
  { key: 'muted', use: 'Texto secundario, ayudas, metadatos', text: true },
  { key: 'text-subtle', use: 'Placeholders e información no esencial', text: true, min: 3 },
  { key: 'primary-text', use: 'Enlaces y acentos de texto', text: true },
  { key: 'code', use: 'Código en línea', text: true },
  { key: 'surface', use: 'Cards, modales, paneles' },
  { key: 'surface-subtle', use: 'Lienzo de la página' },
  { key: 'surface-raised', use: 'Elementos elevados sobre una superficie' },
  { key: 'surface-sunken', use: 'Pozos: inputs de búsqueda, tracks, código' },
  { key: 'border', use: 'Divisores y bordes de superficie' },
  { key: 'border-strong', use: 'Bordes de controles' },
]

export const Color: Story = {
  render: (_args, { globals }) => {
    const theme = themeOf(String(globals.theme ?? 'light'))
    const colors: Readonly<Partial<Record<string, string>>> = designTokens.themes[theme].colors
    const color = (key: string) => colors[key] ?? ''
    return (
      <Page title="Color" lead="Paletas OKLCH ancladas en los colores de marca (paso 500) y roles semánticos por tema. Los componentes usan solo roles semánticos: nunca un hex.">
        <Section title="Roles semánticos" description={`Valores del tema activo (${theme}). El contraste de los roles de texto se mide sobre la superficie; el gate tokens:check exige AA en los tres temas.`}>
          <div className="sb-panel">
            <table className="sb-table">
              <thead><tr><th>Muestra</th><th>Token</th><th>Uso</th><th>Valor</th><th>Contraste</th></tr></thead>
              <tbody>
                {SEMANTIC_ROWS.map(row => (
                  <tr key={row.key}>
                    <td><span className="sb-swatch" style={{ background: `var(--gcu-${row.key})` }} /></td>
                    <td><Token name={`--gcu-${row.key}`} /></td>
                    <td>{row.use}</td>
                    <td><Token name={color(row.key)} /></td>
                    <td>{row.text ? <ContrastBadge ratio={contrast(color(row.key), color('surface'))} min={row.min} /> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Tonos de estado" description="Cada tono tiene relleno sólido, versión suave, borde y texto. El texto del tono siempre cumple AA sobre su versión suave.">
          <div className="sb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {['primary', 'success', 'warning', 'danger', 'info', 'teal', 'indigo', 'secondary'].map(tone => (
              <div key={tone} className="sb-panel" style={{ padding: 16 }}>
                <div className="sb-row" style={{ marginBottom: 12 }}>
                  <span className="sb-swatch" style={{ background: `var(--gcu-${tone})` }} />
                  <span className="sb-swatch" style={{ background: `var(--gcu-${tone}-soft)` }} />
                  <span className="sb-swatch" style={{ background: `var(--gcu-${tone}-border)` }} />
                </div>
                <span className="badge" style={{ background: `var(--gcu-${tone}-soft)`, color: `var(--gcu-${tone}-text)`, border: `1px solid var(--gcu-${tone}-border)` }}>{tone}</span>
                <div style={{ marginTop: 8 }}>
                  <ContrastBadge ratio={contrast(color(`status-${tone}`), color(`${tone}-soft`))} />
                </div>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Paletas" description="Escalas 50–950. Útiles para ilustraciones y gráficos; en componentes, preferir roles semánticos.">
          <div className="sb-panel">
            {Object.entries(designTokens.palette).map(([hue, steps]) => (
              <div key={hue} className="sb-ramp">
                <span className="sb-ramp__name">{hue}</span>
                {Object.entries(steps).map(([step, value]) => (
                  <div key={step} title={`--gcu-${hue}-${step} ${value}`}>
                    <div className="sb-ramp__step" style={{ background: value }} />
                    <div className="sb-ramp__label">{step}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>
      </Page>
    )
  },
}

const lineHeights: Readonly<Partial<Record<string, string>>> = designTokens.font.lineHeight
const TYPE_SCALE = Object.entries(designTokens.font.size).reverse()
  .map(([key, size]) => ({ key, size, lineHeight: lineHeights[key] ?? 'normal' }))

export const Tipografia: Story = {
  name: 'Tipografía',
  render: () => (
    <Page title="Tipografía" lead="Inter Variable autoalojada con alternativas cv11 y ss01. Jerarquía con tres pesos (400, 500, 600) y tracking negativo en títulos.">
      <Section title="Escala">
        <div className="sb-panel">
          <table className="sb-table">
            <thead><tr><th>Token</th><th>Tamaño / interlineado</th><th>Muestra</th></tr></thead>
            <tbody>
              {TYPE_SCALE.map(({ key, size, lineHeight }) => (
                <tr key={key}>
                  <td><Token name={`--gcu-font-size-${key}`} /></td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{size} / {lineHeight}</td>
                  <td style={{ fontSize: size, lineHeight, letterSpacing: Number.parseInt(size, 10) >= 20 ? 'var(--gcu-tracking-tight)' : undefined, fontWeight: Number.parseInt(size, 10) >= 18 ? 600 : 400 }}>
                    Gestión de campañas en tiempo real
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Pesos" description="Regular para lectura, medio para etiquetas y énfasis, semibold para títulos. No usar 700+ en interfaz.">
        <div className="sb-panel sb-row" style={{ gap: 32, fontSize: 18 }}>
          <span style={{ fontWeight: 400 }}>Regular 400</span>
          <span style={{ fontWeight: 500 }}>Medio 500</span>
          <span style={{ fontWeight: 600 }}>Semibold 600</span>
        </div>
      </Section>
      <Section title="Números tabulares" description="Tablas, KPIs y contadores alinean cifras con tabular-nums (automático en celdas .text-end; en otras, .gcu-tabular).">
        <div className="sb-panel sb-row" style={{ gap: 48 }}>
          <div><p className="sb-section__description" style={{ margin: 0 }}>Proporcional</p>{['1.111', '8.888', '4.070'].map(n => <div key={n} style={{ fontVariantNumeric: 'proportional-nums', fontSize: 20 }}>{n}</div>)}</div>
          <div><p className="sb-section__description" style={{ margin: 0 }}>Tabular</p>{['1.111', '8.888', '4.070'].map(n => <div key={n} style={{ fontVariantNumeric: 'tabular-nums', fontSize: 20 }}>{n}</div>)}</div>
        </div>
      </Section>
    </Page>
  ),
}

export const Espaciado: Story = {
  render: () => (
    <Page title="Espaciado" lead="Base de 4 px. Agrupar con espacios chicos (4–12), separar secciones con espacios grandes (24–48).">
      <Section title="Escala">
        <div className="sb-panel">
          <table className="sb-table">
            <thead><tr><th>Token</th><th>Valor</th><th>Muestra</th></tr></thead>
            <tbody>
              {Object.entries(designTokens.space).map(([key, value]) => (
                <tr key={key}>
                  <td><Token name={`--gcu-space-${key}`} /></td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</td>
                  <td><div style={{ width: value, height: 12, borderRadius: 2, background: 'var(--gcu-primary)' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Alturas de control" description="Inputs, selects y botones comparten altura por tamaño para alinearse en una misma fila.">
        <div className="sb-panel sb-row" style={{ alignItems: 'flex-end' }}>
          {Object.entries(designTokens.controlHeight).map(([key, value]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div style={{ width: 96, height: value, borderRadius: 'var(--gcu-radius-md)', border: '1px solid var(--gcu-border-strong)', background: 'var(--gcu-surface-sunken)' }} />
              <Token name={`${key} · ${value}`} />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}

export const RadiosYElevacion: Story = {
  name: 'Radios y elevación',
  render: () => (
    <Page title="Radios y elevación" lead="Controles 6 px, cards 10 px, modales y drawers 12 px. La elevación comunica jerarquía: card 1, hover 2, dropdown 3, modal 4. En oscuro y navy se apoya en superficies más claras.">
      <Section title="Radios">
        <div className="sb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {Object.entries(designTokens.radius).map(([key, value]) => (
            <div key={key} className="sb-tile" style={{ borderRadius: value, border: '1px solid var(--gcu-border-strong)' }}>
              <Token name={`--gcu-radius-${key}`} />{value}
            </div>
          ))}
        </div>
      </Section>
      <Section title="Elevación">
        <div className="sb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className="sb-tile" style={{ boxShadow: `var(--gcu-shadow-${level})`, border: '1px solid var(--gcu-border)' }}>
              <Token name={`--gcu-shadow-${level}`} />
              {['Plano', 'Card', 'Hover', 'Dropdown', 'Modal'][level]}
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}

export const Motion: Story = {
  render: () => (
    <Page title="Motion" lead="El movimiento confirma una acción o explica un cambio; nunca decora. Entrar con enter, salir más rápido con exit. Con prefers-reduced-motion todas las duraciones pasan a 0.">
      <Section title="Duraciones y curvas" description="Pasa el puntero o enfoca cada pista para ver la curva standard con cada duración.">
        <div className="sb-panel sb-grid">
          {Object.entries(designTokens.motion.duration).map(([key, value]) => (
            <div key={key} className="sb-grid" style={{ gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
              <Token name={`--gcu-duration-${key} · ${value}`} />
              <div className="sb-motion-track" role="group" tabIndex={0} aria-label={`Demostración de duración ${key}`}>
                <div className="sb-motion-dot" style={{ transition: `transform var(--gcu-duration-${key}) var(--gcu-ease-standard)` }} />
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Feedback de presión" description="Los botones habilitados se comprimen a 0,98 en 100 ms al presionarlos.">
        <div className="sb-panel sb-row">
          <button type="button" className="btn btn-primary">Presióname</button>
          <button type="button" className="btn btn-light-brand">Secundario</button>
          <button type="button" className="btn btn-primary" disabled>Deshabilitado</button>
        </div>
      </Section>
      <Section title="Carga con skeleton" description="Preferir skeleton con la forma del contenido en lugar de un spinner a pantalla completa.">
        <div className="sb-panel sb-row" style={{ alignItems: 'flex-start' }}>
          <span className="gcu-skeleton gcu-skeleton--circle" style={{ width: 40, height: 40 }} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <span className="gcu-skeleton gcu-skeleton--text" style={{ width: '40%' }} />
            <span className="gcu-skeleton gcu-skeleton--text" style={{ width: '90%' }} />
            <span className="gcu-skeleton gcu-skeleton--text" style={{ width: '75%' }} />
          </div>
        </div>
      </Section>
    </Page>
  ),
}

const FEATHER = ['plus', 'edit', 'trash-2', 'search', 'filter', 'download', 'user', 'settings', 'bell', 'mail', 'calendar', 'phone']
const TABLER = [
  { name: 'IconRobot', icon: <IconRobot /> },
  { name: 'IconBrain', icon: <IconBrain /> },
  { name: 'IconSparkles', icon: <IconSparkles /> },
  { name: 'IconMessageChatbot', icon: <IconMessageChatbot /> },
  { name: 'IconHeadset', icon: <IconHeadset /> },
  { name: 'IconRoute', icon: <IconRoute /> },
  { name: 'IconChartBar', icon: <IconChartBar /> },
  { name: 'IconBolt', icon: <IconBolt /> },
]

export const Iconografia: Story = {
  name: 'Iconografía',
  render: () => (
    <Page title="Iconografía" lead="Feather para las acciones genéricas existentes; Tabler para lo que Feather no cubre (IA, operaciones, dominios). Ambos con trazo 2 y tamaños 14/16/20. Un mismo concepto usa siempre el mismo icono.">
      <Section title="Feather (string)" description={'<Icon name="plus" /> · <Button startIcon="plus">'}>
        <div className="sb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))' }}>
          {FEATHER.map(name => (
            <div key={name} className="sb-icon-cell"><Icon name={name} size="lg" /><span>{name}</span></div>
          ))}
        </div>
      </Section>
      <Section title="Tabler (ReactNode)" description={'<Icon icon={<IconRobot />} /> · <Button startIcon={<IconRobot />}>'}>
        <div className="sb-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))' }}>
          {TABLER.map(({ name, icon }) => (
            <div key={name} className="sb-icon-cell"><Icon icon={icon} size="lg" /><span>{name.replace('Icon', '')}</span></div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}
