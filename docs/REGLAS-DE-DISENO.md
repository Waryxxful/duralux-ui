# Reglas de diseño

Cómo se diseña una pantalla con `@duralux/ui`. Aplica a todas las apps: shell, administración, operación del contact center, CRM, analítica, calidad, canales e IA.

## 1. Lo que se atiende primero

- Cada pantalla abre diciendo qué atender y ofrece la acción: una cola sin agentes libres, una campaña bajo la meta, un cliente con riesgo de fuga. **Nunca** abre con cuatro tarjetas de KPI iguales.
- **Toda cifra tiene contexto:** meta, variación o tendencia. «84 %» no dice nada; «84 % · meta 80 % · +4 pts» sí.
- **Una acción primaria por vista** (`variant="primary"`). Las demás son `light-brand` o van en un menú.

## 2. Color con significado

- Los componentes usan **roles semánticos** (`--gcu-text`, `--gcu-surface`, `--gcu-{tono}-soft`…), nunca paletas ni hex.
- `primary` es la marca: acción principal, enlace, selección activa, foco. No comunica estado.
- `success` solo para lo cumplido; `warning` para lo que está cerca del umbral; `danger` para error, vencimiento o acción destructiva.
- **El estado nunca va solo en color:** se acompaña de texto, icono o forma. En escala de grises tiene que seguir entendiéndose.
- Texto de estado sobre fondo suave: `--gcu-{tono}-text` sobre `--gcu-{tono}-soft` (AA garantizado por `tokens:check`).

## 3. Superficies y elevación

| Nivel | Uso | Token |
|---|---|---|
| Lienzo | Fondo de la página | `--gcu-surface-subtle` |
| Superficie | Cards, paneles | `--gcu-surface` + `--gcu-shadow-1` + borde `--gcu-border` |
| Hover | Card interactiva al pasar el puntero | `--gcu-shadow-2` |
| Flotante | Dropdowns, popovers | `--gcu-shadow-3` |
| Modal | Modales y drawers | `--gcu-shadow-4`, radio `--gcu-radius-xl` |

En oscuro y navy la elevación se expresa con superficies más claras (`surface-raised`) y bordes, no con sombras más fuertes.

## 4. Tipografía

- Inter Variable. Pesos: 400 lectura, 500 etiquetas y énfasis, 600 títulos. No usar 700 o más en interfaz.
- Un solo título de página por vista. Títulos de card hasta 18 px.
- Cifras en tablas, KPIs y contadores con `tabular-nums`: automático en celdas `.text-end`; en otras usa `.gcu-tabular` o `data-numeric`. No se aplica a toda la tabla porque en Inter también ensancha guiones y puntuación.
- Títulos con `text-wrap: balance`; texto largo con ancho máximo de ~68 caracteres.
- Texto truncado siempre con `…` y el valor completo en `title` o tooltip.

## 5. Espaciado y densidad

- Base de 4 px. Agrupar con 4–12 px, separar bloques con 24 px, separar secciones con 32–48 px.
- Controles e inputs comparten altura: 32 (sm), 36 (md, por defecto), 40 (lg). Una barra de filtros alinea input, select y botón en la misma fila.
- La página nunca se desplaza en horizontal: tablas anchas y tableros se desplazan dentro de su contenedor (`.gcu-scroll`).

## 6. Estados de cada componente interactivo

| Estado | Regla |
|---|---|
| Hover | Cambio de superficie en 150 ms; solo con puntero (`@media (hover: hover)`) |
| Presión | `scale(0.98)` en 100 ms; nunca en texto |
| Foco | Anillo `--gcu-focus-ring` solo con `:focus-visible`; nunca `outline: none` sin reemplazo |
| Deshabilitado | Explica por qué (ayuda o tooltip) cuando la causa no es obvia |
| Cargando | Botón con spinner que conserva el ancho y `aria-busy`; contenido con skeleton (`.gcu-skeleton`) |
| Vacío | Ícono, título, explicación en una línea y la acción siguiente |
| Error | Qué pasó, qué hacer y botón para reintentar; nunca se pierde lo que la persona escribió |

## 7. Movimiento

- El movimiento confirma una acción o explica un cambio; nunca decora.
- Entrada con `--gcu-ease-enter` (150–200 ms, opacidad + 4 px); salida más rápida con `--gcu-ease-exit` (100–150 ms).
- Con `prefers-reduced-motion: reduce` las duraciones pasan a 0 (lo resuelven los tokens).

## 8. Contenido

- Español internacional con tuteo: «Selecciona un cliente», «Puedes ajustarlo». Nunca voseo.
- Los botones empiezan con verbo y dicen qué pasa: «Crear campaña», «Exportar reporte». Nada de «Aceptar» o «Enviar» sueltos.
- Mayúscula inicial solo en la primera palabra: «Tablero del contact center».
- Nunca exponer nombres internos (tablas, SP, «payload», «simulado») a usuarios finales.
- Estados vacíos dicen qué pasó y qué probar: «Nadie coincide con la búsqueda. Prueba con otro rol o cuenta.»

### Formatos

| Dato | Formato | Ejemplo |
|---|---|---|
| Fecha | dd-mm-aaaa | 23-09-2026 |
| Hora | 24 h | 16:42 |
| Duración, TMO | m:ss | 5:12 |
| Porcentaje | número, espacio, % | 84 % |
| Variación | con signo y unidad | +4 pts · −0:24 · +12 % |
| Miles y decimales | punto y coma | 2.840 · 4,3 |
| Moneda | CLP sin decimales | $1.240.000 |
| IDs | mono con # | #48213 |

## 9. Canon de clases Duralux

- Botones: `btn btn-primary` (CTA), `btn btn-light-brand` (secundario), `btn btn-icon btn-light-brand` (solo icono, con `label`), `btn btn-danger` (destructivo). **Nunca** `btn-outline-*` ni `btn-secondary`.
- Tablas: `.table-responsive > table.table.table-hover`. **Nunca** `table-striped`.
- Badges suaves: `badge bg-soft-{tono} text-{tono}`. Las clases `bg-{tono}-100` no existen.
- Avatares: `avatar-image avatar-sm`, `avatar-text avatar-md`. Listas: `list-group list-group-flush`.

El gate `audit-contract` bloquea los patrones prohibidos.

## 10. Accesibilidad

- Contraste AA verificado en build para todos los roles de texto en los tres temas.
- Toda información que va en color también va en texto o forma.
- Botones de solo icono con `label` (se usa como `aria-label` y `title`).
- Modales con foco atrapado y retorno de foco; `Esc` cierra; el fondo no se desplaza.
- Respuestas asíncronas y toasts anunciados con `aria-live`.

## 11. Detalles de oficio (Craft)

Conceptos de [Craft](https://craft.gustavofior.com) incorporados al sistema. Valores exactos del sitio; no inventar otros.

| Concepto | Regla en @duralux/ui | Dónde vive |
|---|---|---|
| [Números tabulares](https://craft.gustavofior.com/tabular-numbers) | Cifras que cambian y columnas numéricas (alineadas a la derecha) con `tabular-nums`; en texto corrido, proporcionales | `td.text-end`, `.gcu-tabular`, `[data-numeric]` |
| [Alineación óptica](https://craft.gustavofior.com/optical-alignment) | El lado del ícono en un botón lleva 2 px menos; íconos sueltos se centran por peso visual (prueba del desenfoque) | `.gcu-button__icon--start/--end` |
| [Grano](https://craft.gustavofior.com/noise) | Superficies de color grandes (Spotlight, bandas, tarjetas de color) con grano en mosaico de 200 px al 8 % en `overlay`, aislado | `.gcu-grain` |
| [Contornos de imagen](https://craft.gustavofior.com/image-outlines) | Imágenes y avatares con borde interior de 1 px: negro 10 % en claro, blanco 10 % en oscuro y navy | `--gcu-image-outline`, `.avatar-image img`, `.gcu-media` |
| [Radios anidados](https://craft.gustavofior.com/nested-border-radius) | Radio interior = radio exterior − separación: `max(0px, calc(<exterior> - <separación>))` | regla de componente |
| [Fondo del documento](https://craft.gustavofior.com/html-background) | `html` pinta `--gcu-surface-subtle`; `color-scheme` por tema; `meta theme-color` sigue al tema resuelto | `base.css`, tokens, `applyThemeToDocument` |
| [Contención del hover](https://craft.gustavofior.com/hover-restraint) | Lo frecuente es instantáneo: hover de botones, navegación, ítems de menú, pestañas y filas sin transición; los tooltips esperan 400–700 ms el primero y los vecinos aparecen al instante; modales (infrecuentes) sí animan | `button.css`, `base.css` |
