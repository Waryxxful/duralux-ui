# Reglas de estructura de página — Duralux v2

> Guía para agentes IA: cómo crear una página nueva o corregir una existente para que
> siga fielmente la plantilla `duralux-v2` (React + Vite). Basado en lectura directa del
> código fuente de `duralux-v2/Duralux/src`, no en suposiciones. Cuando la plantilla misma
> es inconsistente entre páginas, se marca explícitamente como **"no es regla"** — no
> copiar esa inconsistencia como si fuera intencional.

## Regla 0 — toda página es un orquestador delgado

En **todos** los tipos de página (listado, vista, crear/editar, auth, dashboard), el
archivo en `pages/` no contiene markup de negocio: solo compone `PageHeader` + un
componente de contenido del feature, o en auth, un wrapper visual + un form component.
Cero `useState`/lógica en el archivo de página. Si estás escribiendo una página y sientes
la tentación de meterle un `useState` o un `fetch`, esa lógica va en el componente de
`components/<feature>/`, no en `pages/`.

```jsx
// patrón universal de pages/<algo>.jsx
const XPage = () => (
  <>
    <PageHeader><XHeader /></PageHeader>
    <div className="main-content">
      <div className="row">
        <XContent />
      </div>
    </div>
    <Footer /> {/* solo en listados y dashboard — ver Regla 5 */}
  </>
)
export default XPage
```

El layout raíz (`root.jsx` para apps autenticadas, `layoutAuth.jsx` para auth) provee el
chrome (`Header`, `NavigationMenu` o nada) vía `<Outlet/>` — la página nunca reimplementa
navegación ni header global.

**Regla dura — `PageHeader` va pegado al navbar, nunca envuelto junto al contenido.**
No poner `<PageHeader>` + contenido dentro de un wrapper común (ej.
`<div className="container-fluid py-3">`) — cualquier padding en ese wrapper separa
visualmente el header del navbar (bug real encontrado: ~38px de gap). `PageHeader` es
un elemento hermano de `.main-content`, no un hijo del mismo contenedor con padding.

**Caso de borde — página sin `breadcrumbs` (ej. un Dashboard raíz).** El theme le pone
al `<h1>` del `PageHeader` un `border-right` fijo para separarlo del breadcrumb
(`scss/themes/layouts/_nxl-common.scss`). Si la página no pasa `breadcrumbs`, ese borde
queda "colgando" sin nada después. Suprimirlo con una clase scoped en esa página
puntual (no tocar el componente `PageHeader` global, que sí lo necesita cuando hay
breadcrumb).

---

## 1. Páginas de listado (`{recurso}-list`)

**Archivo:** `pages/{recurso}-list.jsx` — solo compone `PageHeader` + `<XHeader/>` +
`<XTable/>` + `<Footer/>`.

**Regla dura — la tabla nunca es markup propio.** Todo listado usa el wrapper compartido
`components/shared/table/Table.jsx` (props: `data`, `columns`). El feature define
**solo** las `columns` de TanStack Table — nunca reimplementa `<table>`, paginación,
buscador ni `dataTables_wrapper` a mano.

- Primera columna casi siempre `accessorKey: 'id'` con checkbox de selección (header:
  `table.getToggleAllRowsSelectedHandler()`, cell: `row.getToggleSelectedHandler()`).
- Última columna siempre `accessorKey: 'actions'`, `meta: { headerClassName: 'text-end' }`:
  ícono ver (`FiEye` + `Link`) + `<Dropdown dropdownItems={...} triggerIcon={<FiMoreHorizontal/>}>`
  con acciones y divisores (`{ type: 'divider' }`).

**Header del listado (`XHeader.jsx`):** `<PageHeader>` deriva breadcrumb/título solo del
`pathname` — no le pases props de texto. El `XHeader` aporta los `children`:
`div.page-header-right-items-wrapper` con botones `btn btn-icon btn-light-brand`,
`Dropdown`s de filtro, y siempre cierra con `Link to=".../create" className="btn btn-primary"`
+ ícono `FiPlus` + texto `"Create {Singular}"`.

**Nombres:** carpeta `components/{feature}/` (minúscula/camelCase — la plantilla mezcla
`customers/`, `leads/`, `projectsList/`, no hay una única forma correcta, elegí kebab o
camelCase y sé consistente dentro de tu propia app). Mínimo `XHeader.jsx` + `XTable.jsx`.

**No es regla:** el nombre del archivo de página mezcla kebab-case (`customers-list.jsx`)
y camelCase (`leadsList.jsx`) en la propia plantilla v2 — no sigas esa inconsistencia,
elegí **kebab-case** para archivos de página en este proyecto y aplícalo siempre.
Tampoco es regla que `Footer` esté presente (aparece en 2 de 3 ejemplos de v2) — decide
una convención fija para el proyecto (recomendado: **siempre** presente en listados) y
no la varíes página a página.

---

## 2. Vistas de detalle con tabs (`{recurso}-view`)

**Archivo de página:** `pages/{recurso}-view.jsx` — `PageHeader` + `<XViewHeader/>` como
children (barra de acciones, no un "hero" con avatar) + `<div className="main-content">
<div className="row"><XContent/></div></div>`.

**Regla dura — una sola card grande, tabs Bootstrap nativos, sin estado de React.**
Toda vista de detalle es: `PageHeader` con acciones → una única `<div className="card
border-top-0">` que contiene un `<ul className="nav-tabs" id="myTab">` con
`data-bs-toggle="tab"` + `data-bs-target="#xTab"`, y los `tab-pane` correspondientes.
**No** uses `useState` para controlar el tab activo — es 100% `data-bs-*` de Bootstrap.
El primer tab lleva `active` en el link y `fade show active` en el pane.

**Regla dura — el `data-bs-target` y el `id` del pane deben ser el mismo string
literal.** Un typo aquí rompe la navegación sin error de build. Verificar siempre a mano.

**Un archivo por tab:** `Tab{Nombre}Content.jsx` (o `Tab{Nombre}.jsx` — la plantilla no es
uniforme en el sufijo, elegí `Tab{Nombre}Content.jsx` siempre para este proyecto).
El avatar/nombre del sujeto de la vista vive **dentro** del contenido (en un componente
tipo `Profile`), nunca en el `PageHeader`.

**Mini-headers de sección dentro de un tab:** la plantilla los escribe a mano, repetidos:

```jsx
<div className="mb-4 d-flex align-items-center justify-content-between">
  <h5 className="fw-bold mb-0">Título sección</h5>
  <a className="btn btn-sm btn-light-brand">Acción</a>
</div>
```

Es un mini-`CardHeader` casero repetido en cada tab. **Recomendación para este proyecto:**
extraerlo como un componente compartido (`TabSectionHeader`) en vez de copiar el JSX cada
vez — la plantilla no lo hace, pero no hay razón para no mejorarlo, ya que no cambia el
resultado visual.

**No es regla:** en v2, unos tabs traen su propio wrapper `tab-pane` interno y otros lo
reciben del padre — es inconsistente en la propia plantilla. Para páginas nuevas: el
wrapper `tab-pane` siempre lo pone el componente padre (`XContent.jsx`), nunca el tab
individual, para que un tab se pueda reordenar sin tocar su interior.

---

## 3. Formularios crear/editar (`{recurso}-create` / `{recurso}-edit`)

Dos patrones válidos según complejidad — elegir uno, no mezclar:

**A) Formulario plano en cards** (para formularios de una sola pantalla): `PageHeader`
con acciones (`Save`, `Save & Send`) + `XContent.jsx` con secciones en
`col-xl-6 > div.card.stretch.stretch-full > div.card-body`, cada campo en
`div.mb-4` (último campo del card en `mb-0`), sub-secciones separadas con `<hr
className="my-5" />`. **Sin `Footer`** en este tipo de página.

**B) Wizard multi-step** (para formularios largos/multi-sección): array de configuración
`steps = [{ name, required }, ...]` en el componente padre, estado `currentStep` +
`formData` + `error`, un archivo `Tab{NombrePaso}.jsx` por paso, `validateFields()` manual
que chequea los campos marcados `required` del step actual antes de avanzar.

**Regla dura — botones de acción viven en el header de la página, no al final del
formulario ni en un footer fijo.** `btn btn-light-brand` (acción secundaria) + `btn
btn-primary` (acción principal), con íconos `react-icons/fi` (`FiSave`, tamaño 16,
`className="me-2"`).

**Componentes de input — no reinventar, usar los del paquete/equivalentes:**
- Select: componente propio tipo `SelectDropdown` (props `options`, `selectedOption`,
  `onSelectOption`) — no `react-select` crudo en el JSX de la página.
- Fecha: `react-datepicker` envuelto en `div.input-group.date`, vía un hook que expone
  `startDate/endDate`.
- Ubicaciones en cascada (país→estado→ciudad): un hook (`useLocationData`) que encadena
  `fetchStates`/`fetchCities` en el `onSelectOption` del nivel anterior.
- Loading de página: componente `<Loading/>` condicional al principio del contenido, no
  un spinner inline disperso.

**Validación:** sin Formik/RHF/Yup/Zod en la plantilla base — `useState` + validación
manual. Si el formulario de tu proyecto ya usa una librería de forms, mantenla — no la
quites para "ser fiel a v2"; v2 simplemente no tenía esa necesidad resuelta, no es una
regla de diseño a imponer.

**No es regla:** que el formulario no valide nada en JS (solo asteriscos visuales) es una
carencia de la plantilla demo, no una regla a preservar — un formulario de producción
debe validar.

---

## 4. Páginas de autenticación (`{flujo}-{variante}`)

**Regla dura — la página nunca contiene el `<form>`.** Se delega 100% a un componente en
`components/authentication/{Flujo}Form.jsx` (PascalCase, **sin** sufijo de variante — el
mismo `LoginForm` sirve a `login-cover`, `login-minimal`, `login-creative`). Las rutas de
navegación (`registerPath`, `resetPath`) se pasan como **props desde la página**, nunca
hardcodeadas dentro del form component.

**Estructura fija de la página:**
```jsx
<main className="auth-{variante}-wrapper">
  <div className="auth-cover-content-inner">{/* ilustración SVG */}</div>
  <div className="auth-cover-sidebar-inner">
    <div className="auth-cover-card-wrapper">
      <div className="auth-cover-card p-sm-5">
        <img className="wd-50 mb-5" src="logo" />
        <LoginForm registerPath="/..." resetPath="/..." />
      </div>
    </div>
  </div>
</main>
```

**Patrón interno del form:** título (`h2.fs-20.fw-bolder.mb-4`) + subtítulo
(`h4.fs-13.fw-bold.mb-2`) + copy (`p.fs-12.fw-medium.text-muted`) → inputs planos
(`input.form-control`, sin `<label>`, solo `placeholder`) → fila
`d-flex.justify-content-between` con checkbox "remember me" + link "Forgot password?" →
botón submit `btn.btn-lg.btn-primary.w-100` → separador social → footer con link a la
variante hermana (login↔register).

**Nombres:** imágenes de fondo en `/images/auth/auth-{variante}-{flujo}-bg.svg`.

---

## 5. Dashboard / página de inicio

**Layout:** vive dentro de `root.jsx` (chrome completo: `Header` + `NavigationMenu` +
`<main className="nxl-container"><div className="nxl-content"><Outlet/></div></main>` +
`SupportDetails` fijo).

**Regla dura — la página es puro orquestador de imports, sin JSX de grid propio.** Cada
widget decide su propio ancho de columna (`col-xxl-2 col-lg-4 col-md-6`, etc.) — el
`home.jsx` nunca envuelve un widget en un `<div className="col-*">` manual.

**Orden fijo:** `PageHeader` (primer elemento siempre) → `main-content` con fila de
stat-cards → gráficos → widgets misceláneos → tablas/listas → `Footer` (**fuera** de
`main-content`, último elemento siempre).

**Patrón de stat-card:**
```jsx
<div className="col-xxl-2 col-lg-4 col-md-6">
  <div className="card stretch stretch-full">
    <div className="card-body">
      <p className="fs-12 fw-medium text-muted">{label}</p>
      <h3><span className="counter">{valor}</span>{unidad}</h3>
      {/* variación: ícono + texto, text-success si trend==="up", si no text-danger */}
    </div>
  </div>
</div>
```

**Nombres:** carpeta `components/widgets{Categoria}/` (Statistics/Charts/Tables/List/
Miscellaneous, PascalCase) + archivo `{Dominio}{Categoria}.jsx`. Cada variante de stat
(Leads/Payment/Orders/...) es un archivo separado con su propio dataset — no un
componente genérico parametrizado por prop de "tipo".

---

## Checklist rápido para revisar una página existente

1. ¿El archivo de `pages/` tiene `useState`/`fetch`/lógica? → mover a `components/<feature>/`.
2. ¿Es un listado y reimplementa `<table>` a mano en vez de usar `Table.jsx` compartido? → refactor.
3. ¿Es una vista de detalle y controla el tab activo con `useState` en vez de `data-bs-toggle`? → refactor a Bootstrap nativo, o si ya usa React Router anidado por tab, documentarlo como decisión consciente (no un "olvido").
4. ¿Los botones de acción del form están al final en vez de en el header? → mover al header.
5. ¿La página de auth contiene el `<form>` inline en vez de delegarlo a un componente? → extraer.
6. ¿El dashboard tiene `<div className="col-*">` en el archivo de página en vez de que cada widget se autocontenga? → mover el ancho de columna adentro del widget.
7. ¿`data-bs-target` e `id` de un tab-pane no calzan exactamente? → bug silencioso, corregir.
8. ¿`PageHeader` y el contenido comparten un wrapper con padding (`container-fluid py-3`) en vez de ser hermanos? → separar, `PageHeader` pegado al navbar.
9. ¿La página no pasa `breadcrumbs` y el título queda con un borde colgando a la derecha? → suprimirlo con clase scoped en esa página.

## Qué NO copiar de v2 (inconsistencias de la propia plantilla)

- Mezcla de kebab-case/camelCase en nombres de archivo de página.
- `Footer` presente en unos listados y ausente en otros sin razón aparente.
- Sufijo `Content` a veces sí, a veces no, en archivos de tab (`TabBillingContent.jsx` vs `TabSecurity.jsx`).
- Wrapper `tab-pane` puesto a veces por el padre, a veces por el hijo.
- Formularios sin validación real (aceptable en una plantilla demo, no en producción).

Fuentes: lectura directa de `duralux-v2/Duralux/src/pages/*`, `components/{customersView,proposalEditCreate,projectsCreate,authentication,widgets*}/*` y `route/router.jsx`. No cubre `apps-*` (chat/email/calendario/kanban) — si se necesita esa regla, analizar por separado.
