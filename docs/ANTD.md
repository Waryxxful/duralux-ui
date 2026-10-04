# antd en @duralux/ui

antd se usa solo para lo que es caro construir a mano: calendarios, rangos de fecha, árboles, cascadas y carga de archivos. Todo lo demás (botones, inputs, selects simples, tablas, modales) es Duralux.

## Instalación (solo en apps que lo necesiten)

```bash
pnpm add antd@^6 dayjs@^1.11
```

`antd` y `dayjs` son dependencias opcionales de `@duralux/ui`: una app que no importa `@duralux/ui/antd` no los descarga. El gate `gate:bundle` impide que entren al bundle raíz.

## Uso

```tsx
import { DuraluxAntdProvider, DateRangeFilter, DatePicker, TreeSelect, Cascader, FileDrop } from '@duralux/ui/antd'

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

## Componentes

| Componente | Defaults Duralux |
|---|---|
| `DatePicker` | `DD-MM-YYYY`, «Selecciona una fecha» |
| `RangePicker` | `DD-MM-YYYY`, «Desde» / «Hasta» |
| `DateRangeFilter` | RangePicker con presets: Hoy, Últimos 7 días, Últimos 30 días, Este mes, Mes anterior |
| `TreeSelect` | búsqueda por título, «Selecciona una opción», nombre accesible desde el placeholder |
| `Cascader` | búsqueda, «Selecciona una opción», nombre accesible desde el placeholder |
| `FileDrop` | `Upload.Dragger` en español; sin `action` no sube nada solo: entrega los archivos en `onChange` |

Todos aceptan las props de antd. Ver Storybook › Componentes › antd.
