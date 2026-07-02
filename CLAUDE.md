# @duralux/ui

Sistema de diseño React puro (Bootstrap + tema Duralux/NXL). Fuente de verdad visual
para todas las apps de GranCRM. No conoce nada de GranCRM/shell/sesión — eso vive en
`grancrm-ui` (capa de arriba).

Ver `CLAUDE.snippet.md` para el catálogo de componentes y cómo se importa desde una app.

## Consumidores (nadie te importa directo salvo uno)

```
duralux-ui  →  grancrm-ui (/home/admincrm/orquestador/frontend/packages/grancrm-ui)  →  shell, call_reviews
```

**`grancrm-ui` es el único consumidor directo permitido.** Ninguna otra app (call_reviews,
incitrack, wsp_platform, etc.) debe importar `@duralux/ui` directo — todas pasan por
`grancrm-ui`, que bundlea este paquete adentro (tsup `noExternal`) y agrega el glue
propio de GranCRM.

## Si editás un componente acá, hay que propagar el cambio a mano

`file:` dependencies de pnpm/npm **no se trackean en vivo** — son una copia tomada en el
momento del install. Editar y buildear acá no le llega solo a nadie.

```bash
# 1. Buildear este repo
cd /home/admincrm/duralux-ui && npm run build

# 2. Refrescar + rebuildear grancrm-ui (su hook `prepare` encadena el build)
cd /home/admincrm/orquestador/frontend && pnpm install

# 3. Propagar a cada consumidor externo (repo separado) — verificado en vivo: ni
#    `pnpm install`, ni `--force`, ni bumpear versiones fuerzan la actualización acá.
#    Único fix confiable es nuke node_modules del lado del consumidor:
cd /home/admincrm/call_reviews/frontend && rm -rf node_modules && pnpm install
cd /home/admincrm/call_reviews/frontend && pnpm build && docker compose restart web   # deploy
```

Detalle completo del porqué (caché de pnpm por lockfile, no por contenido) está
documentado en `orquestador/frontend/packages/grancrm-ui/CLAUDE.md`.

## Permisos (máquina compartida, usuarios `admincrm`/`tomas`/`pancho`)

`dist/` puede quedar con archivos de otro usuario del grupo `admincrm` sin permiso de
escritura de grupo. Si `npm run build` falla con `EACCES` al borrar algo en `dist/`:
`sudo chmod -R g+w dist/`.
