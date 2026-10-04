import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion, Card, Switch } from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'

const AYUDA = [
  { value: 'horario', title: '¿En qué horario atiende la cola Soporte?', content: 'De lunes a viernes, de 8:00 a 20:00. Fuera de ese horario las llamadas pasan al buzón.' },
  { value: 'reintentos', title: '¿Cuántas veces se reintenta una llamada?', content: 'Hasta 3 veces, con 30 minutos entre intentos. Puedes cambiarlo en la campaña.' },
  { value: 'grabaciones', title: '¿Dónde encuentro las grabaciones?', content: 'En el detalle de cada gestión, pestaña Actividad.' },
  { value: 'archivado', title: 'Integraciones antiguas (archivado)', content: 'Sin contenido.', disabled: true },
]

const meta: Meta<typeof Accordion> = {
  title: 'Componentes/Nuevos/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: { items: AYUDA, defaultValue: ['horario'], multiple: false, flush: false, headingLevel: 3 },
  parameters: {
    docs: {
      description: {
        component: 'Secciones plegables (patrón APG): botón con `aria-expanded` dentro de un encabezado y región nombrada. Una o varias abiertas, flechas/Inicio/Fin entre títulos. La altura se anima en CSS y es instantánea con reduced-motion.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Accordion>

export const Playground: Story = {}

export const Variantes: Story = {
  name: 'Varias abiertas y flush dentro de una card',
  render: () => (
    <div className="d-flex flex-column gap-4">
      <Accordion items={AYUDA} multiple defaultValue={['horario', 'reintentos']} />
      <Card title="Configuración avanzada">
        <Accordion
          flush
          items={[
            { value: 'llamadas', title: 'Llamadas', content: <Switch label="Grabar todas las llamadas" defaultChecked /> },
            { value: 'alertas', title: 'Alertas', content: <Switch label="Avisar cuando la cola supere 5 minutos de espera" /> },
          ]}
        />
      </Card>
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => <div style={{ maxWidth: 320 }}><Accordion items={AYUDA} defaultValue={['reintentos']} /></div>,
}

export const Temas: Story = {
  name: 'Tres temas',
  render: () => <TresTemas>{(tema) => <Accordion items={AYUDA.slice(0, 2).map((item) => ({ ...item, value: `${tema}-${item.value}`, title: <>{item.title} <span className="visually-hidden">({tema})</span></> }))} defaultValue={[`${tema}-horario`]} />}</TresTemas>,
}
