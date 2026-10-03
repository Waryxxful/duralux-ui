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

react-doctor 67/100 (local 0.9.11; mínimo del gate: 60). Presupuesto CSS sin artefactos generados: 680 `!important`, 181 `.app-skin-dark`, 367 hex.

## Defectos

| ID | Sev | Área | Defecto | Evidencia | Sub | Estado |
|---|---|---|---|---|---|---|
| DX-001 | P1 | a11y | `code` usa `#d63384` de Bootstrap: 4,08:1 sobre canvas claro y 4,25:1 en oscuro (< 4,5) | axe color-contrast, `p > code` en 13 páginas | 1 | cerrado 2.1 (token `--gcu-code` por tema, AA) |
| DX-002 | P1 | a11y | Texto de error de formulario usa `#dc3545` (danger de Bootstrap, no el semántico): 4,11:1 claro / 4,23:1 oscuro | axe `#:rg:-error`, `label[for=":rd:"]` (forms) | 1 | cerrado 2.1 (overrides antes de Bootstrap; `--gcu-status-danger`) |
| DX-003 | P1 | a11y | `text-muted` / ayuda de campo `#64748b` sobre canvas `#f3f4f6`: 4,32:1; en oscuro 4,02:1 | axe `#:rf:-help`, `#:r3:-help`, celda vacía de tabla | 1 | cerrado 2.1 (`$text-muted: var(--gcu-muted)`) |
| DX-004 | P1 | a11y | Gráficos: contenedor con `aria-label` y descendientes enfocables (interactivo anidado) | axe nested-interactive, `div[aria-label="Fuentes de leads"]` (charts) | 2 | abierto |
| DX-005 | P2 | a11y | `Pagination` emite `nav[aria-label="Paginación"]` sin nombre único cuando hay varias en la página | axe landmark-unique (datatable) | 2 | abierto |
| DX-006 | P2 | a11y | `ChartCard` usa `h3`/`h4` fijo; rompe el orden de encabezados del contenedor | axe heading-order `#chart-card-title-…` | 2 | abierto |
| DX-007 | P2 | a11y | Atributo ARIA prohibido en un elemento (ver `axe-light.json`) | axe aria-prohibited-attr | 2 | abierto |
| DX-008 | P1 | visual | Campo obligatorio muestra asterisco duplicado (`Nombre * *`) | captura `dark-forms.png` (formulario completo) | 2 | cerrado 2.1 (era la demo: label con `*` + `required`) |
| DX-009 | P1 | visual | `Select` usa tamaño de fuente mayor que `Input` en la misma fila | captura `dark-forms.png` (Select País/Estado) | 1 | cerrado 2.1 (causa raíz: orden de imports de Bootstrap) |
| DX-010 | P2 | visual | `FileInput`: botón nativo claro en tema oscuro | captura `dark-forms.png` (FileInput) | 2 | abierto |
| DX-011 | P2 | tema | Navy solo existe como rama `theme/navy`; no seleccionable en runtime | `git branch` | 1 | cerrado 2.1 (navy en runtime) |
| DX-012 | P2 | tema | `readStoredMode` convierte cualquier valor ≠ `dark` en `light` | `src/theme/ThemeContext.ts:23` | 1 | cerrado 2.1 (4 modos + `log.warn`) |
| DX-013 | P2 | tipografía | Inter cargada desde Google Fonts (dependencia externa, privacidad, offline) | `scss/theme.scss` `@import url(fonts.googleapis…)` | 1 | cerrado 2.1 (Inter Variable autoalojada) |
| DX-014 | P2 | tokens | Solo 14 tokens de color; sin escalas de espaciado, elevación, motion, z-index, alturas | `tokens/semantic-colors.json` | 1 | cerrado 2.1 (tokens DTCG de tres niveles) |
| DX-015 | P2 | css | 680 `!important`, 181 overrides `.app-skin-dark`, 428 hex sueltos | `docs/auditoria/baseline.json` | 1 (global) / 2 (componentes) | en curso: presupuesto por archivo en gate (2.1); reducción en subproyecto 2 |
| DX-016 | P2 | react | `setState` síncrono en efecto y estado empujado al padre vía efecto | `src/components/ui/Tabs.jsx:106`, `:129` | 2 | abierto |
| DX-017 | P2 | react | Estado ajustado tras cambio de prop (×5) | `ChatSidebar.jsx:140`, `SearchableSelect.jsx:83`, `selectCoreModel.jsx:237-238`, `navigationCore.tsx:428` | 2 | abierto |
| DX-018 | P3 | react | Key por índice | `src/components/charts/ChartLegend.jsx:11` | 2 | no aplica: el índice solo desempata series con la misma clave |
| DX-019 | P2 | react | Modal propio en vez de `<dialog>` | `src/components/ui/Modal.jsx:487` | 2 | abierto |
| DX-020 | P3 | react | `role` en vez de elemento HTML | `src/components/ui/StatsCard.jsx:73` | 2 | abierto |
| DX-021 | P3 | react | Exports no-componente en archivos de componente (fast refresh) | `ThemeProvider.tsx:111-112`, `ThemeBoundaryContext.tsx:11`, `Sidebar.jsx:47`, `GranCrmExtras.tsx:104`, `ShellNav.tsx:74` | 1 (theme) / 2 (resto) | parcial: tema cerrado en 2.1; Sidebar/GranCrmExtras/ShellNav en subproyecto 2 |
| DX-022 | P3 | mantenibilidad | 13 funciones de alta complejidad; `DataTable` y `ShellHeader` demasiado grandes | react-doctor (lista en baseline) | 2 / 3 | abierto |
| DX-023 | P2 | tipos | `Record<string, unknown>`/diccionarios inseguros en la API pública de charts (×11) | `src/public/chart-types.ts:3…118` | 2 | abierto |
| DX-024 | P3 | tooling | `typeof` en runtime en scripts de gate (×3) | `scripts/check-package.mjs:52,56,72` | 1 | no aplica: `scripts/` fuera de lint por política del proyecto (`.oxlintrc.json`, `react-doctor.config.json`) |
| DX-025 | P3 | tests | Mocks de módulo en tests de charts (×3); aserciones sin comentario (×2) | `test/AreaChartWidget.test.jsx:4`, `test/Charts.contract.test.jsx:5,39`, `test/theme-css.contract.test.ts:367,375` | 2 | parcial: aserciones justificadas (2.1); mocks permitidos en tests por política |
| DX-026 | P3 | tooling | Regla oxlint interna con aserciones encadenadas y parámetros `unknown` | `tools/oxlint/anti-slop/shared/lexical-type-parameters.ts:5,20` | 1 | no aplica: plugin de lint vendorizado, excluido por política |
| DX-027 | P3 | demo | Orden de encabezados de la demo (`h3` sin `h2`), 404 en la intro | axe heading-order ×19, consola intro | 2 (migración a Storybook) | abierto |
| DX-028 | P3 | seguridad | react-doctor `require-pnpm-hardening` ×2 (el repo construye con npm) | react-doctor | 1 | no aplica: el repo construye con npm |
| DX-029 | P2 | copy | `Card` trae etiquetas por defecto en inglés (`Refresh`, `Remove`, `Expand`) | `src/components/ui/Card.jsx:58-60` | 2 | abierto |
| DX-030 | P2 | copy | Voseo en documentación y comentarios (CHANGELOG 2.0, README, CLAUDE.md, JSDoc): viola la regla de español internacional. Mensajes del gate corregidos en 2.1 | 10 archivos (`grep -rE 'usá|corré|podés'`) | 6 | parcial |
