# Registro de defectos — @duralux/ui

Línea base: 2026-10-03, rama `spec/design-system-2x` sobre `b2f945d` (2.0.0).
Fuente reproducible: `node scripts/audit/baseline.mjs` (deuda CSS + react-doctor) y
`node scripts/audit/capture.mjs` (capturas + axe de la demo por tema). Capturas «antes»:
`/home/admincrm/audits/duralux-2-1/antes/` (light, dark, navy × 20 páginas).

Severidad: **P0** rompe uso o datos · **P1** a11y bloqueante, bug visible o API incorrecta · **P2** deuda que degrada calidad · **P3** higiene.
Subproyecto: 1 Fundaciones · 2 Núcleo · 3 Nuevos · 4 Patrones · 5 Dominios · 6 Adopción.

## Métricas de línea base

| Métrica | Valor |
|---|---|
| react-doctor | 46 / 100 (Crítico) |
| `!important` (src/styles, src/components, scss/themes) | 680 (224 en `grancrm-ui.css`) |
| Selectores `.app-skin-dark` | 181 (167 en `grancrm-ui.css`) |
| Hex sueltos | 428 (253 en `grancrm-ui.css`) |
| axe (demo, claro) | 5 reglas: color-contrast ×20 páginas, heading-order ×19, nested-interactive, landmark-unique, aria-prohibited-attr |

## Estado tras 2.1

react-doctor 68/100 (local 0.9.11; mínimo del gate: 60). axe en la demo (20 páginas × 3 temas): **color-contrast 0** (antes 20/19/19), aria-prohibited-attr 0, landmark-unique 0; quedan heading-order (estructura de la demo, DX-027) y nested-interactive en gráficos (DX-004). Storybook: 0 violaciones en 21 capturas. Línea base posterior: `docs/auditoria/baseline-2.1.json`. Presupuesto CSS sin artefactos generados: 680 `!important`, 181 `.app-skin-dark`, 367 hex.

## Estado tras 2.8

react-doctor 81/100 (gate: 75). axe en Storybook (patrones, dominios, IA y shell; claro, oscuro y navy): 0 violaciones serias o críticas en los componentes; quedan `landmark-unique` moderado en stories de varias instancias (DX-047). Presupuesto CSS sin cambios en archivos existentes; los 38 CSS nuevos de 2.6–2.8 no usan hex, `!important` ni `.app-skin-dark`.

## Defectos

| ID | Sev | Área | Defecto | Evidencia | Sub | Estado |
|---|---|---|---|---|---|---|
| DX-001 | P1 | a11y | `code` usa `#d63384` de Bootstrap: 4,08:1 sobre canvas claro y 4,25:1 en oscuro (< 4,5) | axe color-contrast, `p > code` en 13 páginas | 1 | cerrado 2.1 (token `--gcu-code` por tema, AA) |
| DX-002 | P1 | a11y | Texto de error de formulario usa `#dc3545` (danger de Bootstrap, no el semántico): 4,11:1 claro / 4,23:1 oscuro | axe `#:rg:-error`, `label[for=":rd:"]` (forms) | 1 | cerrado 2.1 (overrides antes de Bootstrap; `--gcu-status-danger`) |
| DX-003 | P1 | a11y | `text-muted` / ayuda de campo `#64748b` sobre canvas `#f3f4f6`: 4,32:1; en oscuro 4,02:1 | axe `#:rf:-help`, `#:r3:-help`, celda vacía de tabla | 1 | cerrado 2.1 (`$text-muted: var(--gcu-muted)`) |
| DX-004 | P1 | a11y | Gráficos: contenedor con `aria-label` y descendientes enfocables (interactivo anidado) | axe nested-interactive, `div[aria-label="Fuentes de leads"]` (charts) | 2 | cerrado 2.4 (L6: `ChartFrame` es `<figure>` con nombre y `figcaption`; nada interactivo bajo `role="img"`; tabla de datos dentro de la figura; tests de contrato `img` → `figure`) |
| DX-005 | P2 | a11y | `Pagination` emite `nav[aria-label="Paginación"]` sin nombre único cuando hay varias en la página | axe landmark-unique (datatable) | 2 | cerrado 2.1 (`Paginación de {tabla}`) |
| DX-006 | P2 | a11y | `ChartCard` usa `h3`/`h4` fijo; rompe el orden de encabezados del contenedor | axe heading-order `#chart-card-title-…` | 2 | cerrado 2.4 (L6: `headingLevel` 2–6, h3 por defecto, tipografía `.h5` fija) |
| DX-007 | P2 | a11y | Atributo ARIA prohibido en un elemento (ver `axe-light.json`) | axe aria-prohibited-attr | 2 | cerrado 2.1 (tendencia de StatsCard con texto oculto, sin aria-label en div) |
| DX-008 | P1 | visual | Campo obligatorio muestra asterisco duplicado (`Nombre * *`) | captura `dark-forms.png` (formulario completo) | 2 | cerrado 2.1 (era la demo: label con `*` + `required`) |
| DX-009 | P1 | visual | `Select` usa tamaño de fuente mayor que `Input` en la misma fila | captura `dark-forms.png` (Select País/Estado) | 1 | cerrado 2.1 (causa raíz: orden de imports de Bootstrap) |
| DX-010 | P2 | visual | `FileInput`: botón nativo claro en tema oscuro | captura `dark-forms.png` (FileInput) | 2 | cerrado 2.3 L1 (`::file-selector-button` con tokens) |
| DX-011 | P2 | tema | Navy solo existe como rama `theme/navy`; no seleccionable en runtime | `git branch` | 1 | cerrado 2.1 (navy en runtime) |
| DX-012 | P2 | tema | `readStoredMode` convierte cualquier valor ≠ `dark` en `light` | `src/theme/ThemeContext.ts:23` | 1 | cerrado 2.1 (4 modos + `log.warn`) |
| DX-013 | P2 | tipografía | Inter cargada desde Google Fonts (dependencia externa, privacidad, offline) | `scss/theme.scss` `@import url(fonts.googleapis…)` | 1 | cerrado 2.1 (Inter Variable autoalojada) |
| DX-014 | P2 | tokens | Solo 14 tokens de color; sin escalas de espaciado, elevación, motion, z-index, alturas | `tokens/semantic-colors.json` | 1 | cerrado 2.1 (tokens DTCG de tres niveles) |
| DX-015 | P2 | css | 680 `!important`, 181 overrides `.app-skin-dark`, 428 hex sueltos | `docs/auditoria/baseline.json` | 1 (global) / 2 (componentes) | en curso: presupuesto por archivo en gate (2.1); reducción en subproyecto 2 |
| DX-016 | P2 | react | `setState` síncrono en efecto y estado empujado al padre vía efecto | `src/components/ui/Tabs.jsx:106`, `:129` | 2 | cerrado 2.3 (`Tabs.tsx`: activa derivada en render; `onChange` solo desde eventos; clave inválida avisa por `log.warn`) |
| DX-017 | P2 | react | Estado ajustado tras cambio de prop (×5) | `ChatSidebar.jsx:140`, `SearchableSelect.jsx:83`, `selectCoreModel.jsx:237-238`, `navigationCore.tsx:428` | 2 | parcial: SearchableSelect/MultiSelect/selectCoreModel cerrados en 2.3 L1 (derivado en render); ChatSidebar cerrado en 2.4 L7 (contacto tabulable derivado en render; el efecto solo mueve el foco del DOM); navigationCore cerrado en 2.6 P1 (`navigationCore.tsx`: grupos abiertos ajustados en render con firma previa, sin efecto) — cerrado |
| DX-018 | P3 | react | Key por índice | `src/components/charts/ChartLegend.jsx:11` | 2 | no aplica: el índice solo desempata series con la misma clave |
| DX-019 | P2 | react | Modal propio en vez de `<dialog>` | `src/components/ui/Modal.jsx:487` | 2 | no aplica (2.3, L2): se conserva el patrón APG completo en `Modal.tsx`. jsdom no implementa `showModal()` (no se podría verificar foco atrapado, retorno de foco, Esc y bloqueo de scroll que cubren `Modal.test` y `AppLayout.test`) y la pila global entre bundles (Esc solo en el superior, traspaso de foco, fondo `inert` por capa) difiere del top layer nativo |
| DX-020 | P3 | react | `role` en vez de elemento HTML | `src/components/ui/StatsCard.jsx:73` | 2 | cerrado 2.4 (lote L4: `<progress>` nativo en StatsCard) |
| DX-021 | P3 | react | Exports no-componente en archivos de componente (fast refresh) | `ThemeProvider.tsx:111-112`, `ThemeBoundaryContext.tsx:11`, `Sidebar.jsx:47`, `GranCrmExtras.tsx:104`, `ShellNav.tsx:74` | 1 (theme) / 2 (resto) | parcial: tema cerrado en 2.1; GranCrmExtras cerrado en 2.4 (lote L4: StatCard es componente real y la lógica vive en `granCrmExtras.model.ts`); Sidebar/ShellNav cerrados en 2.6 P1 (adaptadores movidos a `layout/routerNavAdapter.jsx` y `shell/gatewayNavAdapter.tsx`; `Sidebar.jsx` y `ShellNav.tsx` exportan solo componentes) — cerrado |
| DX-022 | P3 | mantenibilidad | 13 funciones de alta complejidad; `DataTable` y `ShellHeader` demasiado grandes | react-doctor (lista en baseline) | 2 / 3 | abierto |
| DX-023 | P2 | tipos | `Record<string, unknown>`/diccionarios inseguros en la API pública de charts (×11) | `src/public/chart-types.ts:3…118` | 2 | cerrado 2.4 (L6: `ChartDatumValue`, `ApexOptionValue` y opciones de Apex con nombre; amplía sin estrechar, `test-types/charts-api.tsx`) |
| DX-024 | P3 | tooling | `typeof` en runtime en scripts de gate (×3) | `scripts/check-package.mjs:52,56,72` | 1 | no aplica: `scripts/` fuera de lint por política del proyecto (`.oxlintrc.json`, `react-doctor.config.json`) |
| DX-025 | P3 | tests | Mocks de módulo en tests de charts (×3); aserciones sin comentario (×2) | `test/AreaChartWidget.test.jsx:4`, `test/Charts.contract.test.jsx:5,39`, `test/theme-css.contract.test.ts:367,375` | 2 | parcial: aserciones justificadas (2.1); mocks permitidos en tests por política |
| DX-026 | P3 | tooling | Regla oxlint interna con aserciones encadenadas y parámetros `unknown` | `tools/oxlint/anti-slop/shared/lexical-type-parameters.ts:5,20` | 1 | no aplica: plugin de lint vendorizado, excluido por política |
| DX-027 | P3 | demo | Orden de encabezados de la demo (`h3` sin `h2`), 404 en la intro | axe heading-order ×19, consola intro | 2 (migración a Storybook) | cerrado 2.6 (demo retirada; Storybook cubre sus páginas) |
| DX-028 | P3 | seguridad | react-doctor `require-pnpm-hardening` ×2 (el repo construye con npm) | react-doctor | 1 | no aplica: el repo construye con npm |
| DX-029 | P2 | copy | `Card` trae etiquetas por defecto en inglés (`Refresh`, `Remove`, `Expand`) | `src/components/ui/Card.jsx:58-60` | 2 | cerrado 2.3 (`Card.tsx`: «Actualizar», «Quitar», «Expandir» con `IconButton`) |
| DX-030 | P2 | copy | Voseo en documentación, comentarios y CLI (CHANGELOG 2.0, README, CLAUDE.md, JSDoc de Button/FormField, `scripts/check-doctor.mjs`): viola la regla de español internacional. Mensajes del gate corregidos en 2.1 | 10 archivos (`grep -rE 'usá|corré|podés'`) | 6 | cerrado 2.8 en `src/`, `scripts/`, tests y CHANGELOG (docs/ y AGENTS.md en lote DOC); README.md y CLAUDE.md quedan a cargo de quien los mantiene |
| DX-031 | P3 | tests | `Charts.contract.test.jsx` intermitente bajo carga (carga diferida de ApexChart): 1 fallo en 4 corridas completas | `test/Charts.contract.test.jsx` «uses the literal accessible dark chart palette» | 2 | cerrado 2.4 (L6: aserciones de opciones de Apex dentro de `waitFor`, sin tiempos) |
| DX-032 | P3 | theme | SSR con hidratación: `getServerSnapshot` = false hace que `system` con SO oscuro pinte light un instante y pise el snippet | `src/theme/ThemeProvider.tsx:54` | 2 | abierto |
| DX-033 | P3 | theme | `setMode` no valida: un consumidor JS con `setMode('sepia')` deja `data-gcu-theme="sepia"` | `src/theme/ThemeProvider.tsx:53` | 2 | abierto |
| DX-034 | P3 | icons | `Icon` con `icon` descarta `style` y `...rest` | `src/components/ui/Icon.jsx:25` | 2 | cerrado 2.3 (`Icon.tsx` reenvía style, className, rest y ref al SVG) |
| DX-035 | P3 | a11y | `renderIconSlot` pisa el `aria-label` propio del elemento con `aria-hidden` | `src/utils/iconSlot.jsx:24-29` | 2 | cerrado 2.3 (`iconSlot.tsx`: con `aria-label`/`aria-labelledby` propio se anuncia como imagen) |
| DX-036 | P3 | styles | La capa de refinamiento quita padding vertical a todo `.btn` (afecta `.btn-link` en línea y botones de dos líneas) | `src/styles/grancrm-ui.css` (REFINEMENT 2.1) | 2 | cerrado 2.3 (`.btn:not(.btn-link)` en `components/button.css`) |
| DX-037 | P3 | tests | Los tests de cascada de ThemeScope × tema de html × reduced-motion verifican texto, no la cascada medida en navegador | `test/tokens-generator.test.ts`, `test/refinement-css.test.ts` | 2 | abierto |
| DX-038 | P3 | theme | Navy Sass agrega un atributo de especificidad: un override de app con el selector del oscuro pierde en navy (alternativa `:where()`) | `_theme-options-dark-theme.scss` | 2 | abierto |
| DX-039 | P2 | tablas | Celdas de `.table` con texto alineado arriba y controles centrados en la misma fila | story Componentes/Acciones/Button › Acciones en tabla densa | 2 (tablas) | cerrado (L5: `vertical-align:middle` en `.table`, table.css) |
| DX-040 | P2 | tablas | En oscuro, filas pares de `.table` con texto atenuado (regla de tema heredada de striped) | misma story, tema oscuro | 2 (tablas) | cerrado (L5: sin regla de filas impares ni `.table` atenuada en el oscuro) |
| DX-041 | P1 | a11y | Header de `AppLayout`: el nombre de la persona heredaba el color del header de la plantilla (#eaebef) y no se leía en el tema claro (1,19:1) | axe color-contrast en patrones (story Ajustes) | 2 | cerrado 2.8 (`shell-layout.css`: `--gcu-text` en el nombre y `--gcu-muted` en el chevron) |
| DX-042 | P1 | a11y | Títulos de sección del menú lateral con gris fijo #67758a: 3,9:1 en oscuro y navy | axe color-contrast, `.nxl-caption > span` | 2 | cerrado 2.8 (`navigation.css`: `--gcu-muted`) |
| DX-043 | P2 | a11y | Anillos de foco de 2.7–2.8 hechos con `box-shadow` y `outline:0`: desaparecen en modo de alto contraste | 20 reglas `:focus-visible` en `src/styles/components/` | 3 | cerrado 2.8 (`outline:2px solid transparent`, que forced-colors pinta) |
| DX-044 | P2 | storybook | Las stories de patrones exportaban sus variantes con desestructuración y el indexador de Storybook las omitía (solo 3 de 27 visibles) | `index.json` de build-storybook | 4 | cerrado 2.8 (exportaciones explícitas) |
| DX-045 | P3 | theme | Logo de texto «uralux» del `AppLayout` casi invisible en oscuro y navy (asset de la plantilla) | capturas de patrones en oscuro | 2 | abierto |
| DX-046 | P3 | a11y | `role="meter"` sobre `span`/`div` en TargetBar, QuotaBanner y UsageMeter (react-doctor `prefer-tag-over-role`); `<meter>` nativo no admite el relleno con tokens actual | react-doctor | 3 | abierto (funciona con lectores; evaluar `<meter>` estilizado) |
| DX-047 | P3 | a11y | `landmark-unique` (moderado) cuando una story muestra varias instancias de AgentStatusBoard, Transcript o PageHeader con el mismo nombre | axe en Storybook | 3 | abierto (solo stories de varias instancias) |
| DX-048 | P1 | a11y | `EntityCard` inactiva atenuada con `opacity` (texto secundario 3,2:1) y pie con el gris de `.card .card-footer` de la plantilla en oscuro (1,6:1) | axe en patrón Directorio y story EntityCard | 3 | cerrado 2.8 (título con `--gcu-muted` sin opacidad; pie con `--gcu-text`) |
| DX-049 | P1 | tema | `.bg-light` queda `#eff0f6 !important` en los tres temas: no tiene regla para oscuro ni navy. El texto que hereda del tema pierde contraste: 2,90:1 en oscuro con `#8b8d98` y 1,82:1 en navy con `#b1b4c0` | `scss/themes/components/_general.scss:436` → `dist/theme.css` `.bg-light`; caso real: vista previa del editor de plantillas de Onboarding (auditoría 2026-10-07) | 1 | abierto: la app Onboarding lo esquiva quitando la clase; cualquier satélite que use `bg-light` dentro del shell lo hereda |
| DX-050 | P2 | a11y | Los enlaces del tema no se subrayan. En claro usan `$brand-dark` (`#283c50`), el mismo color del texto: se distinguen sólo por el peso 600. En oscuro, `html.app-skin-dark a { color: #fff !important }` anula también el hover | `scss/themes/components/_general.scss:38-46`; `dist/theme.css` `html.app-skin-dark a` | 1 | abierto: cambiarlo afecta al shell y a todos los remotos, así que pide una pasada visual por app. Propuesta: `var(--gcu-primary-text)` y subrayado en hover/foco, o subrayado siempre en texto corrido (auditoría de Onboarding, 2026-10-07) |
