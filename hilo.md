## Sesión 2026-06-22 — @duralux/ui

### Lo que se hizo
- Completadas todas las showcase pages de la demo (Task 7 y 8):
  - StatsCardsPage, DataTablePage, FormsPage
  - ChartsPage (ApexChart: area/bar/donut/line + ChartCard)
  - RechartsPage (AreaChartWidget, BarChartWidget, PieChartWidget)
  - ChatComponentsPage, LayoutPage
- App.jsx y ShowcaseLayout ya tenían todas las rutas y nav links desde sesión anterior
- Build final verificado: 634 módulos → dist/index.js (ESM) + dist/index.cjs (CJS)
- README.md creado con tabla de componentes, props y guía de instalación
- Commit inicial en master (25 archivos)

### Bug corregido
- Demo no cargaba CSS: `publicDir` apuntaba a `duralux-admin/` pero la ruta real es
  `plantilla duralux/duralux-admin/` — corregido en demo/vite.config.js
- index.html referenciaba rutas inexistentes (`app.min.css`, `plugins/bootstrap.min.css`).
  Corregido a `bootstrap.min.css` + `vendors.min.css` + `theme.min.css` (igual que duralux-react)

### Estado actual
- Demo corriendo en http://localhost:5200 con estilos Duralux correctos ✓
- 33 componentes exportados, 17 páginas showcase funcionando ✓
- Sin remote GitHub todavía — pendiente `gh repo create` para habilitar `npm install github:...`
