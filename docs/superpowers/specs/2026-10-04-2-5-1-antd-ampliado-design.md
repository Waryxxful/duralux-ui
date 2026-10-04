# 2.5.1 — `@duralux/ui/antd` ampliado (sub-spec + plan)

Extiende 2.2 (`2026-10-04-2-2-antd-design.md`) por pedido del usuario: Ant Design aporta más de lo que se incluyó. Mismas reglas: antd y dayjs son peers opcionales, el núcleo nunca los importa, tema Duralux en light/dark/navy vía `DuraluxAntdProvider`, textos en español internacional, logging con `src/utils/log.ts`.

## Criterio

Se envuelve lo que el sistema **no tiene** o tiene peor. No se duplica lo que ya existe en Duralux: Table (DataTable/TanStack), Modal, Drawer, Tooltip, Tabs, Dropdown, Steps, message/notification (toasts), Form, Card, Descriptions, Statistic.

## Alcance

| Export | Defaults Duralux | Primer uso |
|---|---|---|
| `RangeSlider` | `Slider range`, min 0 / max 100, tooltip con el valor, `aria-label` obligatorio por cada manija | Call Reviews: score mín./máx. en «Llamadas» |
| `Transfer` | Búsqueda activada, títulos «Disponibles» / «Seleccionados», textos de lista en español | `/sa/users` (permisos, módulos) |
| `CheckTree` | `Tree checkable`, búsqueda opcional | Permisos jerárquicos |
| `Splitter` | Re-export con tamaños mínimos sensatos | Patrón «Bandeja» de 2.6 |
| `TimePicker` | Formato `HH:mm`, placeholder «Selecciona una hora»; `TimeRangePicker` con «Desde» / «Hasta» | Horarios y ventanas |
| `Calendar` | Locale es, semana desde lunes | Actividad por día |
| `Tour` | Botones «Anterior», «Siguiente», «Finalizar» | Reemplaza el tour a mano de Call Reviews |
| `AutoComplete` | Placeholder «Escribe para buscar…», `aria-label` desde placeholder | Búsqueda con sugerencias |
| `Mentions` | Prefijo `@`, «Sin coincidencias» | Comentarios y notas |
| `NumberInput` | `InputNumber` con separador de miles es-CL (`.`) y decimal `,`; prop `suffix` | Montos y porcentajes |
| `ColorPicker` | Presets con la paleta de tokens | Marca y etiquetas por cuenta |
| `ImagePreview` | `Image` con visor y textos en español | Adjuntos y capturas |

## Tareas

1. `src/antd/*.tsx` + exports en `src/antd/index.ts` y tipos.
2. Tests mínimos: un solo archivo con lo que no se ve en una story (defaults que cambian comportamiento). Sin tests por cada default de texto.
3. Stories en «Componentes/antd», tres temas, una por componente; caso dentro de Modal para los que abren popup.
4. `docs/ANTD.md`: catálogo completo, criterio de qué se envuelve y qué no.
5. Gates: bundle (el root no menciona antd/dayjs), paquete, doctor ≥ 75, sin `import()` dinámicos propios.
6. Integración en Call Reviews (fuera de la librería): RangeSlider en «Llamadas», DateRangeFilter en Agentes/Tendencias/detalle de agente, DatePicker + FileDrop en «Nueva llamada», Tour. Verificación en DEV en los tres temas.
