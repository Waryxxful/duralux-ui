# Fase 0 + Fundaciones (2.1) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** dejar `@duralux/ui` 2.1.0 con línea base auditada, tokens DTCG de tres niveles, temas light/dark/navy/system en runtime, refinamiento visual global, iconos Feather+Tabler, gates nuevos, Storybook con Fundamentos y documentación de reglas.

**Architecture:** `tokens/tokens.json` (DTCG) es la fuente única; `scripts/generate-tokens.mjs` emite el bloque `--gcu-*` de `grancrm-ui.css` (+ `dist/styles/tokens.css`), SCSS para Bootstrap/theme, TS y tema antd. El oscuro Sass se emite con un mixin por paleta (dark y navy) porque `lighten()` no opera sobre `var()`. Storybook 10 (react-vite) convive con la demo Vite actual.

**Tech Stack:** React 18, Vite 6, Sass, Bootstrap 5 (SCSS de la plantilla), vitest, Storybook 10.6.1, Playwright global (headless, Chrome del sistema), axe-core 4.13.

**Spec:** `docs/superpowers/specs/2026-10-03-duralux-design-system-design.md` (§7 Fase 0 y §8 Fundaciones).

**Alcance:** solo Fase 0 y Subproyecto 1. Los subproyectos 2–6 tienen su propio spec y plan.

## Global Constraints

- Build con **npm** (no pnpm). `npm run build` debe quedar verde al final de cada tarea que toque `src/`, `scss/` o `scripts/`.
- `src/contract.ts` no cambia.
- Prefijo de custom properties: `--gcu-*` (se extiende, no se crea otro). Atributo de tema: `data-gcu-theme`. Clase `.app-skin-dark` se mantiene en dark y navy.
- Ningún cambio de API rompiente: `ThemeMode` se amplía, `useTheme().dark`, `toggleDark`, `THEME_HEAD_SNIPPET`, `THEME_STORAGE_KEY` siguen existiendo.
- Texto visible en español internacional. Logging con `log` (`src/utils/log.ts`, prefijo `[duralux]`).
- Commits: `git add <rutas concretas>` (hay cambios del usuario sin commitear en CLAUDE.md, CLAUDE.snippet.md, PAGE-STRUCTURE.md, README.md que no se tocan). Trailer de co-autoría en cada commit.
- Playwright: `/home/pancho/.nvm/versions/node/v24.17.0/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs`, `executablePath: '/usr/bin/google-chrome'`, sin X server.

## Review Focus

1. Valor guardado `grancrm-theme = "navy"` o `"system"` → se respeta al recargar (hoy `readStoredMode` lo convierte en `light`). Test en Tarea 3.
2. `system` con el SO cambiando de claro a oscuro en caliente → el tema se actualiza sin recargar. Test en Tarea 3.
3. `ThemeScope theme="light"` dentro de un `<html data-gcu-theme="navy">` → el subárbol se ve claro (las reglas locales ganan). Test de CSS en Tarea 2.
4. Consumidor que solo importa `bootstrap.min.css` + `theme.min.css` + `grancrm-ui.css` (sin `tokens.css`) → todo sigue con estilos (los tokens viven en `grancrm-ui.css`). Test en Tarea 2.
5. `prefers-reduced-motion: reduce` → duraciones a 0. Test de CSS en Tarea 5.

---

### Task 1: Fase 0 — auditoría de línea base y capturas «antes»

**Files:**
- Create: `scripts/audit/capture.mjs` (screenshots + axe de la demo por tema)
- Create: `scripts/audit/baseline.mjs` (conteos CSS + react-doctor)
- Create: `docs/auditoria/DEFECTOS.md`, `docs/auditoria/baseline.json`
- Output (no versionado): `audits/2026-10-03-antes/*.png` en `/home/admincrm/audits/duralux-2-1/antes/`

**Interfaces:** Produces `node scripts/audit/capture.mjs --base <url> --out <dir> --themes light,dark[,navy]` reutilizado en Tarea 11.

- [ ] Step 1: `capture.mjs`: recorre las 21 rutas de `demo/src/App.jsx`; por tema fija `localStorage['grancrm-theme']` y recarga; screenshot fullPage; inyecta `axe-core` (`node_modules/axe-core/axe.min.js`) y guarda violaciones en `<out>/axe-<tema>.json`. Log por página.
- [ ] Step 2: `baseline.mjs`: cuenta `!important`, hex sueltos, selectores `.app-skin-dark` por archivo en `src/styles` y `src/components`; corre `npx react-doctor@latest` y extrae `Score: N`; escribe `docs/auditoria/baseline.json`.
- [ ] Step 3: levantar demo (master, `npm run dev:demo`), capturar light+dark en `…/antes/`. Navy «antes»: worktree temporal de `theme/navy`, capturar dark como `navy`, borrar worktree.
- [ ] Step 4: escribir `DEFECTOS.md` con IDs `DX-###`, severidad, evidencia, subproyecto. Incluye react-doctor (cada regla), oxlint (Tabs.jsx:106, ThemeProvider.tsx:111-112), axe, CSS, tipos.
- [ ] Step 5: commit `chore(audit): línea base fase 0`.

### Task 2: Tokens DTCG y generador

**Files:**
- Create: `tokens/tokens.json`
- Modify: `scripts/generate-tokens.mjs` (lee tokens.json; conserva el bloque `--gcu-*` actual y lo amplía)
- Delete: `tokens/semantic-colors.json` (sus 14 colores pasan a `color.base` en tokens.json)
- Generated: bloque en `src/styles/grancrm-ui.css`, `src/styles/tokens.css`, `scss/themes/_semantic-tokens.generated.scss`, `src/generated/semantic-colors.ts`, `src/generated/tokens.ts`, `src/generated/antd-theme.ts`
- Modify: `src/tokens.ts` (reexporta escalas nuevas, conserva `tokens`, `SemanticVariant`, `StatusVariant`)
- Test: `test/tokens-generator.test.ts`; ajustar `test/tokens-colors.test.ts`, `test/theme-css.contract.test.ts`

**Interfaces:** Produces custom properties:
`--gcu-space-{0,0-5,1,2,3,4,5,6,8,10,12,16}`, `--gcu-radius-{xs,sm,md,lg,xl,full}`, `--gcu-shadow-{0..4}`, `--gcu-font-size-{2xs,xs,sm,base,md,lg,xl,2xl,3xl}`, `--gcu-line-height-*`, `--gcu-font-weight-{regular,medium,semibold}`, `--gcu-control-h-{sm,md,lg}`, `--gcu-duration-{instant,fast,base,slow}`, `--gcu-ease-{standard,enter,exit}`, `--gcu-z-{dropdown,sticky,drawer,modal,toast,tooltip}`, `--gcu-surface-raised`, `--gcu-surface-sunken`, `--gcu-overlay`, `--gcu-text-subtle`, `--gcu-text-inverse`, `--gcu-focus-ring`, `--gcu-{tone}-soft`, `--gcu-{tone}-border`, `--gcu-{tone}-fg` + escalas `--gcu-{hue}-{50..950}`. Existentes intactos en nombre.

- [ ] Step 1: test que falla: el generador (a) emite los tres selectores `:root…`, `[data-gcu-theme="dark"],.app-skin-dark`, `[data-gcu-theme="navy"]`; (b) `checkContrast()` devuelve lista vacía para todos los pares texto/fondo semánticos en los 3 temas y detecta un par inventado de 2:1; (c) el bloque local `.gcu-theme[data-gcu-theme="light"]` aparece después de los oscuros (Review Focus 3); (d) `grancrm-ui.css` contiene `--gcu-space-4` (Review Focus 4).
- [ ] Step 2: `tokens.json` con primitivos hex (escalas 50–950 derivadas una vez en OKLCH con un script desechable, ancla en 500), semánticos por tema (`light`, `dark` = paleta negro/gris actual, `navy` = valores de la rama `theme/navy`), escalas §8.2.
- [ ] Step 3: reescribir el generador: lectura + validación (hex, claves), render CSS/SCSS/TS/antd, `contrast(a,b)` WCAG (luminancia relativa), `--check` compara artefactos y contraste.
- [ ] Step 4: `npm run tokens:generate`, tests verdes, actualizar expectativas de tests contrato que fijan hex (cambio deliberado, documentado en el commit).
- [ ] Step 5: exportar `./tokens.css` y `./tokens.json` en `package.json` `exports`; `copy-styles` incluye tokens.css; `gate:package` lo acepta.
- [ ] Step 6: `npm run build` verde; commit `feat(tokens): tokens DTCG de tres niveles y temas light/dark/navy`.

### Task 3: Temas en runtime (light / dark / navy / system)

**Files:**
- Create: `src/theme/themeStorage.ts` (constantes y lectura; sale de ThemeProvider)
- Modify: `src/theme/ThemeContext.ts`, `src/theme/ThemeProvider.tsx`, `src/theme/ThemeBoundaryContext.tsx`, `src/components/shell/ThemeScope.tsx`, `src/index.ts`, `demo/index.html`
- Test: `test/ThemeProvider.test.jsx` (ampliar)

**Interfaces:**
```ts
export type ThemeMode = 'light' | 'dark' | 'navy' | 'system'
export type ResolvedTheme = 'light' | 'dark' | 'navy'
interface ThemeContextValue { mode; resolved: ResolvedTheme; dark: boolean /* resolved !== 'light' */; setMode; toggleDark; mini; setMini; toggleMini }
export type GranCrmTheme = 'inherit' | 'light' | 'dark' | 'navy'
```
`toggleDark`: si `resolved !== 'light'` → `light`, si no → `dark`. En `<html>`: `data-gcu-theme=resolved` + clase `app-skin-dark` cuando `dark`.

- [ ] Step 1: tests que fallan: guardado `navy` → `resolved==='navy'`, html con `data-gcu-theme="navy"` y `.app-skin-dark`; `system` + `matchMedia` oscuro → `dark`, y cambio en caliente del media query actualiza (Review Focus 1–2); `toggleDark` desde navy → light; `THEME_HEAD_SNIPPET` ejecutado en jsdom fija el atributo para los 4 valores.
- [ ] Step 2: implementar; `readStoredMode` acepta los 4 valores, valor desconocido → `light` con `log.warn`.
- [ ] Step 3: oxlint sin `only-export-components` en ThemeProvider; tests verdes; commit `feat(theme): navy y system en runtime`.

### Task 4: SCSS — oscuro por paleta, navy, Inter autoalojada, escalas Bootstrap

**Files:**
- Modify: `scss/themes/_variables.scss`, `scss/themes/_bs-custom-variables.scss`, `scss/themes/options/_theme-options-dark-theme.scss`, `scss/theme.scss`
- Create: `src/styles/fonts/inter-variable.woff2` (+ italic no: YAGNI), `@font-face` en `grancrm-ui.css`
- Test: `test/theme-css.contract.test.ts` (compila SCSS y verifica selectores)

- [ ] Step 1: test que falla: `theme.css` compilado contiene reglas bajo `html.app-skin-dark[data-gcu-theme=navy]` con `#0f172a` y no contiene `fonts.googleapis.com`.
- [ ] Step 2: mapas `$dark-palettes: (dark: (...), navy: (...))` con las 6 `$dark-theme-color-*` + `$navigation-*`/`$header-*`/`$topbar-*`; el cuerpo del archivo oscuro pasa a `@mixin dark-theme($p)` y se emite dos veces con `ponytail:` comentando el techo (CSS oscuro ×2) y la salida (subproyecto 2).
- [ ] Step 3: Bootstrap desde tokens generados: `$border-radius` 6, `$border-radius-sm` 4, `$border-radius-lg` 8, `$card-border-radius` 8, `$modal-content-border-radius` 12, `$input-height` / `$btn` alturas 36/32/40, `$box-shadow*` de `shadow-1..3`, `$border-color` semántico, `$font-family` con `"Inter Variable"` primero.
- [ ] Step 4: Inter: `npm i -D @fontsource-variable/inter`, copiar `files/inter-latin-wght-normal.woff2` a `src/styles/fonts/`, `@font-face{font-family:"Inter Variable";font-display:swap}`, quitar `@import url(fonts.googleapis…)`.
- [ ] Step 5: `npm run build` verde; commit `feat(theme): oscuro por paleta, navy runtime, Inter local, escalas Bootstrap`.

### Task 5: Refinamiento global en `grancrm-ui.css`

**Files:** Modify `src/styles/grancrm-ui.css` (capa global: body, foco, botones, controles, card, modal, toast, dropdown, tabs); Test `test/theme-css.contract.test.ts`.

- [ ] Step 1: tests que fallan: existe `@media (prefers-reduced-motion: reduce)` que fija `--gcu-duration-*:0ms` (Review Focus 5); `:focus-visible` de `.gcu-btn`/`.gcu-control` usa `--gcu-focus-ring` con offset; `.gcu-modal__content` usa `--gcu-radius-xl` y `--gcu-shadow-4`.
- [ ] Step 2: reemplazar valores sueltos de la capa global por tokens (radios, sombras, alturas, duraciones, z-index de modal/toast/dropdown). Reglas de dark de la capa global que solo cambian colores → borrarlas cuando el token semántico ya cubre el caso.
- [ ] Step 2b: bases premium (spec §5.1.1): `--gcu-press-scale`, hover solo con `@media (hover:hover)`, `.gcu-skeleton` con shimmer (sin animación con reduced-motion), keyframes `gcu-enter`/`gcu-exit` (opacidad + 6px), `::selection` primario suave, `scrollbar-gutter: stable` en `.gcu-scroll`, `.gcu-btn[aria-busy]` conserva ancho. Tests de CSS para cada una.
- [ ] Step 3: build y tests verdes; commit `feat(styles): refinamiento visual global desde tokens`.

### Task 6: Iconos Feather + Tabler

**Files:** Modify `src/components/ui/Icon.jsx` → `Icon.tsx`, tipos en `src/public/types.ts`; Modify `src/components/ui/Button.jsx` (`startIcon`/`endIcon` aceptan ReactNode); Test `test/Icon.test.tsx`; devDependency `@tabler/icons-react`.

- [ ] Step 1: tests: `<Icon name="plus"/>` → `i.feather-plus`; `<Icon icon={<IconRobot/>} size="md"/>` → svg 16px con `aria-hidden`; con `aria-label` → `role="img"`; `<Button startIcon={<IconRobot/>}>` renderiza svg.
- [ ] Step 2: implementar (tamaños 14/16/20 para sm/md/lg; xs/xl se conservan); commit `feat(icons): Icon y Button aceptan iconos Tabler`.

### Task 7: Gates extendidos

**Files:** Modify `scripts/audit-contract.mjs`; Create `scripts/audit/css-budget.json` (conteos por archivo de la línea base), `scripts/check-doctor.mjs`; Modify `package.json` (`gate:doctor`, `build`); Test `test/audit-contract.test.ts`.

- [ ] Step 1: tests: un `.jsx` con `style={{color:'#ff0000'}}` falla; un CSS de `src/styles` con más `!important` o más `.app-skin-dark` que su presupuesto falla; igual o menos pasa.
- [ ] Step 2: implementar; `check-doctor.mjs` falla si `Score < DOCTOR_MIN` (60). `gate:doctor` no entra en `prepare` (instalar desde git no debe correr react-doctor), sí en `build`.
- [ ] Step 3: commit `feat(gates): presupuesto CSS, hex y umbral react-doctor`.

### Task 8: Defectos P0/P1 de Fundaciones y react-doctor ≥ 60

**Files:** según `DEFECTOS.md` (mínimo: `src/components/ui/Tabs.jsx:106`, reglas `no-unsafe-dictionary-type`, `no-runtime-typeof`, aserciones, key por índice, estado derivado en efecto).

- [ ] Step 1: por cada regla: leer el código, decidir verdadero/falso positivo, test de regresión si cambia comportamiento, corregir.
- [ ] Step 2: `npm run doctor` ≥ 60, `npm test` verde; marcar cerrados en `DEFECTOS.md`; commit por familia de regla.

### Task 9: Storybook con Fundamentos

**Files:** Create `.storybook/main.ts`, `.storybook/preview.tsx`, `src/stories/foundations/{Color,Tipografia,Espaciado,Radios,Elevacion,Motion,Iconografia}.stories.tsx`, `src/stories/foundations/TokenTable.tsx`; Modify `package.json` (scripts `storybook`, `build-storybook`, `test:stories`), `Dockerfile`, `nginx.conf`, `.gitignore` (`storybook-static`).

- [ ] Step 1: `npm i -D storybook@10.6.1 @storybook/react-vite@10.6.1 @storybook/addon-a11y@10.6.1 @storybook/addon-docs@10.6.1`.
- [ ] Step 2: `preview.tsx`: importa bootstrap/theme/grancrm-ui; toolbar global `theme` (light/dark/navy) que fija `data-gcu-theme` y `.app-skin-dark` en `document.documentElement`.
- [ ] Step 3: stories de Fundamentos leyendo `tokens/tokens.json` (Color muestra contraste AA calculado; Motion respeta reduced-motion).
- [ ] Step 4: `npm run build-storybook` sin errores; `gate:package` confirma que nada de Storybook entra en `dist/`; commit `feat(docs): Storybook con Fundamentos`.

### Task 10: Documentación de reglas

**Files:** Create `docs/PRINCIPIOS.md`, `docs/REGLAS-DE-DISENO.md`, `docs/TOKENS.md`, `docs/ICONOGRAFIA.md`, `AGENTS.md`; Modify `CHANGELOG.md`, `package.json` version `2.1.0`.

- [ ] Step 1: escribir (REGLAS-DE-DISENO adapta `intouch-ui/docs/REGLAS-DE-DISENO.md` al ADN Duralux). `AGENTS.md` corto y accionable. CLAUDE.md del usuario no se toca (tiene cambios suyos); se reporta que conviene enlazar AGENTS.md.
- [ ] Step 2: commit `docs: principios, reglas, tokens, iconografía y AGENTS`.

### Task 11: Verificación final y visual

- [ ] Step 1: `npm run build` (todos los gates) y `npm test` verdes.
- [ ] Step 2: demo (`npm run dev:demo`) y Storybook (`npm run storybook`) en background.
- [ ] Step 3: `capture.mjs` → `…/despues/` en light/dark/navy; axe sin violaciones nuevas; leer PNGs y comparar con «antes»; corregir regresiones.
- [ ] Step 4: screenshots de Storybook Fundamentos en los 3 temas; revisar.
- [ ] Step 5: actualizar `DEFECTOS.md` y `baseline.json`; commit final.
