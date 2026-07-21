# @duralux/ui

**Único paquete compartido** del ecosistema GranCRM frontend.

Contiene:

1. **Design system Duralux** — componentes React adaptados al lenguaje visual y a los patrones de la plantilla para GranCRM (cards, forms, tables, charts, chat, layout genérico).
2. **Contrato shell↔satélite** — `GranCrmSession`, `AppManifestEntry`, `AppNavItem`, `EventBus`, `GranCrmRemoteProps`, `appHref` (`src/contract.ts`).
3. **Shell UI** — `ShellHeader`, `ShellNav`, `ThemeScope`, `ConfirmDialog`, extras GranCRM (`CardHeader`/`CardBody`/`StatCard`/`StatusBadge`, …) en `src/components/shell/`.
4. **Tokens** — `src/tokens.ts` (`SemanticVariant`, `StatusVariant`, colores/spacing).
5. **Cliente API** — `apiFetch` con CSRF + credentials same-origin (`src/api/client.ts`).
6. **Estilos** — Bootstrap y theme adaptado compilados desde `scss/`, más `src/styles/grancrm-ui.css` y feather icons.

Repo: `github.com/Waryxxful/duralux-ui`. Nombre npm: `@duralux/ui`.

> **`grancrm-ui` está deprecado.** Vivía en `orquestador/frontend/packages/grancrm-ui` y se fusionó acá. No crear capas intermedias nuevas.

Ver `CLAUDE.snippet.md` para el catálogo de componentes.

## Estructura relevante

```
src/
  index.js                 # re-exports públicos
  contract.ts              # contrato MF (única fuente de verdad)
  tokens.ts
  api/client.ts
  components/
    shell/                 # ShellHeader, ShellNav, ThemeScope, ConfirmDialog, GranCrmExtras
    ui/ layout/ form/ …   # design system
  styles/
    grancrm-ui.css
    feather-icons.css
    fonts/feather.woff
scss/
  bootstrap/bootstrap.scss
  theme.scss              # adaptación Duralux mantenida por GranCRM
```

## Consumo (siempre vía git, nunca `file:`)

```json
{
  "dependencies": {
    "@duralux/ui": "github:Waryxxful/duralux-ui"
  }
}
```

```ts
import {
  ShellHeader, ShellNav, Button, PageHeader,
  type GranCrmRemoteProps, type GranCrmSession, apiFetch,
} from '@duralux/ui';
import '@duralux/ui/bootstrap.min.css';
import '@duralux/ui/theme.min.css';
import '@duralux/ui/styles/grancrm-ui.css';
```

- El **shell** carga Bootstrap, theme y glue una sola vez y monta `ShellHeader`/`ShellNav`; una satélite montada en él no vuelve a importar esos estilos.
- En modo standalone, cargá los tres imports anteriores en ese orden. No se necesita Bootstrap JS ni jQuery.
- Las **satélites** importan componentes + tipos del paquete; **no** copian `types.ts`, CSS ni componentes genéricos a mano.
- Toda UI genérica compartida pertenece en este paquete. La satélite conserva únicamente UI específica de su dominio.
- El theme es una adaptación deliberada de Duralux para GranCRM, no una copia byte a byte de los CSS publicados por la plantilla.

## Build

En este repo usar **`npm`**, no `pnpm` (bug de sandbox con el store SQLite de pnpm en este entorno — ver `plans/handoff.md`).

```bash
cd /home/admincrm/duralux-ui
npm install
npm run build
# produce dist/index.js, dist/index.cjs, dist/index.d.ts, dist/styles/
```

- Tipos reales (`contract`, `tokens`, shell components, `Dropdown`, `apiFetch`) se generan con `vite-plugin-dts` desde el `.ts`/`.tsx` fuente.
- `scripts/write-index-dts.mjs` completa los contratos públicos de los componentes `.jsx`; las APIs con callbacks de consumo estricto deben mantenerse tipadas allí.
- `prepare` corre el build al instalar desde git, así los consumidores reciben `dist/` listo.

## Propagar un cambio a consumidores

1. Editá en `src/`, corré `npm run build` acá, commit + push a este repo.
2. En cada consumidor: `rm -rf node_modules && pnpm install` (pnpm cachea por commit del git dep; sin nuke a veces no refresca).
3. Rebuild del consumidor (`pnpm build`) y deploy según su README.

## Permisos (máquina compartida)

`dist/` puede quedar con archivos de otro usuario del grupo `admincrm` sin permiso de escritura de grupo. Si `npm run build` falla con `EACCES`: `sudo chmod -R g+w dist/`.
