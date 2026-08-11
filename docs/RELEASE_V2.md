# Preparación de release v2.0.0

Este es el registro previo al commit de `@duralux/ui` 2.0.0. La validación de build se ejecutó en un directorio aislado; `dist/` no se escribe en el worktree de integración.

## Validaciones aprobadas

| Check | Resultado |
|---|---|
| `npm test` | 47 archivos y 346 tests aprobados tras la reconciliación |
| `npm run typecheck` | aprobado |
| `npm run build` aislado | aprobado: contrato de imports, tokens semánticos, Vite, estilos, fixture público de tipos y gates de bundle/paquete |
| `npm audit` | 0 vulnerabilidades |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| React Doctor | salida 0; 73/100, sin errores (warnings aceptados abajo) |

La remediación del lockfile actualiza transitivas sólo de desarrollo a versiones corregidas: `react-router`/`react-router-dom` 7.18.2, `postcss` 8.5.26 y `nanoid` 3.3.18. No queda ninguna vulnerabilidad de dependencias de producción.

## Advertencias aceptadas explícitamente

### Deprecaciones de Sass

Dart Sass emite deprecaciones de `if()` heredado y unidades de función desde la fuente vendorizada de Bootstrap en `scss/bootstrap/_functions.scss`, no desde código de componentes Duralux. El build termina correctamente y pasan los contratos CSS. Reescribir esa copia durante este release mayor crearía una divergencia amplia y riesgosa; se difiere al refresh de Bootstrap/vendor del próximo ciclo de mantenimiento.

### React Doctor

El hook pre-commit de React Doctor, que analiza el conjunto staged completo, informa 37 warnings y ningún error:

- 23 `only-export-components`: helpers de charts, tablas, navegación y tema comparten archivo deliberadamente con componentes estrechamente acoplados. Moverlos ahora sería un refactor amplio de límites de módulos, sin beneficio de runtime ni accesibilidad.
- 7 `no-adjust-state-on-prop-change` y 1 reset: reconciliación controlada/no controlada, cierre de listbox deshabilitado, reparación de foco, clamping de paginación y limpieza de disclosures de navegación. Estas transiciones preservan invariantes públicos y tienen regresiones focalizadas.
- 2 `no-giant-component`: `DataTable` y `ShellHeader` quedan como candidatos para una extracción dedicada tras estabilizar v2.
- 1 warning de modal, 1 de rol de progreso y 2 de callbacks de tabs: el modal con portal necesita stacking/foco/fondo más allá de un diálogo nativo; el markup Bootstrap de la barra usa el rol ARIA válido `progressbar`; tabs sólo notifica al padre cuando necesita reconciliar una key controlada inválida.

Se aceptan como deuda no bloqueante, no como errores ignorados. Deben reevaluarse antes de v2.1; no se deben añadir warnings nuevos sin una justificación documentada equivalente.

## Brecha de validación restante

No se ejecutaron checks visuales de navegador ni axe/Playwright porque esas herramientas no están disponibles en este entorno. La suite cubre contratos de runtime, SSR, teclado y accesibilidad, pero el release candidate todavía debe recibir una pasada visual/aXe en CI o en un entorno con navegador.

## Handoff de release

1. Revisar el candidato reconciliado contra la rama fuente actual, manteniendo intactos sus archivos dirty preexistentes.
2. Reejecutar las validaciones anteriores en CI desde este árbol reconciliado.
3. Revisar el tarball generado y crear commit/tag sólo tras aprobación.
