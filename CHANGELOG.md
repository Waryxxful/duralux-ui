# Changelog

Los cambios notables de `@duralux/ui` se registran aquí. Este archivo describe el contenido del commit de preparación; la publicación requiere crear el tag `v2.0.0` después de que CI valide el commit.

## 2.0.0 — preparación de release

### Cambios incompatibles

- Los componentes y motores de charts ya no se exportan desde `@duralux/ui`. Actualizá los imports a `@duralux/ui/charts/apex` o `@duralux/ui/charts/recharts`.
- `apexcharts`, `react-apexcharts` y `recharts` son peer dependencies opcionales. Instalá sólo los peers del subpath que uses.
- El paquete declara ESM (`"type": "module"`) y mantiene entradas CJS mediante `exports`; los consumidores deben importar subpaths públicos, no archivos internos de `dist/`.
- Las declaraciones públicas ahora reflejan los contratos reales. En particular, labels y placeholders de selects avanzados son texto (`string | number`), y `renderValue` de `SearchableSelect` debe devolver texto porque se muestra en un input nativo.
- `FormField` ya no infiere que cualquier wrapper React es un control. Los wrappers propios que reenvían props deben declarar `duraluxFormControl = true`; los wrappers visuales dejan de recibir atributos de input por accidente.

### Agregado

- `SearchableSelect`: selección única buscable, combobox accesible, teclado/IME, valores controlados o no controlados, limpieza opcional y submit nativo mediante `name`.
- `MultiSelect`: búsqueda, chips eliminables, `max`, teclado y un input oculto por valor seleccionado.
- `InputGroup` con reenvío conservador de semántica de campo al único control hijo.
- `DataTableToolbar`, `CardLoader`, `AvatarGroup`, `Footer` y mejoras de catálogo.
- Tokens semánticos generados y verificables para TypeScript, SCSS y CSS runtime.
- Entrypoints `@duralux/ui/charts`, `@duralux/ui/charts/apex` y `@duralux/ui/charts/recharts`.

### Mejorado

- Contraste, dark mode, foco, reduced motion, SSR, estados de carga/error/vacío y tablas alternativas accesibles de charts.
- Modal, toast, formularios, tablas, paginación, shell, chat, dropdown, botones y API `apiFetch`.
- `apiFetch` conserva `Response`, `credentials: 'same-origin'`, todas las formas de `HeadersInit` y sólo serializa JSON cuando corresponde; también reexporta `SESSION_EXPIRED_EVENT` como alias de compatibilidad para el evento 401.
- Empaquetado, declaraciones TypeScript, tree-shaking y gates de contrato/tamaño.

### Migración rápida

```diff
- import { ApexChart, ChartCard } from '@duralux/ui'
+ import { ApexChart, ChartCard } from '@duralux/ui/charts/apex'
```

```bash
# Sólo si se usa Apex
npm install apexcharts react-apexcharts

# Sólo si se usan widgets Recharts
npm install recharts
```

Consultá los ejemplos de `SearchableSelect`, `MultiSelect`, `InputGroup` y charts en el [README](./README.md), y las validaciones/advertencias aceptadas en [docs/RELEASE_V2.md](./docs/RELEASE_V2.md).
