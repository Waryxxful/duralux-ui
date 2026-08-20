# Alinear @duralux/ui a duralux-v2 (fidelidad + sistema de diseño reutilizable) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir las desviaciones de `@duralux/ui` respecto a la plantilla `duralux-v2` (react-vite) que se introdujeron antes de que v2 existiera, y convertir el paquete en un sistema de diseño real: tokens completos y sincronizados con el SCSS, un helper de composición de clases compartido por los componentes, y componentes que exponen todo lo que el CSS ya ofrece (no menos).

**Architecture:** El SCSS de `@duralux/ui` (`scss/themes/`) ya es, en su mayoría, un fork directo del SCSS de v2 — la investigación confirmó que las escalas de shadow/border/radius y las clases `alert-soft-*` ya están en el CSS compilado. Las desviaciones reales están en: (1) unos pocos valores de color hardcodeados distintos a v2, (2) `src/tokens.ts`, que expone solo una fracción de lo que el SCSS ya define, y (3) componentes React (`Alert`) que no exponen clases que el CSS ya soporta. No se toca el sistema de motion (`_motion.scss`) — no es una desviación de v2, es una capa de accesibilidad (`prefers-reduced-motion`) que v2 no tiene y que no contradice el "house signature" `all 0.3s ease` que ambos comparten.

**Tech Stack:** React 18, Vite 6, SCSS (Bootstrap 5 fork), Vitest + Testing Library, TypeScript (tipos públicos vía `vite-plugin-dts`).

## Global Constraints

- Usar **npm**, no pnpm, dentro de este repo (`/home/admincrm/duralux-ui`) — bug de sandbox conocido con pnpm.
- Todo cambio de color/token debe reflejarse a la vez en SCSS (`scss/themes/*.scss`) y en `src/tokens.ts` — son la misma fuente de verdad expresada en dos lenguajes; no deben divergir.
- No agregar dependencias nuevas (sin CVA, sin class-variance-authority) — un helper de \~15 líneas cubre el caso.
- No inventar utility classes que v2 no tiene (confirmado: v2 no genera `.radius-*` ni un sistema de motion tokens — no se agregan por asociación).
- Cada componente tocado mantiene sus tests existentes en verde (`npm test`) y agrega un test nuevo si se le agrega una prop.
- Commits pequeños, uno por tarea.

---

### Task 1: Sincronizar colores semánticos del SCSS con duralux-v2

Corrige los 10 valores de color que hoy difieren de la plantilla v2 real (confirmado por diff exhaustivo entre `_bs-custom-variables.scss` y `_variables.scss` de ambos repos).

**Files:**
- Modify: `/home/admincrm/duralux-ui/scss/themes/_bs-custom-variables.scss`
- Modify: `/home/admincrm/duralux-ui/scss/themes/_variables.scss`
- Test: `/home/admincrm/duralux-ui/test/tokens-colors.test.ts` (nuevo)

**Interfaces:**
- Produces: valores hex de `$secondary`, `$success`, `$warning`, `$info`, `$danger`, `$gray-600`, `$orange`, `$teal`, `$text-muted`, `$brand-body`, `$brand-muted` — consumidos por Task 2 (deben copiarse literalmente a `tokens.ts`).

- [ ] **Step 1: Editar `_bs-custom-variables.scss`**

Reemplazar las líneas exactas (valores actuales → valores de v2):

```scss
// antes                          // después (duralux-v2)
$gray-600: #4b5563;      →  $gray-600: #64748b;
$orange: #c2410c;        →  $orange: #fd7e14;
$teal: #0f766e;          →  $teal: #41b2c4;
$secondary: #4b5563;     →  $secondary: #727981;
$success: #17c666;       →  $success: #25b865;
$warning: #ffa21d;       →  $warning: #e49e3d;
$info: #3dc7be;          →  $info: #02a0e4;
$danger: #ea4d4d;        →  $danger: #d13b4c;
$text-muted: #4b5563;    →  $text-muted: #64748b;
```

Dejar `$form-text-color: $text-muted;` tal cual (es un alias propio, no una desviación de color).

- [ ] **Step 2: Editar `_variables.scss`**

```scss
$brand-body: #4b5563;    →  $brand-body: #6b7885;
$brand-muted: #4a5d7a;   →  $brand-muted: #7587a7;
```

- [ ] **Step 3: Verificar que no queda ninguna otra desviación**

Run:
```bash
diff <(grep -E '^\$' /home/pancho/duralux-v2/Duralux/public/assets/scss/themes/_bs-custom-variables.scss) <(grep -E '^\$' /home/admincrm/duralux-ui/scss/themes/_bs-custom-variables.scss)
diff <(grep -E '^\$' /home/pancho/duralux-v2/Duralux/public/assets/scss/themes/_variables.scss) <(grep -E '^\$' /home/admincrm/duralux-ui/scss/themes/_variables.scss)
```
Expected: sin diferencias de valores (solo puede quedar la línea extra `$form-text-color`, que no existe en v2 y se mantiene).

- [ ] **Step 4: Rebuildear el SCSS y correr los tests**

```bash
cd /home/admincrm/duralux-ui
npm run build:scss
npm test
```
Expected: build sin errores, tests en verde (ningún test depende hoy de valores hex exactos).

- [ ] **Step 5: Commit**

```bash
git add scss/themes/_bs-custom-variables.scss scss/themes/_variables.scss
git commit -m "fix(theme): alinear paleta semantica con duralux-v2"
```

---

### Task 2: Sincronizar `tokens.ts` 1:1 con el SCSS (ya fiel a v2)

`tokens.ts` hoy expone solo 3 niveles de `shadow` y 1 solo `border`, mientras el SCSS real ya tiene las 6 escalas completas de v2 (`$shadow-none/sm/md/lg/xl/xxl`, `$border-none/soft/normal/medium/hard/contrast`, `$radius-none/xs/sm/md/lg/xl/xxl/pill/circle`). Este task cierra esa brecha y aplica los colores del Task 1.

**Files:**
- Modify: `/home/admincrm/duralux-ui/src/tokens.ts`
- Test: `/home/admincrm/duralux-ui/test/tokens-colors.test.ts` (completar, creado en Task 1)

**Interfaces:**
- Consumes: valores SCSS confirmados en Task 1.
- Produces: `tokens.colors.{primary,success,danger,warning,info,secondary,dark,darken,light,brand,brandBody,brandMuted,brandLight,bg,border}` (mismas keys que hoy, valores corregidos), `tokens.shadow.{none,sm,md,lg,xl,xxl}` (antes solo sm/md/lg), `tokens.border.{none,soft,normal,medium,hard,contrast}` (antes un solo string), `tokens.radius.{none,xs,sm,md,lg,xl,xxl,pill,circle}` (agrega `none` y `circle`, que faltaban).

- [ ] **Step 1: Escribir el test primero**

```ts
// test/tokens-colors.test.ts
import { describe, expect, test } from 'vitest'
import { tokens } from '../src/tokens'

describe('tokens sincronizados con duralux-v2', () => {
  test('colores semanticos coinciden con la paleta v2', () => {
    expect(tokens.colors.success).toBe('#25b865')
    expect(tokens.colors.warning).toBe('#e49e3d')
    expect(tokens.colors.info).toBe('#02a0e4')
    expect(tokens.colors.danger).toBe('#d13b4c')
    expect(tokens.colors.secondary).toBe('#727981')
    expect(tokens.colors.brandBody).toBe('#6b7885')
    expect(tokens.colors.brandMuted).toBe('#7587a7')
  })

  test('shadow expone las 6 escalas de v2', () => {
    expect(Object.keys(tokens.shadow).sort()).toEqual(
      ['lg', 'md', 'none', 'sm', 'xl', 'xxl'].sort(),
    )
  })

  test('border expone las 6 escalas de contraste de v2', () => {
    expect(Object.keys(tokens.border).sort()).toEqual(
      ['contrast', 'hard', 'medium', 'none', 'normal', 'soft'].sort(),
    )
  })

  test('radius incluye none y circle ademas de la escala existente', () => {
    expect(tokens.radius.none).toBe(0)
    expect(tokens.radius.circle).toBe(50)
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run test/tokens-colors.test.ts`
Expected: FAIL (shapes actuales de `shadow`/`border`/`radius` no coinciden, colores no actualizados).

- [ ] **Step 3: Reescribir `tokens.ts`**

```ts
/**
 * Design tokens — espejo 1:1 de las variables SCSS de la plantilla Duralux v2:
 *   scss/themes/_variables.scss
 *   scss/themes/_bs-custom-variables.scss
 *
 * Fuente de verdad visual = SCSS, que a su vez sigue duralux-v2 (react-vite).
 * Si cambiás un color/escala en SCSS, actualizá acá en el mismo PR.
 */
export const tokens = {
  colors: {
    primary: '#3454d1',
    success: '#25b865',
    danger: '#d13b4c',
    warning: '#e49e3d',
    info: '#02a0e4',
    dark: '#283c50',
    darken: '#001327',
    secondary: '#727981',
    light: '#eff0f6',
    brand: '#283c50',
    brandBody: '#6b7885',
    brandMuted: '#7587a7',
    brandLight: '#eaebef',
    bg: '#f0f2f8',
    border: '#dcdee4',
  },
  font: {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    size: {
      xs: '0.625rem',
      sm: '0.6875rem',
      base: '0.84rem',
      md: '0.8125rem',
      lg: '0.875rem',
      xl: '1rem',
    },
  },
  nav: {
    width: 280,
    collapsedWidth: 100,
    background: '#0f172a',
    headerHeight: 80,
  },
  dark: {
    background: '#0f172a',
    border: '#1b2436',
    hover: '#1c2438',
  },
  // $radius-* — scss/themes/_variables.scss
  radius: { none: 0, xs: 3, sm: 5, md: 10, lg: 15, xl: 20, xxl: 25, pill: 30, circle: 50 },
  // $border-radius* (form controls/buttons) — _bs-custom-variables.scss
  controlRadius: { sm: 2, base: 4, lg: 6 },
  // $shadow-* — scss/themes/_variables.scss
  shadow: {
    none: 'none',
    sm: '0 1px 5px rgba(40,60,80,.15)',
    md: '0 5px 15px rgba(40,60,80,.15)',
    lg: '0 10px 25px rgba(40,60,80,.15)',
    xl: '0 15px 35px rgba(40,60,80,.15)',
    xxl: '0 20px 45px rgba(40,60,80,.15)',
  },
  // $border-soft/normal/medium/hard/contrast — scss/themes/_variables.scss
  border: {
    none: 'transparent',
    soft: '#eceef3',
    normal: '#e5e7ee',
    medium: '#d3d6e0',
    hard: '#c1c5d3',
    contrast: '#adb2c4',
  },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24 },
  layoutGutter: { card: 25, content: 30 },
  /** Motion craft — alineado a scss/themes/components/_motion.scss.
   *  DESIGN.md house signature: `all 0.3s ease` on interactive surfaces
   *  (scoped to paint props here instead of literal `all`). No es parte
   *  de v2 (que no tokeniza motion ni soporta prefers-reduced-motion) —
   *  se mantiene como capa de accesibilidad, no como desviacion a corregir. */
  motion: {
    easeOut: 'ease',
    easeInOut: 'ease',
    durationPress: 300,
    durationFast: 300,
    durationUi: 300,
    durationPanel: 300,
    pressScale: 0.97,
  },
  source: {
    variables: 'scss/themes/_variables.scss',
    bsCustom: 'scss/themes/_bs-custom-variables.scss',
    motion: 'scss/themes/components/_motion.scss',
  },
} as const

export type Tokens = typeof tokens

export type SemanticVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'dark'
  | 'light'
  | 'link'
  | 'light-brand'

export type StatusVariant = 'success' | 'danger' | 'warning' | 'info' | 'secondary'
```

Nota: los valores hex de `border.*` de arriba son un placeholder de `darken($gray-100, N)` — antes de tipearlos, calcular el valor real: correr el Step 3.1 siguiente.

- [ ] **Step 3.1: Calcular los valores reales de `$border-soft/normal/medium/hard/contrast`**

`$gray-100` en Bootstrap/Duralux es `#eff0f6` (confirmar): `grep -n '\$gray-100:' scss/bootstrap/_variables.scss scss/themes/_bs-custom-variables.scss`. Aplicar `darken($gray-100, 1|2|5|8|12)` con una utilidad Sass (o Node `sass` en un one-liner) para obtener los 5 valores hex exactos y pegarlos en `tokens.border` del Step 3. No adivinar a ojo — el token debe pintar exactamente igual que el CSS.

```bash
cd /home/admincrm/duralux-ui
node -e "
const sass = require('sass');
const src = \`@use 'sass:color'; \$c: #eff0f6; .x{a:darken(\$c,1);b:darken(\$c,2);c:darken(\$c,5);d:darken(\$c,8);e:darken(\$c,12);}\`;
console.log(sass.compileString(src).css);
"
```
Copiar los 5 valores resultantes a `tokens.border` reemplazando los placeholders.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run test/tokens-colors.test.ts`
Expected: PASS.

- [ ] **Step 5: Correr toda la suite (nada debe romperse por el reshape de `shadow`/`border`)**

```bash
npm test
```
Expected: PASS. Si algún componente importaba `tokens.shadow.sm` esperando el string viejo, revisar su uso (no debería haber consumidores — `grep -rn "tokens.shadow\|tokens.border" src/`).

- [ ] **Step 6: Commit**

```bash
git add src/tokens.ts test/tokens-colors.test.ts
git commit -m "feat(tokens): sincronizar tokens.ts 1:1 con escalas SCSS de v2"
```

---

### Task 3: Exponer `alert-soft-*` en el componente `Alert` (gap real vs. CSS ya disponible)

El SCSS ya define `.alert.alert-soft-success-message`, `-warning-`, `-danger-`, `-teal-message` (heredado fielmente de v2), pero `Alert.jsx` nunca genera esas clases. `Badge` ya tiene este patrón con su prop `soft`; `Alert` debe seguir el mismo criterio.

**Files:**
- Modify: `/home/admincrm/duralux-ui/src/components/ui/Alert.jsx`
- Test: `/home/admincrm/duralux-ui/test/Alert.test.jsx` (nuevo)

**Interfaces:**
- Produces: prop nueva `soft?: boolean` en `Alert`. Variantes soportadas para `soft`: `'success' | 'warning' | 'danger' | 'teal'` (son las únicas que el SCSS define — confirmado por grep en `_alert.scss`).

- [ ] **Step 1: Escribir el test primero**

```jsx
// test/Alert.test.jsx
import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import { Alert } from '../src/index.js'

test('variante solida por defecto', () => {
  render(<Alert variant="success">Ok</Alert>)
  expect(screen.getByRole('alert')).toHaveClass('alert-success')
})

test('prop soft genera la clase alert-soft-{variant}-message', () => {
  render(<Alert variant="warning" soft>Cuidado</Alert>)
  const el = screen.getByRole('alert')
  expect(el).toHaveClass('alert-soft-warning-message')
  expect(el).not.toHaveClass('alert-warning')
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run test/Alert.test.jsx`
Expected: FAIL (segundo test — `soft` no existe todavía).

- [ ] **Step 3: Implementar `soft` en `Alert.jsx`**

```jsx
import { useState } from 'react'

/**
 * Alert — alerta con variantes de color, modo soft y opcion dismissible.
 *
 * Props:
 *   variant     — "primary" | "success" | "warning" | "danger" | "info"
 *   soft        — usa clase "alert-soft-{variant}-message" en vez de "alert-{variant}"
 *                 (solo "success" | "warning" | "danger" | "teal" tienen estilo definido en el CSS)
 *   icon        — feather class string
 *   dismissible — muestra boton de cierre
 *   onDismiss   — callback al cerrar (tambien muestra el boton de cierre)
 *   title       — bold prefix text
 */
export function Alert({ variant = 'primary', soft = false, icon, dismissible, onDismiss, title, children }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  const closable = dismissible || onDismiss
  const toneClass = soft ? `alert-soft-${variant}-message` : `alert-${variant}`
  return (
    <div className={`alert ${toneClass} d-flex align-items-center gap-3${closable ? ' alert-dismissible' : ''}`} role="alert">
      {icon && (
        <div className={`avatar-text avatar-sm rounded bg-${variant} text-white flex-shrink-0`}>
          <i className={icon}></i>
        </div>
      )}
      <div>
        {title && <strong>{title} </strong>}
        {children}
      </div>
      {closable && (
        <button
          type="button"
          className="btn-close ms-auto"
          onClick={() => { setVisible(false); onDismiss?.() }}
        ></button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run test/Alert.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Alert.jsx test/Alert.test.jsx
git commit -m "feat(alert): exponer variante soft ya definida en el CSS de v2"
```

---

### Task 4: Helper de composición de clases compartido (Button, Badge, Alert)

Button, Badge y Alert repiten el mismo patrón (`['a', cond && 'b', ...].filter(Boolean).join(' ')` o template strings condicionales) con ligeras variaciones. Un helper de una función lo unifica sin traer una librería — esta es la pieza que convierte "tres componentes con su propia lógica" en "un sistema con una convención".

**Files:**
- Create: `/home/admincrm/duralux-ui/src/utils/cx.ts`
- Modify: `/home/admincrm/duralux-ui/src/components/ui/Button.jsx`
- Modify: `/home/admincrm/duralux-ui/src/components/ui/Badge.jsx`
- Modify: `/home/admincrm/duralux-ui/src/components/ui/Alert.jsx`
- Test: `/home/admincrm/duralux-ui/test/cx.test.ts` (nuevo)

**Interfaces:**
- Produces: `cx(...parts: Array<string | false | null | undefined>): string` — concatena con espacio, descarta falsy. Usado por los 3 componentes modificados; cualquier componente nuevo del paquete debe usarlo en vez de reinventar `.filter(Boolean).join(' ')`.

- [ ] **Step 1: Escribir el test primero**

```ts
// test/cx.test.ts
import { describe, expect, test } from 'vitest'
import { cx } from '../src/utils/cx'

describe('cx', () => {
  test('concatena strings con espacio', () => {
    expect(cx('btn', 'btn-primary')).toBe('btn btn-primary')
  })

  test('descarta valores falsy', () => {
    expect(cx('btn', false, null, undefined, '', 'btn-sm')).toBe('btn btn-sm')
  })

  test('devuelve string vacio si todo es falsy', () => {
    expect(cx(false, null, undefined)).toBe('')
  })
})
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run test/cx.test.ts`
Expected: FAIL con "Cannot find module '../src/utils/cx'".

- [ ] **Step 3: Implementar `cx`**

```ts
// src/utils/cx.ts
export type ClassValue = string | false | null | undefined

/** Concatena clases descartando valores falsy. Convencion unica del paquete
 *  para construir className condicional — no usar template strings sueltos
 *  ni .filter(Boolean).join(' ') repetido en cada componente. */
export function cx(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(' ')
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run test/cx.test.ts`
Expected: PASS.

- [ ] **Step 5: Refactorizar `Button.jsx` para usar `cx`**

```jsx
import { cx } from '../../utils/cx'

/**
 * Button — boton con variantes, tamanos y estado de carga.
 * ... (mismo JSDoc que hoy, sin cambios de comportamiento)
 */
export function Button({
  variant = 'primary',
  outline = false,
  size = undefined,
  loading = false,
  icon = null,
  startIcon = null,
  endIcon = null,
  disabled = false,
  onClick = undefined,
  href = undefined,
  as: Tag = href ? 'a' : 'button',
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading
  const isAnchor = Tag === 'a'
  const isDisabledAnchor = isAnchor && isDisabled
  const handleClick = isDisabledAnchor
    ? (event) => { event.preventDefault(); event.stopPropagation() }
    : onClick

  return (
    <Tag
      {...props}
      className={cx('btn', `btn-${variant}`, size && `btn-${size}`, className)}
      onClick={handleClick}
      disabled={isAnchor ? undefined : isDisabled}
      href={isDisabledAnchor ? undefined : href}
      type={Tag === 'button' ? type : undefined}
      aria-disabled={isDisabledAnchor ? true : props['aria-disabled']}
      tabIndex={isDisabledAnchor ? -1 : props.tabIndex}
    >
      {loading
        ? <span className="spinner-border spinner-border-sm me-2" role="status"></span>
        : (startIcon
            ? <i className={`feather-${startIcon} me-2`} aria-hidden />
            : icon && <i className={`${icon} me-2`}></i>
          )
      }
      {children}
      {!loading && endIcon && <i className={`feather-${endIcon} ms-2`} aria-hidden />}
    </Tag>
  )
}

export function LinkButton({ href, ...props }) {
  return <Button as="a" href={href} {...props} />
}

export function IconButton({ icon, label, variant, size, outline, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={cx('btn', 'btn-icon', `btn-${variant || 'light-brand'}`, size && `btn-${size}`, className)}
      aria-label={label}
      title={label}
      {...rest}
    >
      <i className={`feather-${icon}`} aria-hidden />
    </button>
  )
}
```

- [ ] **Step 6: Correr los tests existentes de Button**

Run: `npx vitest run test/Button.test.jsx test/Button.anchor-contract.test.jsx`
Expected: PASS (mismo comportamiento, distinta implementacion interna).

- [ ] **Step 7: Refactorizar `Badge.jsx` para usar `cx`**

```jsx
import { cx } from '../../utils/cx'

/**
 * Badge — badge de estado con variantes de color. (mismo JSDoc que hoy)
 */
export function Badge({
  variant = 'primary',
  soft = false,
  pill = false,
  as: Tag = 'span',
  children,
  className = '',
  ...rest
}) {
  let tone
  if (variant === 'light') {
    tone = 'gcu-badge gcu-badge--light'
  } else if (soft) {
    tone = `bg-soft-${variant} text-${variant}`
  } else {
    tone = `bg-${variant}`
  }

  const classes = cx('badge', tone, pill && 'rounded-pill', Tag !== 'span' && 'border-0', className)

  return (
    <Tag className={classes} style={Tag !== 'span' ? { cursor: 'pointer' } : undefined} {...rest}>
      {children}
    </Tag>
  )
}
```

- [ ] **Step 8: Refactorizar `Alert.jsx` (del Task 3) para usar `cx`**

```jsx
import { useState } from 'react'
import { cx } from '../../utils/cx'

export function Alert({ variant = 'primary', soft = false, icon, dismissible, onDismiss, title, children }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  const closable = dismissible || onDismiss
  const toneClass = soft ? `alert-soft-${variant}-message` : `alert-${variant}`
  return (
    <div className={cx('alert', toneClass, 'd-flex align-items-center gap-3', closable && 'alert-dismissible')} role="alert">
      {icon && (
        <div className={cx('avatar-text avatar-sm rounded', `bg-${variant}`, 'text-white flex-shrink-0')}>
          <i className={icon}></i>
        </div>
      )}
      <div>
        {title && <strong>{title} </strong>}
        {children}
      </div>
      {closable && (
        <button type="button" className="btn-close ms-auto" onClick={() => { setVisible(false); onDismiss?.() }}></button>
      )}
    </div>
  )
}
```

- [ ] **Step 9: Correr toda la suite**

```bash
cd /home/admincrm/duralux-ui
npm test
```
Expected: PASS en todos los archivos, incluidos los nuevos de Task 3 y 4.

- [ ] **Step 10: Commit**

```bash
git add src/utils/cx.ts src/components/ui/Button.jsx src/components/ui/Badge.jsx src/components/ui/Alert.jsx test/cx.test.ts
git commit -m "refactor(ui): extraer helper cx compartido para Button/Badge/Alert"
```

---

### Task 5: Documentación — catálogo de tokens y nota de fidelidad a v2

Actualizar la documentación para que refleje que la paleta y las escalas ahora son 1:1 con `duralux-v2`, y documentar la convención `soft` + el helper `cx`.

**Files:**
- Modify: `/home/admincrm/duralux-ui/README.md`
- Modify: `/home/admincrm/duralux-ui/CLAUDE.snippet.md`

**Interfaces:**
- Ninguna (solo documentación, no afecta el código público).

- [ ] **Step 1: Actualizar `README.md`**

Buscar la frase actual "El theme es una adaptación deliberada de Duralux para GranCRM, no una copia byte a byte de los CSS publicados por la plantilla." y reemplazarla por:

```markdown
El theme sigue fielmente la plantilla `duralux-v2` (React + Vite) en paleta, tokens de
shadow/border/radius y componentes base. Cualquier divergencia de color respecto a
`duralux-v2` es un bug, no una decisión — reportarla y corregirla en `scss/` y `src/tokens.ts`
a la vez.

### Tokens (`src/tokens.ts`)

| Escala | Valores |
|---|---|
| `shadow` | `none · sm · md · lg · xl · xxl` |
| `border` | `none · soft · normal · medium · hard · contrast` |
| `radius` | `none · xs · sm · md · lg · xl · xxl · pill · circle` |

### Convención de clases: `cx()`

Todo componente que compone `className` condicional usa `src/utils/cx.ts` en vez de
reinventar `.filter(Boolean).join(' ')`. Ver `Button`, `Badge`, `Alert`.

### Variante `soft`

`Badge` y `Alert` soportan `soft` para usar el estilo "soft" ya definido en el SCSS
(`bg-soft-*` / `alert-soft-*-message`) en vez del sólido. No inventar una tercera
convención de "suave" en componentes nuevos — seguir este patrón.
```

- [ ] **Step 2: Actualizar `CLAUDE.snippet.md`**

Agregar una línea en la sección de familias de componentes, cerca de `Alert`:

```markdown
- **Base:** `Button` `LinkButton` `IconButton` `Icon` `Card` `Badge` `Alert` (soporta `soft`) `Modal` `Tabs` `Avatar` `Timeline` `ProgressRing` `Progress` `Dropdown` `DropdownMenu`
```//sobrescribe la línea existente reemplazando solo `` `Alert` `` por `` `Alert` (soporta `soft`) ``.

- [ ] **Step 3: Commit**

```bash
git add README.md CLAUDE.snippet.md
git commit -m "docs: documentar tokens sincronizados con v2, cx() y Alert soft"
```

---

## Self-Review (ya aplicado al redactar este plan)

- **Cobertura:** paleta de color (Task 1+2), escalas de tokens (Task 2), gap de componente vs. CSS ya disponible (Task 3), convención compartida (Task 4), documentación (Task 5). El sistema de motion se dejó explícitamente fuera por no ser una desviación de v2 (es una capa de accesibilidad adicional).
- **Placeholders:** el único valor no cerrado es `tokens.border.*` en el Step 3 de Task 2, resuelto en el Step 3.1 inmediatamente siguiente con un comando ejecutable — no es un placeholder de intención, es un cálculo diferido a runtime porque depende de la función `darken()` de Sass.
- **Consistencia de tipos:** `cx()` se define una vez (Task 4) y se usa igual en Button/Badge/Alert; `Alert`'s prop `soft` se define en Task 3 y se mantiene igual en el refactor de Task 4 (Step 8) — no cambia de nombre entre tasks.
