# 2.6 — Patrones de página, layout y shell (sub-spec + plan)

Deriva del spec maestro §6 (subproyecto 4) y §9 (shell). Receta: `docs/RECETA-COMPONENTE.md`.

## Layout y shell existentes (refinamiento)

AppLayout, Header, Sidebar, PageHeader, Footer, AuthLayout, ShellHeader, ShellNav, ThemeScope.

- **ShellHeader (32 KB)** se divide en piezas exportadas: `AppSwitcher`, `TenantSwitcher`, `NotificationsMenu`, `ProfileMenu`, `ThemeToggle` (claro / oscuro / navy / sistema). `ShellHeader` las compone y conserva sus props actuales (el shell de GranCRM lo usa: se verifica en DEV).
- **PageHeader** sticky por defecto con sombra solo al hacer scroll (`IntersectionObserver` sobre un centinela); acciones a la derecha, máximo una primaria.
- **Sidebar/ShellNav:** ítem activo con barra y superficie, mini-menú con tooltips (usa `Tooltip` de 2.5), foco visible, navegación por teclado.
- **AuthLayout:** pantalla de acceso con tokens, mensajes de error accesibles.

## Nuevos

| Componente | Comportamiento |
|---|---|
| `CommandPalette` | Ctrl/Cmd + K; búsqueda difusa sobre comandos y navegación; `combobox` + `listbox` APG; recientes |
| `ThemeToggle` | Menú con los cuatro modos; refleja `mode` y `resolved` |

## Patrones de página (stories «Patrones/…» + `docs/PATRONES.md`)

Cada patrón es una story de página completa con datos realistas, en tres temas:

1. **Cola primero** (tableros): WelcomeBand + Spotlight en 8+4, luego la cola en riesgo y un StatGroup.
2. **Reporte** (analítica): barra de filtros con `DateRangeFilter`, tendencia con meta, tabla de detalle.
3. **Directorio** (cuentas, campañas): QuickTiles + grilla de EntityCard; tabla como vista secundaria.
4. **Tabla operativa** (usuarios, logs, auditoría): card con toolbar, DataTable, BulkBar, acciones de fila.
5. **Bandeja** (trabajo uno a uno): lista a la izquierda (5 col.) y detalle fijo (7 col.).
6. **Espacio de trabajo** (una entidad en profundidad): cabecera con metadatos y cifra clave, 8+4.
7. **Ajustes**: navegación lateral de secciones, formularios con guardado explícito.
8. **Acceso**: AuthLayout.

## Entrega

**2.6.0**, desplegada en DEV (el shell usa ShellHeader/ShellNav: verificación visual obligatoria de header, menús y tema).
