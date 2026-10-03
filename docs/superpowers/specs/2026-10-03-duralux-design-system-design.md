# @duralux/ui como design system de In-Touch — Spec maestro + Fundaciones

- **Fecha:** 2026-10-03
- **Estado:** diseño aprobado en conversación; pendiente de revisión del spec escrito
- **Alcance de este documento:** visión, principios, arquitectura, estándar de producción y hoja de ruta de la serie 2.x (spec maestro) + detalle de la Fase 0 (auditoría) y del Subproyecto 1 (Fundaciones, versión 2.1). Los subproyectos 2–6 tendrán cada uno su propio spec → plan → implementación.

---

## 1. Contexto

- `@duralux/ui` 2.0.0 (`b2f945d`, GitHub `Waryxxful/duralux-ui`) es el paquete compartido de 13 apps del ecosistema GranCRM (grancrm-shell, orquestador/sa, call_reviews, chat, chat-frontend, wsp_platform, wsp_pompeyo, wsp_demo, tablero-ti, dashboard-cupos, e-learning, scraper, plataformas). Las apps clavan SHA, no rama.
- `@intouch/ui` 0.2.1 (`/home/admincrm/intouch-ui`, local, sin remoto, 0 consumidores) se construyó como reemplazo sobre Vireo + antd + Tailwind. **Decisión:** no se adopta como reemplazo. Duralux evoluciona y absorbe sus componentes, patrones y documentación; intouch-ui se archiva al terminar la serie 2.x.
- Línea base medida el 2026-10-03:
  - `typecheck` ✓, 365 tests en 49 archivos ✓, `audit-contract` ✓ (0 violaciones).
  - **react-doctor 46/100 (Crítico):** 28 errores de bugs (`no-unsafe-dictionary-type` ×12, `no-runtime-typeof` ×8, `no-module-mocking` ×3, aserciones de tipo ×4), 8 warnings de bugs, 21 de mantenibilidad (13 componentes de alta complejidad, 2 componentes grandes), 2 de a11y (rol en vez de tag HTML, modal propio en vez de `<dialog>`), 2 de seguridad (hardening de pnpm). También: estado ajustado tras cambio de prop ×5, datos/estado empujados al padre vía efecto ×2, key por índice ×1.
  - oxlint: `setState` síncrono en efecto (`src/components/ui/Tabs.jsx:106`), exports no-componente en `src/theme/ThemeProvider.tsx:111-112`.
  - CSS: `src/styles/grancrm-ui.css` 73 KB con **116 `!important`** y ~170 overrides `.app-skin-dark`; tokens limitados a **14 colores** (`tokens/semantic-colors.json`); Inter cargada desde Google Fonts; radios 2/4/6 px; una sola sombra (`0 0 20px rgb(0 0 0 / 50%)`).
  - Temas: `ThemeMode = 'light' | 'dark'` por clase `.app-skin-dark`; navy existe solo como rama `theme/navy`.
  - Código: mezcla JSX/TSX (~14.100 líneas JS/TS, ~26.700 SCSS/CSS). Demo Vite con 21 páginas.

## 2. Objetivo y criterios de éxito

`@duralux/ui` es **el** design system de In-Touch: librería de componentes reutilizable, documentada y premium que conserva el ADN visual Duralux refinado.

Consumidores y cómo se mide el éxito:

| Consumidor | Éxito |
|---|---|
| Apps GranCRM | Las 13 apps actualizan a la serie 2.x y se ven consistentes, sin regresiones no aprobadas. |
| Agentes de IA | Un agente arma una pantalla correcta leyendo `AGENTS.md` + manifest, sin inventar clases ni hex. |
| Desarrolladores nuevos | Una app satélite funcional en horas, guiándose solo por Storybook y `docs/`. |
| Clientes (demo) | Storybook publicado como escaparate premium del sistema. |

**Obligatorio:** demo navegable (Storybook) y cero defectos abiertos al cierre de la serie 2.x.

## 3. Principios (→ `docs/PRINCIPIOS.md`)

1. **Tokens como única fuente de verdad.** Ningún componente usa hex, px mágicos ni `!important`.
2. **Compatibilidad hacia atrás.** Lo que cambia se depreca en 2.x (aviso en consola solo en dev, vía `log.warn`) y se elimina en 3.0.
3. **API consistente.** `variant` / `tone` / `size` con el mismo vocabulario en todos los componentes; todos aceptan `className` y `ref`.
4. **Accesible por defecto.** WCAG 2.2 AA, `:focus-visible` siempre visible, teclado completo, patrones ARIA APG.
5. **Densidad operativa.** Pensado para pantallas de trabajo con mucha información, no landings.
6. **Español internacional** en todo texto visible; nunca rioplatense.
7. **Observabilidad.** Logging en componentes con comportamiento (errores, fallbacks, deprecaciones).
8. **Contrato congelado.** `src/contract.ts` no cambia en la serie 2.x.

## 4. Arquitectura del paquete

| Export | Contenido | Dependencias |
|---|---|---|
| `@duralux/ui` | Componentes, shell, hooks, `contract`, `apiFetch`, `log` | react, react-dom (peer); `@tanstack/react-table`, `@tabler/icons-react` (dependencies) |
| `@duralux/ui/tokens.json` · `/tokens` (TS) · `/tokens.css` | Tokens generados | — |
| `@duralux/ui/styles.css` | tokens + Bootstrap + theme + componentes | — |
| `@duralux/ui/charts/apex` · `/charts/recharts` | Sin cambios de API | peers opcionales (como hoy) |
| `@duralux/ui/antd` | `DuraluxAntdProvider` (tema derivado de tokens) + wrappers DatePicker, RangePicker, TreeSelect, Cascader, Upload | antd ^6, dayjs (peers opcionales) |

Reglas:
- antd **nunca** se importa desde el núcleo; solo desde el subpath `/antd`. `gate:bundle` lo verifica.
- TanStack Table es headless: la presentación sigue siendo Duralux.
- Los exports actuales (`bootstrap.css`, `theme.css`, `styles/grancrm-ui.css`, `styles/feather-icons.css`) se mantienen en 2.x.
- Migración JSX → TSX progresiva: componente que se toca, se tipa.

## 5. Estándar de producción

### 5.1 Definición de terminado (por componente)

1. TSX, tipos públicos estrictos, `forwardRef`, `className`.
2. Solo tokens semánticos; ningún override `.app-skin-dark`.
3. Estados: hover, focus-visible, active, disabled, loading; error y vacío cuando aplique.
4. a11y según patrón APG, operable solo con teclado, 0 violaciones axe.
5. Logging (`log` con prefijo `[duralux]`; silencioso en producción salvo `error`).
6. Tests de comportamiento (Testing Library), sin snapshots frágiles.
7. Story con todas las variantes en claro / oscuro / navy + docs (uso, do/don't, props).
8. Sin regresión visual no aprobada.

### 5.2 Gates (todos en `npm run build`, locales)

| Gate | Regla |
|---|---|
| `audit-contract` (extendido) | Lo actual + prohíbe en `src/`: hex sueltos fuera de tokens, `!important` nuevo, selectores `.app-skin-dark` nuevos |
| react-doctor | Umbral mínimo por minor: 60 (2.1) → 75 (2.3) → 90 (2.6 en adelante) |
| `storybook test` | Interacciones + axe en todas las stories |
| `tokens:check` | Tokens generados al día + contraste AA (4,5:1 texto, 3:1 UI) en los 3 temas |
| Regresión visual | Playwright sobre stories en 3 temas; diffs aprobados explícitamente |
| `typecheck` | `strict` sobre la API pública |
| vitest, `gate:bundle`, `gate:package` | Como hoy |

### 5.3 Política de defectos

- Todo defecto vive en `docs/auditoria/DEFECTOS.md` con ID (`DX-###`), severidad P0–P3, evidencia (archivo:línea o screenshot) y subproyecto responsable.
- Ninguna minor se publica con P0/P1 abiertos en el área que toca.
- Cierre de la serie 2.x: react-doctor ≥ 90, 0 violaciones axe, 0 `!important` (salvo utilidades justificadas en `docs/TOKENS.md`), DEFECTOS.md sin abiertos.

## 6. Hoja de ruta

| # | Subproyecto | Versión |
|---|---|---|
| 0 | Auditoría de línea base → `DEFECTOS.md` | (sin release) |
| 1 | **Fundaciones:** tokens, temas, refinamiento visual global, iconos, Storybook base, reglas escritas | 2.1 |
| 2 | Refinamiento del núcleo: ~60 componentes actuales a la definición de terminado; migración de la demo a stories | 2.2–2.4 |
| 3 | Componentes nuevos (inventario §9), DataTable sobre TanStack, subpath `/antd` | 2.5–2.6 |
| 4 | Patrones y layouts de página + shell | 2.7 |
| 5 | Dominios: calidad, operaciones, CRM, IA | 2.8+ |
| 6 | Adopción: `AGENTS.md` completo, manifest, guías de migración por app, archivo de intouch-ui | en paralelo |
| — | 3.0: eliminación de deprecaciones | al final |

Cada subproyecto: spec propio → plan → implementación → release con validación en consumidores (shell, sa, callreviews como mínimo).

---

## 7. Fase 0 — Auditoría de línea base

Precede a Fundaciones. Produce `docs/auditoria/DEFECTOS.md` y los scripts reproducibles que lo generan.

| Dimensión | Método |
|---|---|
| Bugs / React | react-doctor completo, oxlint, revisión de código de los 13 componentes de alta complejidad |
| a11y | axe sobre cada página de la demo actual + recorrido de teclado (Tab, Esc, flechas) en Modal, Dropdown, Tabs, selects, DataTable |
| Temas | Screenshots Playwright de cada página de la demo en claro y oscuro (+ navy desde la rama) |
| Tipos | `tsc` con `strict` sobre `src/public/types.ts` y exports |
| CSS | Conteo y ubicación de `!important`, hex sueltos, overrides de dark, selectores de especificidad > 0,3,0 |
| Rendimiento | Tamaño de `dist/` por entry, CSS no usado, re-renders evitables (react-doctor) |
| Consumidores | En las 13 apps: clases Bootstrap crudas que reemplazan componentes, CSS que parchea a `@duralux/ui`, `DuraluxBridge`, imports profundos |

Salida: cada hallazgo asignado a un subproyecto (1–5). Los defectos de consumidores que se resuelven en la librería se registran; los que son de la app quedan en la guía de migración de esa app (subproyecto 6).

---

## 8. Subproyecto 1 — Fundaciones (2.1)

### 8.1 Tokens

Archivo único `tokens/tokens.json` en formato W3C DTCG. Tres niveles:

**Primitivos.** Escalas 50–950 generadas en OKLCH y ancladas a los hex actuales en el paso 500:
`primary #3454d1`, `success #17c666`, `danger #ea4d4d`, `warning #ffa21d`, `info #3dc7be`, `teal #41b2c4`, `indigo #6610f2`, y un neutro `slate` de 12 pasos levemente teñido hacia el matiz de `primary`.

**Semánticos** (los únicos que consumen los componentes):
- Superficie: `bg`, `surface`, `surface-raised`, `surface-sunken`, `overlay`
- Borde: `border`, `border-strong`
- Texto: `text`, `text-muted`, `text-subtle`, `text-inverse`
- Foco: `focus-ring`
- Por tono `{primary, success, danger, warning, info}`: `{tone}`, `{tone}-fg`, `{tone}-soft`, `{tone}-border`

**De componente:** solo cuando un componente lo necesite (no se crean por adelantado).

**Generación.** Se extiende `scripts/generate-tokens.mjs` (no se agrega Style Dictionary). Salidas:
- `src/styles/tokens.css` — `--dx-*` bajo `:root` / `[data-theme="dark"]` / `[data-theme="navy"]`
- `scss/themes/_tokens.generated.scss` — alimenta las variables Bootstrap (`$primary`, `$border-radius`, etc.)
- `src/tokens.ts` — valores y tipos (reemplaza el actual manteniendo sus exports)
- `src/antd/theme.generated.ts` — objeto `ThemeConfig` de antd por tema

`tokens:check` falla si las salidas no están al día o si algún par texto/fondo semántico no cumple AA en cualquiera de los tres temas.

### 8.2 Escalas

| Escala | Valores |
|---|---|
| Tipografía | 11 / 12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 px, cada uno con line-height propio; pesos 400 / 500 / 600 |
| Espaciado | base 4: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| Radios | `xs 2`, `sm 4`, `md 6` (controles), `lg 8` (cards), `xl 12` (modales, drawers), `full` |
| Alturas de control | `sm 32`, `md 36`, `lg 40` — idénticas en input, select y botón |
| Elevación | 0–4, sombras de dos capas (ambiente + clave); en oscuro/navy la elevación se expresa con superficie más clara + borde |
| Motion | duraciones 100 / 150 / 200 / 300 ms; curvas `standard`, `enter`, `exit`; todo se anula con `prefers-reduced-motion: reduce` |
| z-index | `dropdown`, `sticky`, `drawer`, `modal`, `toast`, `tooltip` (en ese orden) |
| Breakpoints | los de Bootstrap, sin cambios |

### 8.3 Refinamiento visual global

2.1 cambia el aspecto de todas las apps que la adopten, aplicado desde los tokens:

| Área | Antes | Después |
|---|---|---|
| Neutros | grises sueltos | escala slate teñida; superficies en capas `bg → surface → surface-raised` |
| Bordes | gris sólido | 1 px con alfa |
| Sombras | una, pesada | 5 niveles suaves de dos capas |
| Radios | 2 / 4 / 6 | controles 6, cards 8, modales/drawers 12 |
| Tipografía | Inter (Google Fonts) | Inter variable autoalojada (woff2), `cv11` + `ss01`, `tnum` en datos, tracking negativo en títulos |
| Controles | alturas variables | 32 / 36 / 40 |
| Foco | inconsistente | anillo único 2 px + offset 2 px, `focus-ring` |
| Motion | ad hoc | 150 ms `standard` en hover / press / apertura |
| Oscuro / navy | overrides por componente | mismos tokens, otros valores; tres superficies escalonadas por luminosidad |

Control de riesgo:
1. Antes del merge: stories de Fundamentos con comparación antes/después; el usuario aprueba el look en Storybook.
2. En el release: screenshots Playwright de shell (`/`), sa (`/sa/accounts`, `/sa/users`) y callreviews (`/callreviews/calls/dashboard/`) en los tres temas, antes y después; diffs revisados.
3. Adopción: las apps clavan SHA; cada una adopta 2.1 al actualizar. Sin feature flags.

### 8.4 Temas en runtime

- `<html data-theme="light|dark|navy">`. `ThemeMode` pasa a `'light' | 'dark' | 'navy' | 'system'` (`system` sigue `prefers-color-scheme` y resuelve a `light`/`dark`).
- Compatibilidad 2.x: en `dark` y `navy` también se aplica la clase `.app-skin-dark`.
- `THEME_HEAD_SNIPPET` se actualiza para fijar `data-theme` antes del primer pintado (sin FOUC); lee el valor guardado actual (`'dark'`) sin romperlo.
- La rama `theme/navy` se retira cuando el tema navy en runtime alcanza paridad visual (verificada con screenshots).
- Migración en este subproyecto: la capa global de `grancrm-ui.css` (fondo, texto, bordes, sidebar, header, cards base) pasa a variables. Los overrides de dark por componente se migran en el subproyecto 2. Desde 2.1 el gate prohíbe overrides nuevos.
- `ThemeProvider.tsx`: las constantes no-componente salen a un módulo propio (corrige el warning de oxlint).

### 8.5 Iconos

- `<Icon>` y las props `icon` / `startIcon` aceptan `string` (nombre Feather, comportamiento actual) o `ReactNode` (componente Tabler).
- Tabler con `stroke={2}` y tamaños 14 / 16 / 20, alineados ópticamente con Feather.
- Guía en `docs/ICONOGRAFIA.md`: Feather para acciones genéricas existentes; Tabler para lo que Feather no cubre (IA, operaciones, dominios). Un mismo concepto usa siempre el mismo icono.

### 8.6 Storybook base

- Storybook con builder `react-vite`, `@storybook/addon-a11y` y test runner.
- Toolbar de tema (claro / oscuro / navy) que fija `data-theme` en el iframe.
- Páginas de **Fundamentos** generadas desde `tokens.json`: Color (con contrastes), Tipografía, Espaciado, Radios, Elevación, Motion, Iconografía.
- La demo Vite actual convive hasta que cada página se migra a stories en el subproyecto 2; luego se elimina. `Dockerfile` / `nginx.conf` pasan a servir `storybook-static`.
- Scripts: `storybook`, `build-storybook`, `test:stories`.

### 8.7 Documentación de Fundaciones

| Archivo | Contenido |
|---|---|
| `docs/PRINCIPIOS.md` | §3 de este spec |
| `docs/REGLAS-DE-DISENO.md` | Color con significado, una acción primaria por vista, jerarquía tipográfica, densidad, estados, vacíos, errores. Base: `intouch-ui/docs/REGLAS-DE-DISENO.md` adaptado al ADN Duralux |
| `docs/TOKENS.md` | Niveles, nombres, cómo agregar un token, excepciones permitidas |
| `docs/ICONOGRAFIA.md` | §8.5 |
| `AGENTS.md` | Reglas cortas para agentes: cómo importar, usar tokens nunca hex, canon de clases, dónde mirar. `CLAUDE.md` y `CLAUDE.snippet.md` lo referencian |

### 8.8 Criterios de aceptación de 2.1

1. `tokens.json` DTCG con los tres niveles; las cuatro salidas generadas; `tokens:check` en verde con AA en los tres temas.
2. Temas light / dark / navy / system intercambiables en runtime sin recarga ni FOUC.
3. Refinamiento visual §8.3 aplicado y aprobado en Storybook; diffs de shell / sa / callreviews revisados.
4. Storybook con Fundamentos completos, toolbar de tema y addon a11y.
5. Gates extendidos activos; react-doctor ≥ 60.
6. Defectos P0/P1 de `DEFECTOS.md` asignados al subproyecto 1, cerrados.
7. Documentos de §8.7 escritos.
8. Ningún cambio de API rompiente; `contract.ts` intacto.

---

## 9. Inventario para subproyectos 3–5 (desde intouch-ui)

Se porta el comportamiento y el patrón, no la estética Vireo. Nombres finales se deciden en cada spec.

- **Núcleo / UI:** Segmented, Severity, Score / ScoreHero, Person, Kbd, Divider, Skeleton, Spinner, Tag, Switch, ChoiceCard, Fieldset, RadioGroup, FileDrop, Accordion, Drawer, DescriptionList, List, BulkBar, ActiveFilters, KpiCard.
- **Composición:** WelcomeBand, Spotlight, StatGroup, RankList, QuickTiles, EntityCard, ProcessSteps, AppStatusCard, DashGrid.
- **Shell:** CommandPalette, AppSwitcher, TenantSwitcher, NotificationsMenu, ProfileMenu, ThemeToggle, AuthLayout (refinado).
- **Datos:** DataTable sobre TanStack (orden, filtros, paginación, selección, columnas visibles, virtualización si se justifica), Sparkline, TrendLine, Gauge, Donut.
- **`/antd`:** DatePicker, RangePicker / DateRangeFilter, TreeSelect, Cascader, Upload, FormModal; GuidedTour.
- **Dominios:** calidad (CriterionRow, Transcript, AudioPlayer, CallRow, CallList), operaciones (TargetBar, QueueCard, AgentStatusBoard, Heatmap), CRM (ContactCard, PipelineBoard, Funnel), IA (27 bloques: AiMessage, PromptComposer, StreamingAnswer, ReasoningTrace, AgentSteps, ApprovalCard, DiffView, CodeBlock, InsightCard, etc.).
- **Patrones de página (subproyecto 4):** Directorio, Tabla operativa, Bandeja, Cola, Espacio de trabajo, Detalle, Ajustes, Auth.

## 10. Fuera de alcance

- Cambios a `src/contract.ts`.
- Reemplazar Bootstrap.
- Migrar el código de las 13 apps (cada app tendrá su guía en el subproyecto 6; la ejecución es aparte).
- Publicar en un registro npm (las apps siguen consumiendo por GitHub + SHA).
- Codemods automáticos.

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| El refinamiento global rompe layouts en alguna app | Screenshots antes/después; adopción por SHA app a app |
| antd y Bootstrap chocan en estilos | antd aislado en `/antd`, tema derivado de tokens, sin CSS global de antd en el núcleo |
| Deriva entre Feather y Tabler | Guía de iconografía + un concepto = un icono |
| Storybook agrega peso al repo | Solo devDependencies; no entra en `dist/` (`gate:package` lo verifica) |
| Licencia Envato de la plantilla sin confirmar | Pendiente de confirmación del usuario; no bloquea el diseño |
