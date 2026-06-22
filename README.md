# @duralux/ui

Librería de componentes React construida sobre el tema Duralux (Bootstrap 5). Lista para usar en cualquier proyecto que tenga los estilos Duralux cargados.

**33 componentes** · **6 categorías** · Vite lib mode (ESM + CJS) · Demo showcase incluida

---

## Instalación

```bash
npm install github:Waryxxful/duralux-ui
```

> El script `prepare` ejecuta `vite build` automáticamente al instalar — no necesitas construir manualmente.

El proyecto host necesita los estilos Duralux en su `index.html`:

```html
<link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
<link rel="stylesheet" href="/assets/vendors/css/vendors.min.css" />
<link rel="stylesheet" href="/assets/css/theme.min.css" />
```

---

## Uso

```jsx
import { Button, Card, StatsCard, DataTable, ApexChart } from '@duralux/ui'

function MiPagina() {
  return (
    <Card title="Clientes" headerRight={<Button variant="primary" icon="feather-plus">Nuevo</Button>}>
      <DataTable columns={columns} data={data} rowKey="id" selectable pageSize={10} />
    </Card>
  )
}
```

---

## Componentes

### UI Base

| Componente | Props principales |
|---|---|
| `Button` | `variant`, `size`, `icon`, `loading`, `disabled`, `as`, `href` |
| `Card` | `title`, `subtitle`, `headerRight`, `footer`, `noPadding` |
| `Badge` | `variant`, `soft`, `pill` |
| `Alert` | `variant`, `title`, `dismissible`, `icon` |
| `Modal` | `show`, `onHide`, `title`, `size`, `footer` |
| `Tabs` | `tabs=[{key,label,icon}]`, `activeKey`, `onChange` |
| `Avatar` | `src`, `name`, `size`, `bg`, `status` |
| `Timeline` | `items=[{icon,iconBg,title,subtitle,time,content}]` |
| `ProgressRing` | `value`, `size`, `color`, `label` |

`variant` acepta: `primary` · `secondary` · `success` · `danger` · `warning` · `info` · `light-brand`

### Stats / KPI

| Componente | Props principales |
|---|---|
| `StatsCard` | `icon`, `iconBg`, `value`, `label`, `trend={value,up}`, `progress={value,color,label}` |
| `MiniStatCard` | `icon`, `value`, `label`, `color` |
| `ColoredStatCard` | `icon`, `value`, `label`, `trend`, `trendUp`, `bg` |

### Formularios

| Componente | Props |
|---|---|
| `FormField` | `label`, `htmlFor`, `error`, `hint`, `required` |
| `Input` | `icon`, `invalid` + todos los props nativos de `<input>` |
| `Select` | `options` (`string[]` ó `{value,label}[]`), `invalid` |
| `Textarea` | `rows`, `invalid` + props nativos de `<textarea>` |

### Datos

| Componente | Props principales |
|---|---|
| `DataTable` | `columns`, `data`, `rowKey`, `selectable`, `pageSize`, `actions`, `onSelectionChange` |

`columns`: `{ key, label, sortable?, render?(row) => ReactNode }`  
`actions`: `[{ label, icon, onClick(row) }]`

### Charts — ApexCharts

| Componente | Props |
|---|---|
| `ApexChart` | `type`, `options`, `series`, `height`, `width` |
| `ChartCard` | `title`, `subtitle`, `actions=[{label,onClick}]`, `children` |

`type` acepta cualquier tipo de ApexCharts: `area` · `bar` · `line` · `donut` · `pie` · `radialBar` · `heatmap`

### Charts — Recharts (wrappers rápidos)

| Componente | Props |
|---|---|
| `AreaChartWidget` | `data`, `series=[{key,color,label}]`, `height` |
| `BarChartWidget` | `data`, `series`, `height`, `stacked` |
| `LineChartWidget` | `data`, `series`, `height` |
| `PieChartWidget` | `data=[{name,value,color}]`, `donut`, `height` |

### Chat

| Componente | Props |
|---|---|
| `ChatBubble` | `message={id,text,time,sender,mine}` |
| `ChatTypingIndicator` | `name` |
| `ChatInputBar` | `onSend`, `placeholder` |
| `ChatWindow` | `contact={name,avatar,online,role}`, `children` |
| `ChatSidebar` | `contacts`, `selectedId`, `onSelect`, `onSearch` |

### Layout

| Componente | Props |
|---|---|
| `AppLayout` | `navItems`, `user`, `notifications`, `children` |
| `AuthLayout` | `children` |
| `Header` | (interno — usado por AppLayout) |
| `Sidebar` | (interno — usado por AppLayout) |
| `PageHeader` | `title`, `breadcrumbs=[{label,href}]`, `children` |

`navItems` acepta `{ type:'caption', label }` para separadores y `{ icon, label, to }` ó `{ icon, label, children:[...] }` para items con sub-menú.

---

## Ejemplos

### Stats + Tabla

```jsx
import { StatsCard, Card, DataTable, Badge } from '@duralux/ui'

const COLUMNS = [
  { key: 'name', label: 'Cliente', sortable: true },
  { key: 'status', label: 'Estado',
    render: (row) => <Badge variant="success" soft>{row.status}</Badge> },
]

export function ClientesPage() {
  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatsCard icon="feather-users" value="1,254" label="Total Clientes"
            trend={{ value: '+12%', up: true }} />
        </div>
      </div>
      <Card>
        <DataTable columns={COLUMNS} data={clientes} rowKey="id" selectable pageSize={10}
          actions={[{ label: 'Ver', icon: 'feather-eye', onClick: (r) => navigate(`/clientes/${r.id}`) }]} />
      </Card>
    </>
  )
}
```

### Chart con Card

```jsx
import { ChartCard, ApexChart } from '@duralux/ui'

<ChartCard title="Ventas" subtitle="Últimos 6 meses"
  actions={[{ label: 'Mensual', onClick: () => {} }]}>
  <ApexChart type="area" height={250}
    options={{
      colors: ['#3454d1'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
      xaxis: { categories: ['Ene','Feb','Mar','Abr','May','Jun'] },
      dataLabels: { enabled: false },
      grid: { borderColor: '#f1f5f9' },
      chart: { toolbar: { show: false } },
    }}
    series={[{ name: 'Ventas', data: [31, 40, 28, 51, 42, 82] }]}
  />
</ChartCard>
```

### AppLayout completo

```jsx
import { AppLayout } from '@duralux/ui'
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom'

const NAV = [
  { type: 'caption', label: 'Principal' },
  { icon: 'feather-airplay', label: 'Dashboards', children: [
    { label: 'CRM', to: '/', end: true },
    { label: 'Analytics', to: '/analytics' },
  ]},
  { icon: 'feather-users', label: 'Clientes', to: '/clientes' },
  { icon: 'feather-briefcase', label: 'Proyectos', to: '/proyectos' },
]

const USER = {
  name: 'Admin', email: 'admin@empresa.cl',
  avatar: '/assets/images/avatar/1.png',
  menuItems: [
    { label: 'Mi Perfil', icon: 'feather-user', href: '#' },
    { divider: true },
    { label: 'Cerrar Sesión', icon: 'feather-log-out', href: '/login' },
  ],
}

const router = createBrowserRouter([{
  element: <AppLayout navItems={NAV} user={USER}><Outlet /></AppLayout>,
  children: [
    { path: '/', element: <DashboardPage /> },
    { path: '/clientes', element: <ClientesPage /> },
  ],
}])

export default function App() {
  return <RouterProvider router={router} />
}
```

---

## Showcase (demo local)

```bash
git clone https://github.com/Waryxxful/duralux-ui
cd duralux-ui
npm install
npm run dev:demo
# → http://localhost:5200
```

17 páginas interactivas con preview en vivo y código copiable para cada componente.

---

## Desarrollo de la librería

```bash
npm install
npm run build          # → dist/index.js (ESM) + dist/index.cjs (CJS)
npm run dev:demo       # showcase en localhost:5200
```

### Estructura

```
src/
├── index.js                    ← barrel export (33 componentes)
├── components/
│   ├── ui/                     ← Button, Card, Badge, Modal, Tabs, Avatar, Alert, Timeline, ProgressRing
│   ├── form/                   ← FormField, Input, Select, Textarea
│   ├── data/                   ← DataTable
│   ├── charts/                 ← ApexChart, ChartCard, *Widget (Recharts)
│   ├── chat/                   ← ChatBubble, ChatInputBar, ChatWindow, ChatSidebar
│   └── layout/                 ← AppLayout, AuthLayout, Header, Sidebar, PageHeader
└── hooks/
    └── useClickOutside.js

demo/
├── src/
│   ├── App.jsx                 ← 17 rutas
│   ├── ShowcaseLayout.jsx      ← sidebar de navegación
│   ├── ShowcaseSection.jsx     ← preview + CodeBlock
│   └── pages/                  ← una página por componente/categoría
└── vite.config.js              ← alias @duralux/ui → ../src/index.js
```

---

## Peer dependencies

```json
{
  "react": ">=18",
  "react-dom": ">=18"
}
```

`react-router-dom` se requiere si usas `AppLayout`, `Sidebar` o `Header`.

## Stack

React 18 · Vite 6 · Bootstrap 5 + Duralux CSS · ApexCharts · Recharts
