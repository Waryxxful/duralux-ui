# @duralux/ui

Librería de componentes React para el stack Duralux (Bootstrap 5 + tema Duralux CSS). Construida con Vite lib mode, lista para importar en cualquier proyecto que ya tenga los estilos Duralux.

## Instalación

```bash
# Instalar desde GitHub
npm install github:Waryxxful/duralux-ui

# Instalar con una versión específica (tag o commit)
npm install github:Waryxxful/duralux-ui#v0.1.0
```

> El `prepare` script corre `vite build` automáticamente al instalar, no necesitas construir manualmente.

## Uso

```jsx
import { Button, Card, StatsCard, DataTable, ApexChart } from '@duralux/ui'
```

El proyecto host **debe** tener los estilos Duralux cargados (los mismos del template `duralux-admin/`). Las clases CSS como `nxl-*`, `bg-soft-*`, `feather-*` vienen de esos estilos, no de este paquete.

## Componentes disponibles

### UI Base

| Componente | Props principales |
|---|---|
| `Button` | `variant`, `size`, `icon`, `loading`, `disabled` |
| `Card` | `title`, `subtitle`, `headerRight`, `footer`, `noPadding` |
| `Badge` | `variant`, `soft`, `pill` |
| `Alert` | `variant`, `title`, `dismissible`, `icon` |
| `Modal` | `show`, `onHide`, `title`, `size`, `footer` |
| `Tabs` | `tabs=[{key,label,icon}]`, `activeKey`, `onChange`, `children` |
| `Avatar` | `src`, `name`, `size`, `bg`, `status` |
| `Timeline` | `items=[{icon, iconBg, title, subtitle, time, content}]` |
| `ProgressRing` | `value`, `size`, `color`, `label` |

### Stats / KPI

| Componente | Props principales |
|---|---|
| `StatsCard` | `icon`, `value`, `label`, `trend`, `progress` |
| `MiniStatCard` | `icon`, `value`, `label`, `color` |
| `ColoredStatCard` | `icon`, `value`, `label`, `trend`, `trendUp`, `bg` |

### Formularios

| Componente | Props |
|---|---|
| `FormField` | `label`, `htmlFor`, `error`, `hint`, `required` |
| `Input` | `icon`, `invalid` + props nativos |
| `Select` | `options` (string[] o {value,label}[]), `invalid` |
| `Textarea` | `rows`, `invalid` + props nativos |

### Datos

| Componente | Props principales |
|---|---|
| `DataTable` | `columns`, `data`, `rowKey`, `selectable`, `pageSize`, `actions`, `onSelectionChange` |

### Charts — ApexCharts

| Componente | Props |
|---|---|
| `ApexChart` | `type`, `options`, `series`, `height`, `width` |
| `ChartCard` | `title`, `subtitle`, `actions`, `children` |

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
| `Header` | (interno, usado por AppLayout) |
| `Sidebar` | `navItems` (interno, usado por AppLayout) |
| `PageHeader` | `title`, `breadcrumbs`, `children` |

## Showcase (demo)

Para ver todos los componentes con preview y código copiable:

```bash
git clone https://github.com/Waryxxful/duralux-ui
cd duralux-ui
npm install
npm run dev:demo
# → http://localhost:5200
```

## Build de la librería

```bash
npm run build
# → dist/index.js (ESM)
# → dist/index.cjs (CJS)
```

## Peer dependencies

```json
{
  "react": ">=18",
  "react-dom": ">=18"
}
```

`react-router-dom` se usa internamente en `AppLayout`/`Sidebar`/`Header` — es opcional si no usas esos componentes.

## Stack

- React 18
- Vite 6 (lib mode)
- Bootstrap 5 + Duralux CSS (asumido en el host)
- ApexCharts via `react-apexcharts`
- Recharts (para los *Widget wrappers)
