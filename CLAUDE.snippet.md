<!-- Copiar este bloque al CLAUDE.md de cualquier app que use el tema Duralux -->

## UI: usar SOLO @duralux/ui

**Regla dura:** toda la UI sale de `@duralux/ui`. NUNCA recrees un componente que ya existe
en el paquete (botones, cards, tablas, forms, charts, chat, layout). Si falta una pieza
genérica y reutilizable, se agrega a `@duralux/ui`; no se copia ni se implementa en la satélite.
La app conserva únicamente componentes específicos de su dominio.

```bash
npm install github:Waryxxful/duralux-ui   # el README completo queda en node_modules/@duralux/ui/
```

```jsx
import { Button, Card, DataTable, Dropdown } from '@duralux/ui'
```

El catálogo evoluciona. La fuente de verdad es el barrel del paquete, sus tipos y
`node_modules/@duralux/ui/README.md`. Familias principales:

- **Base:** `Button` `LinkButton` `IconButton` `Icon` `Card` `Badge` `Alert` `Modal` `Tabs` `Avatar` `Timeline` `ProgressRing` `Progress` `Dropdown` `DropdownMenu`
- **Feedback:** `EmptyState` `ErrorState` `LoadingState` `Toast`
- **Stats:** `StatsCard` `MiniStatCard` `ColoredStatCard`
- **Forms:** `FormField` `Input` `Select` `Textarea` `Checkbox` `Radio` `FileInput` `InputGroup`
- **Tablas:** `DataTable` `Table` `ResponsiveTable` `Pagination`
- **Charts:** `ApexChart` `ChartCard` `AreaChartWidget` `BarChartWidget` `LineChartWidget` `PieChartWidget`
- **Chat:** `ChatBubble` `ChatTypingIndicator` `ChatInputBar` `ChatWindow` `ChatSidebar`
- **Layout y shell:** `AppLayout` `AuthLayout` `PageHeader` `ShellHeader` `ShellNav` `ThemeScope` `ConfirmDialog`

Antes de escribir UI nueva, buscá el export y revisá los contratos del README y de TypeScript.
Demo viva: `http://localhost:5200`.
