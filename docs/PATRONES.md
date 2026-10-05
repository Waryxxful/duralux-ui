# Patrones de página

Ocho estructuras de página para las apps de GranCRM. Antes de diseñar una pantalla, elige el patrón que corresponde y compón con los componentes indicados. Cada patrón tiene una story de página completa en Storybook (`Patrones/…`) en claro, oscuro y navy; el código de `stories/patrones/` es la referencia ejecutable.

## Reglas comunes

- **Estructura:** `PageHeader` (con `className="sticky-top"`) como hermano de `<div className="main-content">`, nunca envuelto junto al contenido (ver `PAGE-STRUCTURE.md`). Un solo `h1` por página: el de `PageHeader`.
- **Una acción primaria por vista** (`variant="primary"`), en el `PageHeader` o en el bloque que la motiva (WelcomeBand, detalle de la bandeja). El resto, `light-brand`. Acciones masivas y de fila, `light-brand` o `danger`.
- **Grilla:** `DashGrid` con filas permitidas (12 · 8+4 · 7+5 · 6+6 · 4+4+4 · 3+3+3+3, y 4+8 / 5+7). Las celdas son contenedores: lo de adentro responde a su ancho (§12). Breakpoints de viewport solo para el layout de página (`row` / `col-lg-*` cuando la fila no es de DashGrid).
- **Encabezados:** títulos de bloques de primer nivel con `headingLevel={2}` (StatGroup, QuickTiles, KpiCard); `Card` ya usa `h2`.
- **Cifras con contexto** (meta, variación o tendencia) y en formato §8: `2.840`, `84 %`, `5:12`, `04-10-2026`, `#48213`.
- **Estados completos:** cargando (skeleton), vacío (qué pasó + acción) y error (qué hacer + reintentar) en cada bloque con datos.

## 1. Cola primero (tableros)

**Cuándo:** la pantalla de inicio de una operación o un área. Abre con lo que hay que atender, no con KPI iguales.

**Anatomía:**
1. Fila 8+4: `WelcomeBand` (la tarea con su cifra y la acción primaria) + `Spotlight` (la cifra protagonista con `Sparkline onColor`).
2. Fila 8+4: la cola en riesgo (`Card` + `Table` con `Severity`) + `StatGroup` con 2–4 cifras relacionadas.

**Componentes:** WelcomeBand, Spotlight, Sparkline, Card, Table, Severity, StatGroup, DashGrid.

**Errores comunes:** saludar en la WelcomeBand («Hola, Paula») en vez de nombrar la tarea; cuatro KpiCard iguales arriba; más de un Spotlight; estados solo en color (usa `Severity`, que lleva texto).

## 2. Reporte (analítica)

**Cuándo:** análisis de un período con filtros y exportación.

**Anatomía:**
1. `Card` de filtros: `DateRangeFilter` (dentro de `DuraluxAntdProvider`), selects y `Segmented` en una fila de controles de la misma altura; debajo `ActiveFilters` con el conteo de resultados.
2. Fila 8+4: tendencia con meta (`TrendLine` con `target`) + `StatGroup` del período con variación vs. el período anterior.
3. Fila 12: tabla de detalle (`DataTable` con orden y menú «Columnas»).

**Primaria:** «Exportar reporte» en el `PageHeader`.

**Errores comunes:** gráfico sin meta ni comparación; filtros aplicados que no se ven (siempre `ActiveFilters`); exportar sin decir qué período sale.

## 3. Directorio (cuentas, campañas, equipos)

**Cuándo:** recorrer un conjunto de entidades para entrar a una.

**Anatomía:**
1. `QuickTiles` con atajos (incluido el filtro de lo urgente: «Bajo la meta»). Un atajo deshabilitado explica por qué (`disabledReason`).
2. Búsqueda + `Segmented` «Tarjetas | Tabla».
3. Grilla de `EntityCard` en filas 4+4+4; la `DataTable` es la vista secundaria para comparar.

**Primaria:** «Crear …» en el `PageHeader`.

**Errores comunes:** tarjetas sin cifras (`stats`) ni estado (`chips`); la tabla como vista por defecto cuando la tarea es elegir una entidad; búsqueda sin estado vacío.

## 4. Tabla operativa (usuarios, logs, auditoría)

**Cuándo:** operar sobre muchas filas: filtrar, seleccionar y actuar.

**Anatomía:** una sola `Card` (`noPadding`) con `DataTable`:
- `toolbar` con `DataTableToolbar` (búsqueda, filas por página, filtros propios y `ctx.columnMenu`) y `ActiveFilters` debajo.
- `selectable` + `renderBulkActions` (usa `BulkBar`): acciones masivas `light-brand`, destructivas `danger`.
- `actions` para acciones de fila (ícono con etiqueta).

**Primaria:** «Invitar usuario» (o la creación que corresponda) en el `PageHeader`.

**Errores comunes:** varias cards con tablas parciales; botones de acción masiva `primary`; mensajes de sin resultados genéricos (di qué probar).

## 5. Bandeja (trabajo uno a uno)

**Cuándo:** revisar elementos de a uno: evaluaciones, casos, solicitudes.

**Anatomía:** fila 5+7.
- Izquierda: `Card` con `List` `selectionMode="single"` dentro de un `.gcu-scroll` con alto máximo; cada ítem con prioridad (`Severity`), título, meta e indicador a la derecha (`Score`).
- Derecha: detalle fijo en una `Card` con `DescriptionList`, la cifra clave (`ScoreHero`) y la acción primaria en el pie.

**Errores comunes:** abrir el detalle en un modal (pierde el contexto de la lista); que la página entera se desplace con la lista; lista vacía sin explicación.

## 6. Espacio de trabajo (una entidad en profundidad)

**Cuándo:** la vista de una campaña, cliente o ejecutivo.

**Anatomía:**
1. Fila 12: cabecera con metadatos (`DescriptionList` de 3 columnas) y la cifra clave (`KpiCard` con `status` si está fuera de meta).
2. Fila 8+4: el trabajo a la izquierda (`Tabs` con `TrendLine`, `RankList`, tablas) y el contexto a la derecha (`ActivityFeed`, datos relacionados).

**Primaria:** la acción que mueve la cifra clave («Asignar ejecutivos»), en el `PageHeader`.

**Errores comunes:** poner avatar y nombre de la entidad dentro del `PageHeader` en vez de la cabecera; más de una cifra protagonista; pestañas para contenido que debería verse a la vez.

## 7. Ajustes

**Cuándo:** configuración de una cuenta, módulo o perfil.

**Anatomía:** `row` con navegación de secciones a la izquierda (`col-lg-3`, `List` con `active` dentro de un `nav` con nombre) y el formulario a la derecha (`col-lg-9`): `Fieldset` con `columns={2}`, `FormField`, `RadioGroup` y `Switch` con `description` que dice la consecuencia.

**Guardado explícito:** «Guardar cambios» (primaria) y «Descartar cambios» en el `PageHeader`, deshabilitados sin cambios y con el motivo en `title`. Al guardar, `Alert` con `announce`.

**Errores comunes:** guardar al cambiar cada campo sin avisar; un botón de guardar por sección (varias primarias); secciones sin permiso que desaparecen sin explicación (deshabilítalas y di qué rol se necesita).

## 8. Acceso

**Cuándo:** ingreso, recuperación de contraseña, invitaciones.

**Anatomía:** `AuthLayout` con un `h1`, una línea de contexto, el formulario (`FormField` + `Input` con `autoComplete`) y un único botón primario de ancho completo con `loading`. El error va en un `Alert` `danger` con `announce`, arriba de los campos, y no borra lo escrito.

**Errores comunes:** revelar si el correo existe; mensajes como «Error 401»; botón sin estado de carga.

## Qué falta en la librería

Los patrones se componen solo con componentes existentes. Pendientes detectados al construirlos:

- `PageHeader` todavía no es sticky por defecto (se usa `className="sticky-top"`) ni suprime el borde del título sin breadcrumbs (la story usa una clase local).
- No hay un componente de navegación de secciones para Ajustes: se usa `List` con `active`.
- No hay una barra de filtros dedicada: se usa una fila flexible (`sb-patron-filtros` en las stories) con `FormField`.
