# Receta de componente

Cómo se refina o se crea un componente de `@duralux/ui`. El ejemplar es **Button**
(`src/components/ui/Button.tsx`, `src/styles/components/button.css`,
`test/Button.refined.test.tsx`, `test/button-css.test.ts`, `stories/componentes/Button.stories.tsx`).

## Pasos

1. **Test primero.** Escribe el comportamiento nuevo en `test/<Componente>.refined.test.tsx` y míralo fallar con `npm test -- <archivo>` (nunca `npx vitest`).
2. **TSX con tipos reales.** El componente pasa a `.tsx`, con `forwardRef` hacia el elemento nativo y las props de `src/public/types.ts`. En `src/public/components.ts` se exporta tal cual (`export { X } from '…'`), sin `asComponent`.
3. **API congelada.** Solo se agregan props. Lo que cambia de nombre o se ignora pasa por `deprecate('<clave>', '<qué usar>')`; se elimina en la siguiente mayor (lo deprecado en 2.x se retiró en 3.0).
4. **CSS propio.** Las reglas del componente viven en `src/styles/components/<nombre>.css`, con una línea `@import` al inicio de `grancrm-ui.css`. Solo tokens `var(--gcu-*)`: sin hex, sin `!important`, sin `.app-skin-dark` (los tokens ya cambian por tema). Las reglas viejas del componente se **borran** de `grancrm-ui.css` y del SCSS oscuro cuando el archivo nuevo las cubre: el presupuesto CSS solo baja.
5. **Detalles de oficio** (`docs/REGLAS-DE-DISENO.md` §11, Craft): hover frecuente sin transición, números tabulares en cifras que cambian, radios anidados, contornos de imagen, alineación óptica de íconos. Responsivo por contenedor (§12): `.gcu-container` + `@container`, no breakpoints de viewport.
6. **Estados completos** (`docs/REGLAS-DE-DISENO.md` §6): hover con puntero, presión, `:focus-visible`, disabled explicado, loading sin salto de ancho, vacío y error cuando aplique.
7. **a11y.** Patrón ARIA APG, operable con teclado, nombre accesible, `aria-busy` en carga. Axe en la story sin violaciones.
8. **Logging.** Errores, fallbacks y deprecaciones con `log` / `deprecate` (prefijo `[duralux]`).
9. **Story** en `stories/componentes/<Área>/<Componente>.stories.tsx`: `Playground` con controles, jerarquía o variantes, tamaños, estados y un caso real (tabla densa, formulario). Revisarla en claro, oscuro y navy.
10. **Verificar:** `npm test`, `npm run build` (contrato, tokens AA, presupuesto CSS, bundle, paquete, tipos, react-doctor) y `node scripts/audit/capture.mjs --storybook http://localhost:6006 --out <dir> --themes light,dark,navy`.
11. **Cerrar defectos** que el componente tenía en `docs/auditoria/DEFECTOS.md`.

## Tree-shaking

- Toda llamada a nivel de módulo va anotada como pura: `export const X = /* @__PURE__ */ forwardRef<…>(…)`. Sin la anotación el bundler no puede descartar el componente y una app que importa solo Button arrastra toda la librería (el `gate:bundle` lo detecta: límite 20 KB gzip).
- Nada de `X.algo = …` suelto a nivel de módulo: usa `/* @__PURE__ */ Object.assign(XBase, { algo })`.

## Prohibido

- `npx vitest` (el hook lo reescribe a pnpm y rompe `node_modules`): usa `npm test -- <archivo>`.
- pnpm en este repo: se construye con npm.
- Tocar `CLAUDE.md`, `CLAUDE.snippet.md`, `PAGE-STRUCTURE.md` o `README.md` (tienen cambios del usuario sin commitear).
- Re-fijar el presupuesto CSS después de un build rojo.
