# Migración: scraper

- **Ruta:** `/home/admincrm/scraper/frontend`
- **SHA fijado:** `6b3757c` (1.0.0, anterior a 2.0). Destino: `a013852` (2.5.0).
- **Rol:** remoto MF que **no** comparte `@duralux/ui`.

## Qué cambia

Salta de 1.0 a 2.5. `DataTable` (7 usos) pasa a TanStack con la misma API; `Table` (2) y `PageHeader` (11) cambian visualmente con el refinamiento de 2.4.

## Patrones detectados

| Patrón | Dónde | Reemplazo |
|---|---|---|
| `trendUp` deprecado | `src/pages/ProyectosListPage.tsx:47,57` | `delta` con `goodWhen` |
| `iconBg` deprecado | `src/pages/ProyectoDetailPage.tsx:102-142` (incluye `bg-soft-teal`) | `StatsCard` con `tone`, `KpiCard`; `Timeline` sin `iconBg` |
| Hex (7) | `ProyectosListPage.tsx`, `PaginaDetailPage.tsx` | Tokens |
| `!important` (1) | `src/pages/ProyectosListPage.css` | Tokens o ajuste de especificidad |
| PageHeader sin sticky | 11 usos | `className="sticky-top"` (hasta 2.6) |

## Pasos

1. Subir el SHA, reinstalar, compilar y corregir tipos.
2. Reemplazar props deprecadas y hex.
3. Probar `DataTable` (orden, paginación, acciones) y validar en tres temas.
