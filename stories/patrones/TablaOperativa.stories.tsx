import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ActiveFilters, Badge, Button, Card, DataTable, DataTableToolbar, PageHeader, Person, Select, log } from '../../src'
import type { ActiveFilter, DataTableColumn } from '../../src'
import { conShell, tresTemas } from './soporte'

type Rol = 'Ejecutivo' | 'Supervisor' | 'Analista de calidad' | 'Administrador'
type Estado = 'Activo' | 'Invitado' | 'Bloqueado'

interface Usuario {
  id: number
  nombre: string
  correo: string
  rol: Rol
  cuenta: string
  estado: Estado
  ultimoAcceso: string
}

const NOMBRES = ['Ana Torres', 'Bruno Díaz', 'Carla Muñoz', 'Diego Rojas', 'Elena Soto', 'Felipe Vera', 'Gabriela Pino', 'Hugo Lagos', 'Isabel Fuentes', 'Javier Reyes', 'Karen Ortiz', 'Luis Campos']
const ROLES: Rol[] = ['Ejecutivo', 'Ejecutivo', 'Supervisor', 'Ejecutivo', 'Analista de calidad', 'Administrador']
const CUENTAS = ['Comercial Andes', 'Telco Sur', 'Banco Austral']
const ESTADOS: Estado[] = ['Activo', 'Activo', 'Activo', 'Invitado', 'Activo', 'Bloqueado']

const USUARIOS: Usuario[] = Array.from({ length: 36 }, (_, i) => {
  const nombre = NOMBRES[i % NOMBRES.length]
  const [pila, apellido] = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(' ')
  return {
    id: 1200 + i,
    nombre,
    correo: `${pila}.${apellido}${i >= NOMBRES.length ? i : ''}@in-touchcrm.cl`,
    rol: ROLES[(i * 5) % ROLES.length],
    cuenta: CUENTAS[(i * 7) % CUENTAS.length],
    estado: ESTADOS[(i * 3) % ESTADOS.length],
    ultimoAcceso: `${String(1 + (i % 4)).padStart(2, '0')}-10-2026 ${String(8 + (i % 10)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}`,
  }
})

const TONO_ESTADO = { Activo: 'success', Invitado: 'info', Bloqueado: 'danger' } as const

const COLUMNAS: ReadonlyArray<DataTableColumn<Usuario>> = [
  { key: 'nombre', label: 'Usuario', sortable: true, hideable: false, render: u => <Person name={u.nombre} meta={u.correo} size="sm" /> },
  { key: 'rol', label: 'Rol', sortable: true },
  { key: 'cuenta', label: 'Cuenta', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true, render: u => <Badge variant={TONO_ESTADO[u.estado]} soft>{u.estado}</Badge> },
  { key: 'ultimoAcceso', label: 'Último acceso', sortable: true, render: u => <span className="gcu-tabular">{u.ultimoAcceso}</span> },
]

const OPCIONES_ROL = [{ value: '', label: 'Todos los roles' }, ...['Ejecutivo', 'Supervisor', 'Analista de calidad', 'Administrador'].map(r => ({ value: r, label: r }))]

function UsuariosOperativos() {
  const [rol, setRol] = useState('Ejecutivo')
  const filtros: ActiveFilter[] = rol ? [{ key: 'rol', label: 'Rol', value: rol }] : []
  const filas = rol ? USUARIOS.filter(u => u.rol === rol) : USUARIOS

  return (
    <>
      <PageHeader
        title="Usuarios"
        breadcrumbs={[{ label: 'Administración', href: '#admin' }, { label: 'Usuarios' }]}
        className="sticky-top"
        actions={(
          <>
            <Button variant="light-brand" startIcon="download">Exportar</Button>
            <Button variant="primary" startIcon="user-plus" onClick={() => log.info('Patrón Tabla operativa: invitar usuario')}>Invitar usuario</Button>
          </>
        )}
      />
      <div className="main-content">
        <Card title="Usuarios de la plataforma" subtitle={`${USUARIOS.length} usuarios en 3 cuentas`} noPadding>
          <DataTable<Usuario>
            aria-label="Usuarios de la plataforma"
            columns={COLUMNAS}
            data={filas}
            pageSize={10}
            pageSizeOptions={[10, 25, 50]}
            density="compact"
            selectable
            searchable
            columnMenu
            getRowLabel={u => u.nombre}
            searchPlaceholder="Nombre o correo"
            toolbar={ctx => (
              <>
                <DataTableToolbar
                  searchable
                  searchLabel="Buscar usuarios"
                  searchPlaceholder="Nombre o correo"
                  searchValue={ctx.searchValue}
                  onSearchChange={ctx.onSearchChange}
                  pageSize={ctx.pageSize}
                  pageSizeOptions={ctx.pageSizeOptions}
                  onPageSizeChange={ctx.onPageSizeChange}
                >
                  <Select aria-label="Filtrar por rol" value={rol} onChange={e => setRol(e.target.value)} options={OPCIONES_ROL} />
                  {ctx.columnMenu}
                </DataTableToolbar>
                {filtros.length > 0 ? (
                  <div className="px-4 pb-3">
                    <ActiveFilters filters={filtros} onRemove={() => setRol('')} resultCount={filas.length} />
                  </div>
                ) : null}
              </>
            )}
            renderBulkActions={(seleccion, { clearSelection }) => (
              <>
                <Button size="sm" variant="light-brand" startIcon="refresh-cw" onClick={() => log.info(`Patrón Tabla operativa: reenviar invitación a ${seleccion.length}`)}>Reenviar invitación</Button>
                <Button size="sm" variant="danger" startIcon="lock" onClick={() => { log.info(`Patrón Tabla operativa: bloquear ${seleccion.length}`); clearSelection() }}>Bloquear {seleccion.length}</Button>
              </>
            )}
            actions={[
              { label: 'Editar usuario', icon: 'feather-edit-2', onClick: u => log.info(`Patrón Tabla operativa: editar #${u.id}`) },
              { label: 'Ver actividad', icon: 'feather-activity', onClick: u => log.info(`Patrón Tabla operativa: actividad #${u.id}`) },
            ]}
            noResultsMessage="Nadie coincide con la búsqueda. Prueba con otro rol o cuenta."
          />
        </Card>
      </div>
    </>
  )
}

const meta: Meta = {
  title: 'Patrones/Tabla operativa',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Usuarios, logs o auditoría: una card con toolbar, DataTable con selección, BulkBar y acciones de fila. Ver docs/PATRONES.md.' } },
  },
  decorators: [conShell('/usuarios')],
  render: () => <UsuariosOperativos />,
}
export default meta

// Exportaciones explícitas: el indexador de Storybook ignora las desestructuradas.
const temas = tresTemas<StoryObj>()
export const Claro = temas.Claro
export const Oscuro = temas.Oscuro
export const Navy = temas.Navy
