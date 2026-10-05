# antd en @duralux/ui

antd se usa solo para lo que es caro construir a mano: calendarios, rangos de fecha y hora, árboles, cascadas, carga de archivos, sliders de rango, listas de transferencia, paneles redimensionables, recorridos guiados, menciones, selector de color y visor de imágenes. Todo lo demás (botones, inputs, selects simples, tablas, modales) es Duralux.

## Criterio: qué se envuelve y qué no

Se envuelve lo que el sistema **no tiene** o tiene peor. Cada export es un wrapper fino: defaults Duralux (textos en español internacional, formatos, nombres accesibles) y el resto de las props de antd pasa tal cual.

**No se envuelve** (ya existe en `@duralux/ui`; usar el componente Duralux):

| antd | Duralux |
|---|---|
| `Table` | `DataTable` (TanStack) |
| `Modal`, `Drawer` | `Modal`, `Drawer` (2.5) |
| `Dropdown`, `Tabs`, `Steps` | `Dropdown`, `Tabs`, `ProcessSteps` |
| `Tooltip`, `Segmented`, `Switch` | `Tooltip`, `Segmented`, `Switch` (2.5) |
| `message`, `notification` | `Toast` |
| `Form` | `FormField` + controles Duralux |
| `Card`, `Descriptions`, `Statistic` | `Card`, `DescriptionList`, `KpiCard` / `MiniStatCard` |

Si un componente de antd no aparece en el catálogo, no se importa directo en las apps: se propone aquí primero.

## Instalación (solo en apps que lo necesiten)

```bash
pnpm add antd@^6 dayjs@^1.11
```

`antd` y `dayjs` son dependencias opcionales de `@duralux/ui`: una app que no importa `@duralux/ui/antd` no los descarga. El gate `gate:bundle` impide que entren al bundle raíz.

## Uso

```tsx
import { DuraluxAntdProvider, DateRangeFilter, RangeSlider, NumberInput, Tour } from '@duralux/ui/antd'

<DuraluxAntdProvider>
  <DateRangeFilter onChange={setRango} />
</DuraluxAntdProvider>
```

`DuraluxAntdProvider`:
- toma el tema resuelto de `ThemeProvider` (claro, oscuro, navy) o el prop `theme`;
- aplica los tokens (`src/generated/antd-theme.ts`): colores, superficies, radios 4/6/8, alturas 32/36/40, Inter, sombras, duraciones, placeholders con contraste AA;
- locale español (`es_ES`, dayjs `es`, semana desde el lunes);
- popups con `zIndexPopupBase` = `--gcu-z-popover` (1070): un DatePicker dentro de un Modal Duralux se ve encima.

En una app con Module Federation, monta un solo `DuraluxAntdProvider` cerca de la raíz de la vista que usa antd.

## Catálogo

| Componente | Defaults Duralux |
|---|---|
| `DatePicker` | `DD-MM-YYYY`, «Selecciona una fecha» |
| `RangePicker` | `DD-MM-YYYY`, «Desde» / «Hasta» |
| `DateRangeFilter` | RangePicker con presets: Hoy, Últimos 7 días, Últimos 30 días, Este mes, Mes anterior |
| `TreeSelect` | búsqueda por título, «Selecciona una opción», nombre accesible desde el placeholder |
| `Cascader` | búsqueda, «Selecciona una opción», nombre accesible desde el placeholder |
| `FileDrop` | `Upload.Dragger` en español; sin `action` no sube nada solo: entrega los archivos en `onChange` |
| `RangeSlider` | `Slider range`, 0–100, valor en el tooltip; `handleLabels: [mín, máx]` **obligatorio** (nombre accesible de cada manija); sin valor parte en `[min, max]` |
| `NumberInput` | `InputNumber` con formato es-CL (`1.234.567,5`); respeta lo tecleado y normaliza al salir; `prefix` / `suffix` de antd. Helpers `formatNumberEsCL` / `parseNumberEsCL` |
| `TimePicker` | `HH:mm`, «Selecciona una hora» |
| `TimeRangePicker` | `HH:mm`, «Desde» / «Hasta» |
| `Calendar` | textos en español aunque falte el provider; semana desde el lunes vía dayjs `es`, que fija `DuraluxAntdProvider` |
| `Transfer` | búsqueda, «Disponibles» / «Seleccionados», «Buscar…», «elemento(s)», «Sin resultados»; `render` por defecto = `title` |
| `CheckTree` | `Tree checkable`; con `searchable`, buscador que resalta coincidencias (sin distinguir tildes) y expande sus ramas. Expansión con `defaultExpandedKeys` o `expandedKeys` propio (`defaultExpandAll` no aplica) |
| `Splitter` | `Splitter.Panel` sin `min` recibe 160 px (`SPLITTER_PANEL_MIN`) |
| `Tour` | «Anterior», «Siguiente» y «Finalizar» en cada paso, aunque un `ConfigProvider` anidado cambie el locale |
| `AutoComplete` | «Escribe para buscar…», nombre accesible desde el placeholder |
| `Mentions` | prefijo `@`, «Sin coincidencias» |
| `ColorPicker` | presets «Paleta Duralux» (tono 500 de cada familia de tokens, `duraluxColorPresets`) |
| `ImagePreview` | `Image` con visor; «Ver» sobre la miniatura y botones del visor rotulados en español (Acercar, Girar a la izquierda…); las flechas entre imágenes de un grupo siguen con el rótulo de antd |

Todos aceptan las props de antd. Los que abren popup (pickers, AutoComplete, Mentions, ColorPicker, Tour) se ven sobre un `Modal` Duralux gracias a `zIndexPopupBase`. Valores inválidos (rango fuera de `min`/`max`, número no interpretable, `Tour` sin pasos, imagen sin `alt`) se avisan con `log.warn` (`[duralux]`, solo fuera de producción). Ver Storybook › Componentes › antd.
