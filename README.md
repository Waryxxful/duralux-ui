# @duralux/ui

Paquete compartido del frontend GranCRM: componentes React, shell UI, contrato shell-satélite, tokens, cliente API y estilos basados en Duralux/Bootstrap 5.

La UI genérica compartida vive acá. Las aplicaciones satélite consumen estos exports y conservan únicamente componentes específicos de su dominio.

## v2.0.0

La versión 2 separa los charts del entrypoint raíz, publica contratos TypeScript completos y agrega controles de selección accesibles. Es un release mayor: actualizá imports de charts a sus subpaths y revisá los peers opcionales antes de actualizar. Consultá [CHANGELOG.md](./CHANGELOG.md) para los cambios de migración y [docs/RELEASE_V2.md](./docs/RELEASE_V2.md) para el estado de validación y las aceptaciones explícitas.

## Instalación

```bash
npm install github:Waryxxful/duralux-ui
```

El host debe proveer los peer dependencies base:

```json
{
  "react": ">=18",
  "react-dom": ">=18",
  "react-router-dom": "^6.0.0 || ^7.0.0"
}
```

`react-router-dom` es un peer requerido, no una dependencia opcional de `AppLayout`. El script `prepare` construye `dist/` automáticamente al instalar desde git.

### Charts opcionales

El entrypoint raíz no exporta motores ni componentes de charts. Instalá sólo el peer del subpath que uses:

```bash
# ApexChart / ApexDataTable
npm install apexcharts react-apexcharts

# Widgets Recharts
npm install recharts
```

| Subpath | Exports | Peer opcional necesario |
|---|---|---|
| `@duralux/ui/charts/apex` | `ApexChart`, `ApexDataTable`, `ChartCard` | `apexcharts`, `react-apexcharts` |
| `@duralux/ui/charts/recharts` | `AreaChartWidget`, `BarChartWidget`, `LineChartWidget`, `PieChartWidget`, `ChartCard` | `recharts` |
| `@duralux/ui/charts` | API común de charts | ambos conjuntos según los exports usados |

Esto conserva el bundle core libre de engines de gráficos y permite tree-shaking por subpath.

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

El theme sigue fielmente la plantilla `duralux-v2` (React + Vite) en paleta, tokens de
shadow/border/radius y componentes base. Cualquier divergencia de color respecto a
`duralux-v2` es un bug, no una decisión — reportarla y corregirla en `scss/` y `src/tokens.ts`
a la vez.

### Tokens (`src/tokens.ts`)

| Escala | Valores |
|---|---|
| `shadow` | `none · sm · md · lg · xl · xxl` |
| `border` | `none · soft · normal · medium · hard · contrast` |
| `radius` | `none · xs · sm · md · lg · xl · xxl · pill · circle` |

### Convención de clases: `cx()`

Todo componente que compone `className` condicional usa `src/utils/cx.ts` en vez de
reinventar `.filter(Boolean).join(' ')`. Ver `Button`, `Badge`, `Alert`.

### Variante `soft`

`Badge` y `Alert` soportan `soft` para usar el estilo "soft" ya definido en el SCSS
(`bg-soft-*` / `alert-soft-*-message`) en vez del sólido. No inventar una tercera
convención de "suave" en componentes nuevos — seguir este patrón.

### Animación de submenu (`ShellNav`)

El submenu colapsable del sidebar (`.nxl-submenu`) anima con el par de clases de v2
`nxl-menu-visible` / `nxl-menu-hidden` (`max-height` + `opacity` + `visibility`, 0.5s
ease-in-out — `scss/themes/layouts/_nxl-navigation.scss`). El `<ul>` debe quedar
**siempre montado**, alternando solo la clase; montar/desmontar condicionalmente
(`{open && <ul>...}`) rompe la transición porque no se puede animar hacia/desde
`display: none`.

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

### FormField, Select y controles avanzados

`FormField` acepta `label`, `htmlFor`, `required`, `error`, `helpText`, el alias `hint` y `className`. `children` puede ser un nodo React o una función `(id) => ReactNode`. Con un único control conocido —incluidos `InputGroup`, `SearchableSelect` y `MultiSelect`— asocia automáticamente label, requerido, error y descripciones accesibles. En grupos con varios controles, usá el render prop o asociaciones explícitas.

Un wrapper propio que reenvía props al control puede optar al mismo contrato declarando `MyControl.duraluxFormControl = true`. Si su cantidad de controles depende de props, el marker puede ser una función que devuelva si esa instancia tiene un único destino; `InputGroup` usa esa variante. Wrappers visuales no se clonan implícitamente.

```jsx
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

`Select` conserva el `<select>` nativo y acepta todos sus props más `options`, `placeholder`, `invalid` y `error`. `options` admite strings y `{ value, label, disabled? }`; `placeholder` agrega una opción vacía deshabilitada.

#### `InputGroup`

`InputGroup` mantiene el markup Bootstrap. Si contiene exactamente un control no-`Fragment`, reenvía `id`, `required`, `disabled` y ARIA a ese control; composiciones más complejas son responsabilidad explícita del caller.

```jsx
<FormField label="Monto" required helpText="En pesos chilenos">
  <InputGroup prepend="$" append="CLP">
    <input name="amount" type="number" className="form-control" min="0" />
  </InputGroup>
</FormField>
```

#### `SearchableSelect`

`SearchableSelect` es un combobox de selección única sin dependencias. `value` lo controla; `defaultValue` inicia el estado no controlado. `onChange(value, option)` recibe el valor primitivo (`string | number`) y la opción original. Si recibe `name`, agrega un input oculto para el submit nativo.

```jsx
const countries = [
  { value: 'cl', label: 'Chile', icon: 'feather-flag' },
  { value: 'ar', label: 'Argentina' },
]

<FormField label="País" required>
  <SearchableSelect
    name="country"
    options={countries}
    placeholder="Buscar país"
    clearable
    onChange={(value, country) => setCountry(value)}
  />
</FormField>
```

Soporta filtrado sin acentos, flechas, Home/End, Enter, Escape, IME, opciones deshabilitadas y `getOptionValue`, `getOptionLabel`, `renderOption` y `renderValue` para modelos propios. `getOptionLabel` y `renderValue` de `SearchableSelect` deben devolver texto: el valor seleccionado vive en un `<input>` nativo. `renderOption` puede devolver contenido React.

#### `MultiSelect`

`MultiSelect` comparte el contrato de opciones, mantiene el menú abierto para seleccionar varias opciones y emite `onChange(values, options)`. `max` limita las selecciones; cada valor seleccionado se publica como un input oculto con el mismo `name`.

```jsx
<FormField label="Etiquetas" helpText="Hasta tres etiquetas">
  <MultiSelect
    name="tags"
    options={tags}
    defaultValue={['urgent']}
    max={3}
    onChange={(values, selectedTags) => setTags(values)}
  />
</FormField>
```

### Tabs

Cada tab tiene `{ key, label, content?, icon? }`, con keys `string | number`.

```jsx
const tabs = [
  { key: 'profile', label: 'Perfil', content: <Profile /> },
  { key: 'security', label: 'Seguridad', icon: 'feather-lock', content: <Security /> },
]

// No controlado: defaultActiveKey solo define la selección inicial.
<Tabs
  tabs={tabs}
  ariaLabel="Secciones del perfil"
  defaultActiveKey="profile"
  onChange={trackTab}
/>

// Controlado: el consumidor actualiza activeKey y reutiliza el heading visible.
<h2 id="profile-tabs-heading">Perfil</h2>
<Tabs tabs={tabs} aria-labelledby="profile-tabs-heading" activeKey={activeKey} onChange={setActiveKey} />
```

Nombrá cada tablist con `ariaLabel`/`aria-label`, o asociándolo a un heading visible mediante `aria-labelledby` (esta última opción tiene prioridad). Sin un nombre explícito, el componente anuncia `Pestañas`.

También admite `className` y `tabClassName`. Implementa asociación tab/panel y navegación por teclado sin Bootstrap JS. Los tracks se ajustan a varias filas en contenedores estrechos para que ningún tab quede recortado; en contenedores amplios conservan el desplazamiento horizontal.

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
- Formularios y datos: `Input`, `Textarea`, `Checkbox`, `Radio`, `FileInput`, `InputGroup`, `SearchableSelect`, `MultiSelect`, `Table`, `ResponsiveTable`, `Pagination` y `DataTableToolbar`.
- Visualización core: stats cards, métricas y links rápidos. Los charts se importan desde `@duralux/ui/charts/*`.
- Chat y conversación: sidebar, ventana, input, typing indicator y message bubbles.
- Layout y shell: `AppLayout`, `AuthLayout`, `PageHeader`, `Footer`, `ShellHeader`, `ShellNav`, `ThemeScope`, `ThemeProvider`, `ConfirmDialog` y extras GranCRM.
- Contratos y utilidades: tipos de sesión/manifest/remotes, tokens y `apiFetch`.

`dist/index.d.ts` se genera desde `src/index.ts`, `src/public/` y las fuentes TypeScript/TSX mediante `vite-plugin-dts`. Toda la API pública tiene props tipadas; `npm run typecheck:public` verifica la experiencia de consumo contra el paquete construido.

## Ejemplos

### Charts por subpath

```jsx
import { ApexChart, ChartCard } from '@duralux/ui/charts/apex'

<ChartCard
  title="Ventas"
  subtitle="Últimos 6 meses"
  actions={[{ id: 'monthly', label: 'Mensual', onClick: () => setRange('month') }]}
>
  <ApexChart
    type="area"
    height={250}
    ariaLabel="Ventas de los últimos seis meses"
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

```jsx
import { AreaChartWidget, ChartCard } from '@duralux/ui/charts/recharts'

<ChartCard title="Conversión">
  <AreaChartWidget
    ariaLabel="Conversión semanal"
    data={[{ name: 'Lun', value: 18 }, { name: 'Mar', value: 24 }]}
    series={[{ key: 'value', label: 'Conversión' }]}
  />
</ChartCard>
```

Los adaptadores entregan fallback SSR, reduced motion, tema, estados de carga/error/vacío y una tabla alternativa accesible por defecto. Para no incluir una tabla, usá `accessibleTable={false}` de manera deliberada.

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

`npm run build` ejecuta el contrato de imports, verifica tokens, genera bundles ESM/CJS y declaraciones, copia/compila estilos y aplica los gates de paquete y tamaño. `npm run typecheck:public` permite repetir la validación de consumo contra un `dist/` ya generado.

```text
src/
  index.ts                 exports públicos y subpaths tipados
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
