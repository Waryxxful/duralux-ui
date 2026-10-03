# Changelog

Los cambios notables de `@duralux/ui` se registran aquí. Este archivo describe el contenido del commit de preparación; la publicación requiere crear el tag `v2.0.0` después de que CI valide el commit.

## 2.1.0 — Fundaciones del design system

Primera entrega de la serie 2.x (spec `docs/superpowers/specs/2026-10-03-duralux-design-system-design.md`). Sin cambios incompatibles: el contrato shell ↔ satélite no cambia.

### Agregado

- **Tokens DTCG** (`tokens/tokens.json`): paletas OKLCH 50–950, roles semánticos por tema, escalas de espaciado, radios, alturas de control, tipografía, elevación, movimiento y capas. Se exportan como `@duralux/ui/tokens.json`, `@duralux/ui/tokens.css` y `designTokens` (TS). `tokens:check` exige contraste AA en los tres temas.
- **Temas en runtime:** `ThemeMode` = `light | dark | navy | system`. `ThemeProvider` fija `data-gcu-theme` en `<html>` (y `.app-skin-dark` en dark y navy); `system` sigue al sistema operativo en caliente. `ThemeScope` acepta `navy`. Los gráficos (Apex y Recharts) tienen paleta navy.
- **Iconos Tabler:** `Icon`, `Button` (`startIcon`/`endIcon`) e `IconButton` aceptan un elemento como `<IconRobot />` además del nombre Feather. Tipo público `IconSlot`.
- `log` y `deprecate` exportados desde la raíz (prefijo `[duralux]`).
- **Storybook** con Fundamentos (color, tipografía, espaciado, radios y elevación, motion, iconografía) y selector de tema. Docker publica Storybook.
- Documentación: `docs/PRINCIPIOS.md`, `docs/REGLAS-DE-DISENO.md`, `docs/TOKENS.md`, `docs/ICONOGRAFIA.md`, `AGENTS.md` y `docs/auditoria/DEFECTOS.md`.
- Gates: presupuesto de deuda CSS por archivo, hex inline prohibido en componentes y react-doctor ≥ 60.

### Cambiado (visible)

- Refinamiento visual global desde tokens: botones e inputs de 36 px alineados (32/40 en sm/lg), radios 6 (controles) y 12 (modales), cards con borde fino y elevación suave, anillo de foco único solo con teclado, presión con escala, entrada animada de dropdowns y modales, `::selection`, números tabulares y títulos balanceados.
- Inter Variable autoalojada; ya no se carga Google Fonts.
- Los overrides de Bootstrap se importan antes de sus variables: radios, `form-select` (mismo tamaño que `form-control`) y estados de validación salen de los tokens.

### Corregido

- Contraste AA de `code`, texto de ayuda, `.text-muted` y feedback inválido en claro y oscuro (DX-001, DX-002, DX-003).
- `Select` con tamaño de fuente distinto al de `Input` (DX-009).
- Un tema guardado desconocido ya no se pierde en silencio: cae en `light` con aviso (DX-012).

### Migración

- Actualiza el SHA de `@duralux/ui` y revisa visualmente tus pantallas en claro y oscuro.
- Si tu app incrusta `THEME_HEAD_SNIPPET`, vuelve a copiarlo: ahora fija `data-gcu-theme`.
- Si usas `useTheme().mode` para decidir colores, usa `resolved` (`mode` puede ser `system`).

## 2.0.0 — preparación de release

### Cambios incompatibles

- Los componentes y motores de charts ya no se exportan desde `@duralux/ui`. Actualizá los imports a `@duralux/ui/charts/apex` o `@duralux/ui/charts/recharts`.
- `apexcharts`, `react-apexcharts` y `recharts` son peer dependencies opcionales. Instalá sólo los peers del subpath que uses.
- El paquete declara ESM (`"type": "module"`) y mantiene entradas CJS mediante `exports`; los consumidores deben importar subpaths públicos, no archivos internos de `dist/`.
- Las declaraciones públicas ahora reflejan los contratos reales. En particular, labels y placeholders de selects avanzados son texto (`string | number`), y `renderValue` de `SearchableSelect` debe devolver texto porque se muestra en un input nativo.
- `FormField` ya no infiere que cualquier wrapper React es un control. Los wrappers propios que reenvían props deben declarar `duraluxFormControl = true`; los wrappers visuales dejan de recibir atributos de input por accidente.

### Agregado

- `SearchableSelect`: selección única buscable, combobox accesible, teclado/IME, valores controlados o no controlados, limpieza opcional y submit nativo mediante `name`.
- `MultiSelect`: búsqueda, chips eliminables, `max`, teclado y un input oculto por valor seleccionado.
- `InputGroup` con reenvío conservador de semántica de campo al único control hijo.
- `DataTableToolbar`, `CardLoader`, `AvatarGroup`, `Footer` y mejoras de catálogo.
- Tokens semánticos generados y verificables para TypeScript, SCSS y CSS runtime.
- Entrypoints `@duralux/ui/charts`, `@duralux/ui/charts/apex` y `@duralux/ui/charts/recharts`.

### Mejorado

- Contraste, dark mode, foco, reduced motion, SSR, estados de carga/error/vacío y tablas alternativas accesibles de charts.
- Modal, toast, formularios, tablas, paginación, shell, chat, dropdown, botones y API `apiFetch`.
- `apiFetch` conserva `Response`, `credentials: 'same-origin'`, todas las formas de `HeadersInit` y sólo serializa JSON cuando corresponde; también reexporta `SESSION_EXPIRED_EVENT` como alias de compatibilidad para el evento 401.
- Empaquetado, declaraciones TypeScript, tree-shaking y gates de contrato/tamaño.
- El lifecycle `prepare` evita la recursión de empaquetado de npm 10 en Node 20/22; `deploy.sh` detecta Docker Compose v2 y el binario legacy.
- El peer opcional `apexcharts` acepta las ramas 5 y 6, compatibles con `react-apexcharts` 2.1.1.
- Se restauran los tipos públicos `Breadcrumb`/`PageHeaderBreadcrumb` y `ModalSize` para que los builds desde dependencias Git conserven el contrato de `PageHeader` y `Modal`.

### Migración rápida

```diff
- import { ApexChart, ChartCard } from '@duralux/ui'
+ import { ApexChart, ChartCard } from '@duralux/ui/charts/apex'
```

```bash
# Sólo si se usa Apex
npm install apexcharts react-apexcharts

# Sólo si se usan widgets Recharts
npm install recharts
```

Consultá los ejemplos de `SearchableSelect`, `MultiSelect`, `InputGroup` y charts en el [README](./README.md), y las validaciones/advertencias aceptadas en [docs/RELEASE_V2.md](./docs/RELEASE_V2.md).
