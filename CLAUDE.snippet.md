<!-- Copiar este bloque al CLAUDE.md de cualquier app que use el tema Duralux -->

## UI: usar SOLO @duralux/ui

**Regla dura:** toda la UI sale de `@duralux/ui`. NUNCA recrees un componente que ya existe
abajo (botones, cards, tablas, forms, charts, chat, layout). Si parece que falta algo,
primero revisa `node_modules/@duralux/ui/README.md` — ahí están todos los props.

```bash
npm install github:Waryxxful/duralux-ui   # el README completo queda en node_modules/@duralux/ui/
```

```jsx
import { Button, Card, DataTable } from '@duralux/ui'
```

**Catálogo (33 componentes) — usa estos, no inventes equivalentes:**

- **Base:** `Button` `Card` `Badge` `Alert` `Modal` `Tabs` `Avatar` `Timeline` `ProgressRing`
- **Stats:** `StatsCard` `MiniStatCard` `ColoredStatCard`
- **Forms:** `FormField` `Input` `Select` `Textarea`
- **Tablas:** `DataTable`
- **Charts:** `ApexChart` `ChartCard` `AreaChartWidget` `BarChartWidget` `LineChartWidget` `PieChartWidget`
- **Chat:** `ChatBubble` `ChatTypingIndicator` `ChatInputBar` `ChatWindow` `ChatSidebar`
- **Layout:** `AppLayout`

Props de cada uno: tabla en `node_modules/@duralux/ui/README.md`. Demo viva: `http://localhost:5200`.
Antes de escribir un componente nuevo de UI, confirma que no esté en esta lista.
