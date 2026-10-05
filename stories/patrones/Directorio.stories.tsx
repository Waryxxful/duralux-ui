import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Badge, Button, Card, DashGrid, DataTable, EmptyState, EntityCard, Input, PageHeader, QuickTiles, Segmented, Severity, log } from '../../src'
import type { DataTableColumn } from '../../src'
import { CAMPANAS, conShell, miles, pct, tresTemas } from './soporte'
import type { Campana } from './soporte'

const TONO_ESTADO = { Activa: 'success', Pausada: 'warning', Finalizada: 'secondary' } as const

const bajoMeta = (c: Campana) => c.estado === 'Activa' && c.contactabilidad < c.meta

const COLUMNAS: ReadonlyArray<DataTableColumn<Campana>> = [
  { key: 'id', label: 'ID', render: c => <span className="font-monospace">#{c.id}</span> },
  { key: 'nombre', label: 'Campaña', sortable: true, hideable: false },
  { key: 'area', label: 'Área', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true, render: c => <Badge variant={TONO_ESTADO[c.estado]} soft>{c.estado}</Badge> },
  { key: 'agentes', label: 'Ejecutivos', sortable: true, numeric: true },
  { key: 'llamadas', label: 'Llamadas', sortable: true, numeric: true, render: c => miles(c.llamadas) },
  { key: 'contactabilidad', label: 'Contactabilidad', sortable: true, numeric: true, render: c => `${pct(c.contactabilidad)} · meta ${pct(c.meta)}` },
  { key: 'cierre', label: 'Cierre', sortable: true },
]

function tarjeta(c: Campana) {
  return (
    <EntityCard
      key={c.id}
      title={c.nombre}
      subtitle={`${c.area} · cierra el ${c.cierre}`}
      name={c.nombre}
      headingLevel={3}
      inactive={c.estado === 'Finalizada'}
      href={`#campana-${c.id}`}
      chips={bajoMeta(c)
        ? <Severity level="warning" label="Bajo la meta" size="sm" />
        : <Badge variant={TONO_ESTADO[c.estado]} soft>{c.estado}</Badge>}
      stats={[
        { label: 'Ejecutivos', value: c.agentes },
        { label: 'Llamadas', value: miles(c.llamadas) },
        { label: 'Contactabilidad', value: `${pct(c.contactabilidad)} / ${pct(c.meta)}` },
      ]}
    />
  )
}

/** Filas de 3 tarjetas (4+4+4); la última se completa con celdas vacías para respetar la fila permitida. */
function filas(campanas: Campana[]) {
  const resultado: Campana[][] = []
  for (let i = 0; i < campanas.length; i += 3) resultado.push(campanas.slice(i, i + 3))
  return resultado
}

function DirectorioCampanas() {
  const [vista, setVista] = useState<'tarjetas' | 'tabla'>('tarjetas')
  const [busqueda, setBusqueda] = useState('')
  const visibles = CAMPANAS.filter(c => c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
  const enRiesgo = CAMPANAS.filter(bajoMeta).length

  return (
    <>
      <PageHeader
        title="Campañas"
        breadcrumbs={[{ label: 'Operación', href: '#operacion' }, { label: 'Campañas' }]}
        className="sticky-top"
        actions={<Button variant="primary" startIcon="plus" onClick={() => log.info('Patrón Directorio: crear campaña')}>Crear campaña</Button>}
      />
      <div className="main-content">
        <DashGrid>
          <DashGrid.Row layout={[12]}>
            <QuickTiles
              title="Accesos rápidos"
              headingLevel={2}
              items={[
                { label: 'Bajo la meta', description: `${enRiesgo} campañas activas`, icon: 'alert-triangle', tone: 'warning', href: '#bajo-meta' },
                { label: 'Importar base', description: 'CSV o Excel con RUT y teléfono', icon: 'upload', tone: 'primary', href: '#importar' },
                { label: 'Guiones', description: '12 guiones publicados', icon: 'file-text', tone: 'info', href: '#guiones' },
                { label: 'Reasignar ejecutivos', description: 'Requiere rol de supervisor', icon: 'users', tone: 'neutral', disabled: true, disabledReason: 'Solo supervisores pueden reasignar.' },
              ]}
            />
          </DashGrid.Row>
          <DashGrid.Row layout={[12]}>
            <div className="sb-patron-filtros justify-content-between">
              <div style={{ minInlineSize: '16rem' }}>
                <Input
                  type="search"
                  startAddon={<i className="feather-search" aria-hidden="true" />}
                  placeholder="Buscar campaña"
                  aria-label="Buscar campaña"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </div>
              <Segmented
                aria-label="Vista"
                value={vista}
                onChange={setVista}
                options={[
                  { value: 'tarjetas', label: 'Tarjetas', icon: 'grid' },
                  { value: 'tabla', label: 'Tabla', icon: 'list' },
                ]}
              />
            </div>
          </DashGrid.Row>
        </DashGrid>
        {visibles.length === 0 ? (
          <Card>
            <EmptyState
              icon="search"
              title="Ninguna campaña coincide con la búsqueda"
              message="Prueba con otro nombre o revisa las campañas finalizadas."
              action={<Button variant="light-brand" onClick={() => setBusqueda('')}>Limpiar búsqueda</Button>}
            />
          </Card>
        ) : vista === 'tarjetas' ? (
          <DashGrid className="mt-4">
            {filas(visibles).map(fila => (
              <DashGrid.Row key={fila[0].id} layout={[4, 4, 4]}>
                {fila.map(tarjeta)}
                {fila.length < 3 ? <span key="relleno-1" aria-hidden="true" /> : null}
                {fila.length < 2 ? <span key="relleno-2" aria-hidden="true" /> : null}
              </DashGrid.Row>
            ))}
          </DashGrid>
        ) : (
          <Card noPadding className="mt-4">
            <DataTable<Campana> aria-label="Campañas" columns={COLUMNAS} data={visibles} pageSize={10} density="compact" />
          </Card>
        )}
      </div>
    </>
  )
}

const meta: Meta = {
  title: 'Patrones/Directorio',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Cuentas, campañas o equipos: QuickTiles arriba, grilla de EntityCard y la tabla como vista secundaria. Ver docs/PATRONES.md.' } },
  },
  decorators: [conShell('/campanas')],
  render: () => <DirectorioCampanas />,
}
export default meta

// Exportaciones explícitas: el indexador de Storybook ignora las desestructuradas.
const temas = tresTemas<StoryObj>()
export const Claro = temas.Claro
export const Oscuro = temas.Oscuro
export const Navy = temas.Navy
