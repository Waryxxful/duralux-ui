# @duralux/ui

**Único paquete compartido** del ecosistema GranCRM frontend.

Contiene:

1. **Design system Duralux** — componentes React con markup 1:1 del template (cards, forms, tables, charts, chat, layout genérico).
2. **Contrato shell↔satélite** — `GranCrmSession`, `AppManifestEntry`, `AppNavItem`, `EventBus`, `GranCrmRemoteProps`, `appHref` (`src/contract.ts`).
3. **Shell UI** — `ShellHeader`, `ShellNav`, `ThemeScope`, `ConfirmDialog`, extras GranCRM (`CardHeader`/`CardBody`/`StatCard`/`StatusBadge`, …) en `src/components/shell/`.
4. **Tokens** — `src/tokens.ts` (`SemanticVariant`, `StatusVariant`, colores/spacing).
5. **Cliente API** — `apiFetch` con CSRF + credentials same-origin (`src/api/client.ts`).
6. **Estilos del glue shell** — `src/styles/grancrm-ui.css` + feather icons (exportados en `dist/styles/`).

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
import '@duralux/ui/styles/grancrm-ui.css';
```

- El **shell** carga el CSS del glue una vez y monta `ShellHeader`/`ShellNav`.
- Las **satélites** importan componentes + tipos del paquete; **no** copian `types.ts` a mano.
- El CSS global del theme Duralux (`theme.min.css` / Bootstrap) lo sigue sirviendo el shell vía staticfiles del orquestador (hasta consolidar SCSS en este paquete — ver plan Fase 0/D2).

## Build

En este repo usar **`npm`**, no `pnpm` (bug de sandbox con el store SQLite de pnpm en este entorno — ver `plans/handoff.md`).

```bash
cd /home/admincrm/duralux-ui
npm install
npm run build
# produce dist/index.js, dist/index.cjs, dist/index.d.ts, dist/styles/
```

- Tipos reales (`contract`, `tokens`, shell components, `apiFetch`) se generan con `vite-plugin-dts` desde el `.ts`/`.tsx` fuente.
- Los ~26 componentes `.jsx` legacy se declaran como `any` en `scripts/write-index-dts.mjs` (mismo nivel de laxitud de siempre).
- `prepare` corre el build al instalar desde git, así los consumidores reciben `dist/` listo.

## Propagar un cambio a consumidores

1. Editá en `src/`, corré `npm run build` acá, commit + push a este repo.
2. En cada consumidor: `rm -rf node_modules && pnpm install` (pnpm cachea por commit del git dep; sin nuke a veces no refresca).
3. Rebuild del consumidor (`pnpm build`) y deploy según su README.

## Permisos (máquina compartida)

`dist/` puede quedar con archivos de otro usuario del grupo `admincrm` sin permiso de escritura de grupo. Si `npm run build` falla con `EACCES`: `sudo chmod -R g+w dist/`.
