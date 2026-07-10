# Guía: app satélite con `@duralux/ui`

Receta estándar para **apps nuevas** y migraciones (call_reviews es la de referencia).

## 1. Dependencias

```json
{
  "dependencies": {
    "@duralux/ui": "github:Waryxxful/duralux-ui",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1"
  }
}
```

- **Siempre** `github:Waryxxful/duralux-ui` (pin opcional: `#semver:^0.1.0` o commit SHA).
- **Nunca** `file:` local ni copiar `types.ts` / CSS del theme a mano.
- Prohibido: bootstrap npm, otra librería de componentes, otro set de iconos.

Tras un bump del paquete en consumidores:

```bash
rm -rf node_modules && npm install   # o pnpm si el entorno lo permite
npm run build
```

## 2. Estilos

| Contexto | Qué cargar |
|----------|------------|
| **Montado en el shell (prod MF)** | **Nada** de theme. El shell ya carga `bootstrap.min.css` + `theme.min.css` + glue. |
| **DevShell standalone** | `import '@duralux/ui/bootstrap.min.css'` + `import '@duralux/ui/theme.min.css'` + `import '@duralux/ui/styles/grancrm-ui.css'` |
| **CSS propio de dominio** | Un solo archivo (ej. `app.css`) usando variables Duralux/`--gcu-*`. Sin hex literales nuevos. |

## 3. Contrato MF

```tsx
import type { GranCrmRemoteProps } from '@duralux/ui';

export default function App({ contractVersion, basename, apiBase, session, bus }: GranCrmRemoteProps) {
  if (contractVersion !== '1') console.warn('Contrato incompatible', contractVersion);
  // 401 → bus.emit('sessionExpired')
}
```

- Sin `BrowserRouter` propio (el shell ya tiene el router).
- Validar `contractVersion`, emitir `sessionExpired` / `logout` por el bus.

## 4. Componentes

```tsx
import {
  PageHeader, Card, Button, Badge, Table, ResponsiveTable,
  EmptyState, LoadingState, FormField, Input, Modal, apiFetch,
} from '@duralux/ui';
```

1. ¿Existe en el paquete? → usalo.
2. ¿Es genérico y lo necesitarán otras apps? → PR a `duralux-ui` + página en `demo/`.
3. ¿Es de dominio? → solo en la app.

### PageHeader 1:1 Duralux

```tsx
<PageHeader
  title="Cuentas"
  subtitle="Opcional; va debajo sin romper breadcrumb"
  breadcrumbs={[{ label: 'SA' }, { label: 'Cuentas' }]}
  actions={<Button startIcon="plus">Nueva</Button>}
/>
```

## 5. Theming

El shell envuelve con `ThemeProvider` (dark + mini sidebar). Las satélites **no** implementan dark mode propio: heredan `html.app-skin-dark`.

Si una app corre standalone:

```tsx
import { ThemeProvider, THEME_HEAD_SNIPPET } from '@duralux/ui';
// en index.html <head>: <script>${THEME_HEAD_SNIPPET}</script>
```

## 6. Module Federation

- Expone `./App`
- `shared`: solo `react` / `react-dom` / `react-router-dom` **singleton** (mismas majors que el shell)
- **NO** pongas `@duralux/ui` en `shared` (desacopla deploys)

## 7. Deploy (DEV / QA / PROD)

### Paquete `@duralux/ui`

```bash
cd /home/admincrm/duralux-ui   # o clone fresco
npm install && npm run build
git tag v0.x.y && git push origin master --tags
```

### Shell

```bash
cd /home/admincrm/grancrm-shell
rm -rf node_modules && npm install
npm run build   # escribe staticfiles/shell (o VITE_SHELL_OUT_DIR)
# nginx ya sirve staticfiles/shell — sin restart de contenedor
```

### Satélite (ej. call_reviews)

```bash
cd frontend && rm -rf node_modules && npm install && npm run build
docker compose restart web   # o el proceso de deploy de la app
```

### Checklist PR de UI

- [ ] Importa de `@duralux/ui`, no copias
- [ ] Cero hex literales de diseño
- [ ] Dark mode OK (montado en shell)
- [ ] Probadomontado en shell, no solo standalone
- [ ] Versión de `@duralux/ui` ≤ shell mayor

## 8. Scaffold mínimo de remote

Copiar esqueleto de `call_reviews/frontend` (vite + MF + `src/App.tsx` + `src/types.ts` re-export). No hace falta generador hasta 3+ apps nuevas/año.
