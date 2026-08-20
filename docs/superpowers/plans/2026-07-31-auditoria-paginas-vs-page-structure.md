# Auditoría: páginas reales vs. PAGE-STRUCTURE.md

> Consolidado de 4 auditorías independientes (una por app consumidora de `@duralux/ui`).
> Referencia: `/home/admincrm/duralux-ui/PAGE-STRUCTURE.md`. No se corrigió nada — solo
> diagnóstico, priorizado por impacto.

## Resumen ejecutivo

| App | Páginas revisadas | Hallazgo dominante |
|---|---|---|
| `plataformas/frontend` | 5/5 | No usa el design system en absoluto: sin `PageHeader`, tablas a mano, Bootstrap crudo. Caso más grave. |
| `orquestador/frontend/sa` | 5/5 | Usa bien `ResponsiveTable`/`PageHeader`, pero la lógica de negocio completa vive en `pages/` (Regla 0). |
| `grancrm-shell` | 2 páginas + layout | Mismo patrón que `sa`: `NotificationSettingsPage` viola fuerte Regla 0; el layout raíz sí es fiel a v2. |
| `call_reviews/frontend` | 6 páginas | La más madura: ya extrae modelos (`*PageModel.ts`). Solo 2 desviaciones sistémicas concretas. |

Patrón transversal en 3 de las 4 apps (todas salvo `plataformas`): **botones de acción de formulario mal ubicados** y/o **lógica de negocio en el archivo de página en vez de en `components/<feature>/`**. `plataformas/frontend` es un caso aparte — no adoptó el design system, no solo la estructura de página.

---

## Hallazgos priorizados (todas las apps)

### P0 — `plataformas/frontend`: no usa el design system

Las 5 páginas (`DashboardPage`, `ReportesHubPage`, `ModuloReportePage`, `ProductividadPage`,
`StubPage`) están en Bootstrap crudo: sin `PageHeader` (breadcrumb casero con `<Link>`),
tablas HTML a mano sin TanStack Table, inputs `form-select`/`form-control` sin envolver,
y `ModuloReportePage`/`ProductividadPage` con 300+ líneas de lógica (`useState`,
`useEffect` encadenados, fetch, validación) directo en el archivo de página.

**Antes de tocar código:** confirmar si esta app está deliberadamente fuera del alcance
de "seguir Duralux fielmente" (el fork que la auditó notó que no tiene ni siquiera la
carpeta `components/<feature>/` por página, ni `route/router.jsx` centralizado — parece
un panel más simple, construido aparte). Si se decide alinearla, es la app que más
esfuerzo requiere de las 4 — casi una migración, no un ajuste.

### P1 — Botones de acción de formulario al final del card, no en el header (Sección 3)

Regla dura de `PAGE-STRUCTURE.md`: los botones de acción de un formulario van en
`PageHeader`/`AppPage` (prop `actions`), nunca al final del `Card`/`DuraluxCard`.

- `call_reviews/frontend`: `AgentFormPage.tsx:103-110`, `ServiceFormPage.tsx:98`,
  `CampaignFormPage.tsx:102` — los 3 ponen Guardar/Cancelar dentro del `DuraluxCard`.
  Fix: mover a la prop `actions` de `<AppPage>`, como ya hacen `CallListPage`/`CallDetailPage`.
- `plataformas/frontend`: mismo problema en `ModuloReportePage`/`ProductividadPage`
  (botón "Buscar" dentro del `<form>`), cubierto también por P0.

### P2 — Lógica de negocio completa en `pages/` en vez de `components/<feature>/` (Regla 0)

Todas las páginas de `orquestador/frontend/sa` (`AccountsPage`, `AccountDetailPage`,
`UsersPage`, `ApplicationsPage`, `SyncLogsPage`) y `grancrm-shell/NotificationSettingsPage.tsx`
concentran fetch + estado de formulario + handlers + JSX de modales, todo en el archivo
de `pages/`. No es un problema visual, es de mantenibilidad — archivos de 80-300+ líneas
difíciles de testear.

Fix por caso (ejemplos concretos, no genéricos):
- `orquestador/frontend/sa/.../UsersPage.tsx`: extraer a `components/users/UsersContent.tsx`
  (o un hook `useUsers()`) toda la carga de datos y los handlers `create`/`saveEdit`/`remove`.
  De paso, unificar `form`/`setForm` y `editForm`/`setEditForm` (estados duales casi
  idénticos) en un solo `useState` con modo `create | edit`.
- `grancrm-shell/src/pages/NotificationSettings/NotificationSettingsPage.tsx`: extraer
  los 3 `useEffect`/`apiFetch` y los handlers de push/suscripción a un hook
  `useNotificationSettings()`, y el JSX del acordeón a `components/notificationSettings/`.
- `grancrm-shell/src/pages/Hub/HubPage.tsx`: menor prioridad — mover los sub-componentes
  ya definidos inline (`DefaultAppModal`, `AppCard`, líneas 8-70) a
  `components/hub/DefaultAppModal.tsx` y `components/hub/AppCard.tsx`.

**Nota de calibración:** `call_reviews/frontend` ya resuelve esto parcialmente vía
`*PageModel.ts` (extracción del modelo de datos, aunque el `useState`/`useEffect` de
conexión sigue en la página) — es el patrón más cercano a la regla y puede servir de
referencia para migrar `sa` y `grancrm-shell`, en vez de inventar un patrón nuevo.

### P3 — Widget de dashboard sin auto-contenerse (Sección 5)

`call_reviews/frontend/.../DashboardPage.tsx:266`: cada `StatCard` se envuelve en
`<div className="col-xxl-3 col-md-6">` en el `.map()` de la página; `StatCard.tsx` no
tiene ninguna clase `col-*` propia. Fix: mover la clase de columna adentro de `StatCard`
(prop o wrapper interno), dejando `DashboardPage` como
`{dashboardKpis.map(kpi => <StatCard key={kpi.key} {...kpi}/>)}`.

### P4 — Inconsistencia de tabla: dos convenciones conviviendo (impacto medio, no urgente)

`call_reviews/frontend`: `DashboardPage` usa `ResponsiveTable` genérico (solo define
`columns`), pero `CallListPage` delega a `CallResultsTable`, un componente bespoke con
lógica propia de ordenamiento (`ordering`/`onOrderingChange`). No es necesariamente un
error — puede haber una razón real (ordenamiento de columna específico que
`ResponsiveTable` no soporta como prop) — pero requiere una decisión: documentar como
excepción consciente en el propio repo, o generalizar `ResponsiveTable` para que
`CallResultsTable` deje de ser necesario.

### No son hallazgos (decisiones conscientes correctas, documentar y no tocar)

- `grancrm-shell/NotificationSettingsPage.tsx` usa `<Tabs>` de `@duralux/ui` en vez de
  `data-bs-toggle` manual — preferible al patrón manual de v2, no un defecto.
- `orquestador/frontend/sa/AccountDetailPage.tsx` no usa tabs porque no los necesita (2
  `Card` en columnas) — la Sección 2 no aplica.
- `call_reviews/frontend` no tiene vistas con tabs en absoluto — no aplica la Sección 2.
- El layout raíz de `grancrm-shell` (`Layout.tsx`) ya replica fielmente `root.jsx` de v2.

---

## Siguiente paso sugerido

Este documento es diagnóstico, no un plan de ejecución bite-sized. Antes de generar
planes de corrección tipo `superpowers:writing-plans` por repo (uno por app, dado que son
4 codebases con dueños/branches distintos), conviene decidir:

1. ¿Se corrige `plataformas/frontend` (P0) como una migración completa, o queda fuera de
   alcance por ahora?
2. ¿Se prioriza primero P1 (fix mecánico, bajo riesgo, 3-4 archivos) antes que P2
   (refactor de mayor superficie, mayor riesgo de regresión en 6+ páginas)?
