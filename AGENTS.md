# AGENTS.md — reglas para agentes que construyen UI con @duralux/ui

Lee esto antes de crear o modificar cualquier pantalla del ecosistema GranCRM.

## Siempre

- Importa componentes desde `@duralux/ui`; gráficos desde `@duralux/ui/charts/apex` o `@duralux/ui/charts/recharts`. Nunca importes archivos internos de `dist/` o `src/`.
- Usa componentes de la librería antes que clases Bootstrap crudas. Si falta un componente genérico, va en esta librería, no en la app.
- Colores, espacios, radios, sombras y duraciones: **solo tokens** `var(--gcu-*)`. Nunca hex, rgb ni px mágicos en `style` o CSS.
- Texto visible en **español internacional con tuteo** («Selecciona», «Puedes»). Nunca voseo («Seleccioná», «Podés»).
- Una sola acción primaria por vista (`variant="primary"`); el resto `light-brand`.
- Botones de solo icono: `IconButton` con `label`.
- Toda cifra con contexto (meta, variación o tendencia). Números con `tabular-nums`.
- Estados completos: cargando (skeleton), vacío (qué pasó + acción), error (qué hacer + reintentar).
- Logging con `log` de `@duralux/ui` (prefijo `[duralux]`) en lógica de componentes nuevos.

## Nunca

- `btn-outline-*`, `btn-secondary`, `table-striped`, `bg-{tono}-100` (el gate `audit-contract` lo bloquea).
- `!important` nuevo ni overrides `.app-skin-dark` nuevos: usa tokens semánticos, que ya cambian por tema.
- Emoji en la interfaz.
- Nombres internos (tablas, SP, «payload») en texto visible.

## Temas

`ThemeProvider` maneja `light | dark | navy | system` y fija `data-gcu-theme` en `<html>`. No toques la clase `.app-skin-dark` a mano. Para un subárbol con otro tema, usa `ThemeScope`.

## Antes de terminar

```bash
npm run build     # contrato, tokens (AA), bundle, paquete, tipos y react-doctor
npm test
```

Verifica visualmente en Storybook (`npm run storybook`) en claro, oscuro y navy.

## Referencias

- `docs/PRINCIPIOS.md`, `docs/REGLAS-DE-DISENO.md`, `docs/PATRONES.md` (estructura de página), `docs/TOKENS.md`, `docs/ICONOGRAFIA.md`
- `tokens/tokens.json` (fuente de tokens)
- `docs/auditoria/DEFECTOS.md` (defectos conocidos)
