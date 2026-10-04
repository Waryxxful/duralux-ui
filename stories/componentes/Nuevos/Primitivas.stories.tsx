import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, Divider, Kbd, Skeleton, Spinner, Tag } from '../../../src'
import { TresTemas } from '../Graficos/TresTemas'

const meta: Meta = {
  title: 'Componentes/Nuevos/Primitivas',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Divider (`<hr>` nativo o con etiqueta), Kbd (tecla o combinación), Spinner (`role="status"` con texto), Skeleton (sobre `.gcu-skeleton`: texto, círculo, bloque) y Tag (valor removible con botón «Quitar …»).',
      },
    },
  },
}
export default meta
type Story = StoryObj

export const DividerKbd: Story = {
  name: 'Divider y Kbd',
  render: () => (
    <div className="d-flex flex-column gap-2" style={{ maxWidth: 480 }}>
      <p className="mb-0">Bloque superior</p>
      <Divider />
      <Divider label="o continúa con" />
      <Divider label="Ayer" align="start" />
      <div className="d-flex align-items-center">
        <span>Filtros</span>
        <Divider orientation="vertical" />
        <span>Busca con <Kbd keys={['Ctrl', 'K']} /> y cierra con <Kbd>Esc</Kbd></span>
      </div>
    </div>
  ),
}

export const SpinnerSkeleton: Story = {
  name: 'Spinner y Skeleton',
  render: () => (
    <div className="d-flex flex-column gap-4" style={{ maxWidth: 480 }}>
      <div className="d-flex align-items-center gap-4">
        <Spinner size="sm" />
        <Spinner />
        <Spinner size="lg" />
        <Spinner tone="muted" label="Actualizando métricas…" />
      </div>
      <Card title="Cargando cliente" aria-busy="true">
        <div className="d-flex gap-3 align-items-center">
          <Skeleton variant="circle" width={40} />
          <div className="flex-grow-1"><Skeleton lines={2} /></div>
        </div>
        <Skeleton variant="block" height={96} className="mt-3" />
      </Card>
    </div>
  ),
}

function FiltrosActivos() {
  const [filtros, setFiltros] = useState(['Cobranza Q4', 'Soporte', 'Últimos 7 días'])
  return (
    <div className="d-flex flex-wrap gap-2">
      {filtros.map((filtro) => (
        <Tag key={filtro} tone="primary" onRemove={() => setFiltros((actuales) => actuales.filter((item) => item !== filtro))}>{filtro}</Tag>
      ))}
      {filtros.length === 0 && <span className="text-muted">Sin filtros. Agrega uno desde la barra.</span>}
    </div>
  )
}

export const Tags: Story = {
  name: 'Tag: tonos, tamaños y caso real (filtros aplicados)',
  render: () => (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap gap-2">
        <Tag>Neutro</Tag>
        <Tag tone="primary" icon="tag">Marca</Tag>
        <Tag tone="success">Cumplido</Tag>
        <Tag tone="warning">Cerca del umbral</Tag>
        <Tag tone="danger">Vencido</Tag>
        <Tag tone="info" size="sm">Pequeño</Tag>
        <Tag onRemove={() => {}} disabled>Bloqueado</Tag>
      </div>
      <FiltrosActivos />
    </div>
  ),
}

export const Angosto: Story = {
  name: 'Contenedor angosto (320 px)',
  render: () => (
    <div style={{ maxWidth: 320 }} className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap gap-2">
        <Tag tone="primary" onRemove={() => {}}>Campaña de retención de clientes del segundo semestre</Tag>
        <Tag onRemove={() => {}}>Soporte</Tag>
      </div>
      <Divider label="o continúa con" />
      <Skeleton lines={3} />
    </div>
  ),
}

export const Temas: Story = {
  name: 'Tres temas',
  render: () => (
    <TresTemas>
      {(tema) => (
        <div className="d-flex flex-column gap-2">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Tag tone="primary" onRemove={() => {}}>{tema}</Tag>
            <Tag tone="danger">Vencido</Tag>
            <Kbd keys={['Ctrl', 'K']} />
            <Spinner size="sm" />
          </div>
          <Divider label="o continúa con" />
          <Skeleton lines={2} />
        </div>
      )}
    </TresTemas>
  ),
}
