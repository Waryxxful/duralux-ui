# AGENTS.md — guía para agentes de IA y desarrolladores nuevos

Lee esto antes de crear o modificar cualquier pantalla del ecosistema GranCRM o un componente de esta librería.

## Qué es

`@duralux/ui` es el design system de In-Touch: componentes React, tokens (`--gcu-*`) y reglas compartidos por todas las apps GranCRM (shell y satélites cargados por Module Federation). Las apps lo consumen por GitHub + SHA (`github:Waryxxful/duralux-ui#<sha>`), no desde npm.

| Import | Contenido |
|---|---|
| `@duralux/ui` | Componentes, layout, shell, `ThemeProvider`, `log`, `apiFetch`, contrato |
| `@duralux/ui/charts/apex` · `/charts/recharts` | Gráficos (peers opcionales) |
| `@duralux/ui/antd` | Wrappers antd tematizados (peers opcionales `antd`, `dayjs`) |
| `@duralux/ui/styles/grancrm-ui.css` (+ `bootstrap.css`, `theme.css`) | Estilos: se necesitan los tres |

Catálogo legible por máquina: [`docs/manifest.json`](docs/manifest.json) (categoría, cuándo usar, cuándo no, alternativa). Versión humana: [`docs/MANIFEST.md`](docs/MANIFEST.md).

## Cómo elegir componente

Empieza por la necesidad, no por el nombre. Si dudas, busca en `docs/manifest.json`.

| Necesito… | Usa | No uses |
|---|---|---|
| **Dato:** listado operativo con orden, selección o acciones | `DataTable` (+ `BulkBar`, `ActiveFilters`) | `<table>` crudo, `Table` si hay orden/selección |
| Dato: tabla simple de lectura | `Table` | `<table>` crudo |
| Dato: una cifra con contexto | `KpiCard`, `StatGroup`, `StatsCard` | número suelto sin meta ni variación |
| Dato: pares etiqueta/valor | `DescriptionList` | grilla manual de `<div>` |
| Dato: tendencia o distribución | `ChartCard` + `charts/apex` (`TrendLine`, `Sparkline`, `Donut`, `Gauge`) | colores hex en opciones del gráfico |
| **Acción:** principal o secundaria | `Button` (una sola `primary` por vista; el resto `light-brand`) | `btn-outline-*`, `btn-secondary` |
| Acción: solo icono | `IconButton` con `label` | `<button>` con icono sin nombre |
| Acción: menú de acciones | `Dropdown` | menú Bootstrap a mano |
| Acción destructiva | `ConfirmDialog` (texto que nombra el objeto) | `window.confirm` |
| **Formulario:** campo con etiqueta, ayuda y error | `FormField` + `Input`/`Select`/`Textarea` | `<label>` + `<input>` sueltos |
| Formulario: opciones excluyentes visibles | `RadioGroup`, `Segmented`, `ChoiceCard` | varios `Checkbox` |
| Formulario: búsqueda en lista larga | `SearchableSelect`, `MultiSelect` | `<select>` nativo con cientos de opciones |
| Formulario: fecha, rango de fechas, hora | `@duralux/ui/antd`: `DatePicker`, `DateRangeFilter`, `TimePicker` | `<input type="date">`, `<select>` de «Últimos 7 días» |
| Formulario: número con formato es-CL, árbol, cascada, archivos | `/antd`: `NumberInput`, `TreeSelect`, `Cascader`, `FileDrop` | parseo manual |
| **Navegación:** encabezado de página | `PageHeader` (título, breadcrumbs, acciones), sticky por defecto desde 2.6, con sombra al quedar pegado (`PAGE-STRUCTURE.md`) | `<h1>` suelto, CSS sticky propio |
| Navegación: secciones dentro de una vista | `Tabs`, `Accordion` | botones que simulan pestañas |
| Navegación: accesos rápidos | `QuickTiles`, `QuickLinkGrid` | tarjetas manuales |
| Navegación: shell (header, menú, tema) | `ShellHeader`, `ShellNav`, `ThemeScope` | `.app-skin-dark` a mano |
| **Feedback:** resultado de una acción | `Toast` | `alert()` |
| Feedback: mensaje persistente en la vista | `Alert` | `div.alert` crudo |
| Feedback: carga | `Skeleton`, `LoadingState variant="skeleton"`, `Spinner` (en línea) | spinner a pantalla completa |
| Feedback: vacío o error | `EmptyState`, `ErrorState` (con acción y reintento) | tabla vacía muda |
| Feedback: panel o diálogo | `Drawer`, `Modal` | `Modal` de antd |
| Feedback: ayuda breve | `Tooltip` | `title` como única explicación |
| **IA:** conversación | `ChatWindow`, `ChatSidebar`, `ChatInputBar`, `MessageBubble` | burbujas propias |
| IA: bloques de asistente y agente (2.8) | Pendientes de integración: ver «próximos» en el manifiesto | inventarlos en la app |

Si falta un componente genérico, se agrega en esta librería, no en la app.

## Reglas duras

- **Tokens:** color, espacio, radio, sombra, duración y capa solo con `var(--gcu-*)`. Nunca hex, `rgb()` ni px mágicos en `style` o CSS. Nada de `!important` ni overrides `.app-skin-dark` nuevos: los tokens ya cambian por tema (claro, oscuro, navy).
- **Canon Duralux:** prohibido `btn-outline-*`, `btn-secondary`, `table-striped`, `bg-{tono}-100` (el gate `audit-contract` lo bloquea).
- **Accesibilidad:** WCAG 2.2 AA, patrón ARIA APG, teclado completo, `:focus-visible` siempre visible, nombre accesible en todo control (`IconButton label`).
- **Texto visible en español internacional con tuteo** («Selecciona», «Puedes»). Nunca voseo («Seleccioná», «Podés»), emoji ni nombres internos (tablas, SP, «payload»).
- **Contenido:** toda cifra con contexto; números con `tabular-nums` y formato es-CL; estados completos (cargando, vacío con acción, error con reintento).
- **Logging:** errores, fallbacks y deprecaciones con `log` / `deprecate` de `@duralux/ui` (prefijo `[duralux]`). Sin datos personales en logs.
- **Imports:** solo desde los entrypoints públicos. Nunca `@duralux/ui/dist/…` ni `/src/…`.
- **antd solo vía `@duralux/ui/antd`**, dentro de un `DuraluxAntdProvider`. Nunca `import … from 'antd'` en el núcleo ni en las apps (si falta un wrapper, se propone en `docs/ANTD.md`).
- **Tree-shaking:** en la librería, todo `forwardRef`/`memo`/`Object.assign` a nivel de módulo lleva `/* @__PURE__ */`; nada de asignaciones sueltas a nivel de módulo.
- **Sin `import()` dinámicos en la librería:** rompen los remotos de Module Federation (`gate:bundle` lo verifica). Las apps pueden usar `lazy()` en sus rutas.
- **Temas:** `ThemeProvider` maneja `light | dark | navy | system` y fija `data-gcu-theme` en `<html>`. No toques `.app-skin-dark` a mano; para un subárbol usa `ThemeScope`. Para saber si la UI está oscura usa `dark` o `resolved`, no `mode === 'dark'`.
- **API congelada en 3.x:** solo se agregan props; lo reemplazado pasa por `deprecate()` y se elimina en la siguiente mayor (4.0). 3.0 retiró todo lo deprecado en 2.x (tabla en `docs/migracion/README.md`). `src/contract.ts` no cambia.

## Receta para un componente

Resumen de [`docs/RECETA-COMPONENTE.md`](docs/RECETA-COMPONENTE.md) (ejemplar: `Button`):

1. Test de comportamiento primero (`test/<Componente>.refined.test.tsx`).
2. TSX con `forwardRef`, tipos en `src/public/types.ts`, export directo en `src/public/components.ts`.
3. CSS propio en `src/styles/components/<nombre>.css` solo con tokens; borrar las reglas viejas (el presupuesto CSS solo baja).
4. Estados completos, a11y APG, detalles de oficio y responsivo por contenedor (`docs/REGLAS-DE-DISENO.md` §6, §10–§12).
5. Logging con `log`/`deprecate`.
6. Story en `stories/componentes/<Área>/` revisada en claro, oscuro y navy.
7. Agregar la entrada a `docs/manifest.json` y cerrar defectos en `docs/auditoria/DEFECTOS.md`.

## Verificación

```bash
npm test -- <archivo>   # nunca npx vitest; este repo usa npm, no pnpm
npm run build           # contrato, tokens AA, presupuesto CSS, bundle, paquete, tipos y react-doctor
npm run storybook       # revisión visual en claro, oscuro y navy
```

En una app consumidora: build de la app, revisión visual en DEV en los tres temas y SHA de `@duralux/ui` alineado con el shell (ver `docs/migracion/README.md`).

## Referencias

- `docs/PRINCIPIOS.md`, `docs/REGLAS-DE-DISENO.md`, `docs/PATRONES.md` (estructura de página), `docs/TOKENS.md`, `docs/ICONOGRAFIA.md`, `docs/ANTD.md`
- `docs/manifest.json` / `docs/MANIFEST.md` (catálogo) y `docs/migracion/` (guía por app)
- `tokens/tokens.json` (fuente de tokens) y `docs/auditoria/DEFECTOS.md` (defectos conocidos)
- `CHANGELOG.md` (qué cambió en cada versión)
