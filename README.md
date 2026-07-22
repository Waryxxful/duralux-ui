# @duralux/ui

Paquete compartido del frontend GranCRM: componentes React, shell UI, contrato shell-satélite, tokens, cliente API y estilos basados en Duralux/Bootstrap 5.

La UI genérica compartida vive acá. Las aplicaciones satélite consumen estos exports y conservan únicamente componentes específicos de su dominio.

## Instalación

```bash
npm install github:Waryxxful/duralux-ui
```

El host debe proveer los tres peer dependencies del paquete:

```json
{
  "react": ">=18",
  "react-dom": ">=18",
  "react-router-dom": "^6.0.0 || ^7.0.0"
}
```

`react-router-dom` es un peer requerido, no una dependencia opcional de `AppLayout`. El script `prepare` construye `dist/` automáticamente al instalar desde git.

## Estilos

En una aplicación standalone, importá el stack canónico en este orden:

```jsx
import '@duralux/ui/bootstrap.min.css'
import '@duralux/ui/theme.min.css'
import '@duralux/ui/styles/grancrm-ui.css'
```

Una satélite montada en el shell no repite estos imports: el shell carga el stack una sola vez.

| Export | Contenido |
|---|---|
| `@duralux/ui/bootstrap.css` / `bootstrap.min.css` | Bootstrap compilado desde `scss/bootstrap/bootstrap.scss` |
| `@duralux/ui/theme.css` / `theme.min.css` | Theme Duralux adaptado, compilado desde `scss/theme.scss` |
| `@duralux/ui/styles/grancrm-ui.css` | Tokens y glue GranCRM; incluye Feather Icons y su fuente |
| `@duralux/ui/styles/feather-icons.css` | Feather Icons por separado, para usos parciales |
| `@duralux/ui/styles.css` | Alias de `styles/grancrm-ui.css` |

No se necesita Bootstrap JS, `vendors.min.css` ni jQuery para los componentes del paquete.

El theme es una adaptación deliberada del lenguaje visual Duralux para GranCRM. El SCSS mantenido por este repositorio es la fuente de verdad; los CSS compilados no pretenden ser byte a byte idénticos a los archivos publicados por la plantilla original.

## Uso rápido

```jsx
import { Badge, Button, Card, DataTable } from '@duralux/ui'

const columns = [
  { key: 'name', label: 'Cliente', sortable: true },
  {
    key: 'status',
    label: 'Estado',
    render: (_row, value) => <Badge variant="success" soft>{value}</Badge>,
  },
]

export function ClientesPage({ clientes }) {
  return (
    <Card
      title="Clientes"
      actions={<Button variant="primary" startIcon="plus">Nuevo</Button>}
      noPadding
    >
      <DataTable columns={columns} data={clientes} rowKey="id" selectable pageSize={10} />
    </Card>
  )
}
```

## Contratos principales

### Button y LinkButton

`Button` acepta props nativos de botón, `variant`, `size`, `loading`, `disabled`, `startIcon`, `endIcon`, `icon`, `as` y `href`. `startIcon`/`endIcon` reciben el nombre Feather sin prefijo (`"plus"`); `icon` conserva el formato legacy de clase completa (`"feather-plus"`).

`LinkButton` renderiza un `<a>`, requiere `href` y comparte `variant`, `size`, `loading`, `disabled`, `icon`, `startIcon` y `endIcon`. En estado `loading` o `disabled` elimina `href`, sale del orden de tabulación y expone `aria-disabled`.

### Modal

```jsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Editar cliente"
  size="lg"
  closeOnEscape
  closeOnBackdrop={false}
  showCloseButton
  footer={<Button onClick={save}>Guardar</Button>}
>
  Contenido
</Modal>
```

`open` controla la visibilidad y `onClose` recibe las solicitudes de cierre. `closeOnEscape`, `closeOnBackdrop` y `showCloseButton` valen `true` por defecto. También admite `size`, `scrollable`, `title`, `footer` y `children`; el componente gestiona portal, bloqueo de body, foco y modales apilados sin Bootstrap JS.

### FormField y Select

`FormField` acepta `label`, `htmlFor`, `required`, `error`, `helpText`, el alias `hint` y `className`. `children` puede ser un nodo React o una función `(id) => ReactNode`:

```jsx
<FormField label="Nombre" required helpText="Usá el nombre legal">
  <Input />
</FormField>

<FormField label="Estado" error={error}>
  {(id) => (
    <Select
      id={id}
      placeholder="Elegí un estado"
      invalid={Boolean(error)}
      options={[
        'Pendiente',
        { value: 'active', label: 'Activo' },
        { value: 'archived', label: 'Archivado', disabled: true },
      ]}
    />
  )}
</FormField>
```

Con un único control, `FormField` lo asocia automáticamente con el label y los mensajes accesibles. El render prop recibe el id generado o el `htmlFor` explícito.

`Select` acepta todos los props nativos de `<select>`, incluido `disabled`, además de `options`, `placeholder`, `invalid` y `error`. `options` puede mezclar strings y objetos `{ value, label, disabled? }`; `placeholder` crea una opción vacía deshabilitada.

### Tabs

Cada tab tiene `{ key, label, content?, icon? }`, con keys `string | number`.

```jsx
const tabs = [
  { key: 'profile', label: 'Perfil', content: <Profile /> },
  { key: 'security', label: 'Seguridad', icon: 'feather-lock', content: <Security /> },
]

// No controlado: defaultActiveKey solo define la selección inicial.
<Tabs tabs={tabs} defaultActiveKey="profile" onChange={trackTab} />

// Controlado: el consumidor actualiza activeKey.
<Tabs tabs={tabs} activeKey={activeKey} onChange={setActiveKey} />
```

También admite `className` y `tabClassName`. Implementa asociación tab/panel y navegación por teclado sin Bootstrap JS.

### DataTable

```ts
type DataTableColumn<
  Row extends object,
  K extends Extract<keyof Row, string> = Extract<keyof Row, string>,
> = K extends Extract<keyof Row, string> ? {
  key: K
  label: React.ReactNode
  sortable?: boolean
  render?: (row: Row, value: Row[K], rowIndex: number) => React.ReactNode
} : never
```

El tipo se distribuye por las keys string de la fila: permite arrays heterogéneos y tipa cada `value` como `Row[K]`, mientras rechaza keys inexistentes. El renderer siempre recibe `(row, value, rowIndex)` en ese orden. `rowIndex` corresponde a la página visible después del ordenamiento.

`DataTable` acepta `columns`, `data`, `rowKey`, `pageSize`, `actions`, `selectable` y `onSelectionChange`. Las acciones tienen `{ label, icon, onClick(row) }`; la selección es interna y `onSelectionChange` recibe los ids tomados de `row[rowKey]`.

```jsx
<DataTable
  columns={columns}
  data={clientes}
  rowKey="id"
  pageSize={10}
  selectable
  onSelectionChange={(ids) => setSelectedIds(ids)}
  actions={[
    { label: 'Ver', icon: 'feather-eye', onClick: (row) => navigate(`/clientes/${row.id}`) },
  ]}
/>
```

### Dropdown

`Dropdown` es el primitivo React para menús del paquete. Soporta estado no controlado (`defaultOpen`) o controlado (`open`, `onOpenChange`), alineación `start | end`, cierre exterior/Escape y `desktopHover`. `DropdownMenu` admite `as` y `closeOnSelect`.

```jsx
<Dropdown
  align="end"
  trigger={(triggerProps, { open }) => (
    <button {...triggerProps} className="btn btn-light-brand">
      Acciones {open ? '▲' : '▼'}
    </button>
  )}
>
  <DropdownMenu as="ul">
    <li><button type="button" className="dropdown-item">Editar</button></li>
    <li><button type="button" className="dropdown-item">Archivar</button></li>
  </DropdownMenu>
</Dropdown>
```

## Otros exports

- UI y feedback: `Card`, `Badge`, `Alert`, `Avatar`, `Timeline`, `Progress`, `ProgressRing`, `Toast`, estados vacíos/error/carga.
- Formularios y datos: `Input`, `Textarea`, `Checkbox`, `Radio`, `FileInput`, `InputGroup`, `Table`, `ResponsiveTable`, `Pagination`.
- Visualización: stats cards, `ApexChart`, `ChartCard` y widgets Recharts.
- Chat y conversación: sidebar, ventana, input, typing indicator y message bubbles.
- Layout y shell: `AppLayout`, `AuthLayout`, `PageHeader`, `ShellHeader`, `ShellNav`, `ThemeScope`, `ThemeProvider`, `ConfirmDialog` y extras GranCRM.
- Contratos y utilidades: tipos de sesión/manifest/remotes, tokens y `apiFetch`.

`dist/index.d.ts` combina tipos generados (`vite-plugin-dts` desde `.ts`/`.tsx`) y declaraciones manuales para los componentes `.jsx` (`scripts/write-index-dts.mjs`). Toda la API pública tiene props tipadas — sin `any`.

## Ejemplos

### Chart con Card

```jsx
import { ApexChart, ChartCard } from '@duralux/ui'

<ChartCard
  title="Ventas"
  subtitle="Últimos 6 meses"
  actions={[{ label: 'Mensual', onClick: () => setRange('month') }]}
>
  <ApexChart
    type="area"
    height={250}
    options={{
      colors: ['#3454d1'],
      stroke: { curve: 'smooth', width: 2 },
      xaxis: { categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'] },
      dataLabels: { enabled: false },
      chart: { toolbar: { show: false } },
    }}
    series={[{ name: 'Ventas', data: [31, 40, 28, 51, 42, 82] }]}
  />
</ChartCard>
```

### AppLayout con router

```jsx
import { AppLayout } from '@duralux/ui'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'

const navItems = [
  { type: 'caption', label: 'Principal' },
  { icon: 'feather-airplay', label: 'Dashboard', to: '/' },
  { icon: 'feather-users', label: 'Clientes', to: '/clientes' },
]

const router = createBrowserRouter([{
  element: <AppLayout navItems={navItems} user={user}><Outlet /></AppLayout>,
  children: [
    { path: '/', element: <DashboardPage /> },
    { path: '/clientes', element: <ClientesPage /> },
  ],
}])

export default function App() {
  return <RouterProvider router={router} />
}
```

## Demo local

```bash
git clone https://github.com/Waryxxful/duralux-ui
cd duralux-ui
npm install
npm run dev:demo
# http://localhost:5200
```

El demo compila directamente el Bootstrap SCSS, el theme adaptado y el glue del paquete, por lo que no depende de copias CSS en `demo/public`.

## Desarrollo

En este repositorio se usa `npm`:

```bash
npm install
npm run typecheck
npm test
npm run build
npm run typecheck:public
npm run dev:demo
```

`npm run build` genera los bundles ESM/CJS, declaraciones, estilos copiados y CSS compilado en `dist/`, y luego valida las declaraciones con el fixture estricto de `test-types/`. `npm run typecheck:public` permite repetir esa validación contra un `dist/` ya generado.

```text
src/
  index.js                 exports públicos
  contract.ts              contrato shell-satélite
  tokens.ts                tokens compartidos
  components/              UI, forms, data, charts, chat, layout y shell
  styles/                  glue GranCRM y Feather Icons
scss/
  bootstrap/bootstrap.scss Bootstrap adaptado
  theme.scss               theme Duralux adaptado
demo/                      showcase Vite
```

## Stack

React 18+ · React Router 6/7 · Vite · Bootstrap 5 SCSS · Duralux adaptado · ApexCharts · Recharts
