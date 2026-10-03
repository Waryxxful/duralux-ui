# Iconografía

Dos sets con el mismo lenguaje visual: trazo 2, extremos redondeados, `currentColor`.

| Set | Cuándo | Cómo |
|---|---|---|
| **Feather** (fuente `gcu-feather`, incluida) | Acciones genéricas que ya existen en las apps: crear, editar, eliminar, buscar, filtrar, exportar, usuario, configuración | `<Icon name="plus" />` · `<Button startIcon="plus">` |
| **Tabler** (`@tabler/icons-react`) | Lo que Feather no cubre: IA, operación del contact center, canales, dominios | `<Icon icon={<IconRobot />} />` · `<Button startIcon={<IconSparkles />}>` |

## Reglas

- **Un concepto, un icono.** Si «exportar» es `download` en una pantalla, es `download` en todas.
- **Tamaños:** 14 px (sm, en botones pequeños y badges), 16 px (md, por defecto), 20 px (lg, cabeceras y estados vacíos). `renderIconSlot` normaliza los iconos Tabler a esos tamaños y a trazo 2.
- **Decorativo por defecto:** los iconos llevan `aria-hidden`. Si el icono es la única información (botón de solo icono), el `label` del componente da el nombre accesible.
- **Nunca emoji** en la interfaz.
- **Color:** el icono hereda el color del texto. Un icono de estado usa el `--gcu-{tono}-text` de su tono y siempre va con texto.
- Las apps que necesiten Tabler lo instalan como dependencia propia (`@tabler/icons-react`); la librería lo pasará a `dependencies` cuando un componente del núcleo lo use.

## Equivalencias frecuentes

| Concepto | Feather | Tabler |
|---|---|---|
| Asistente de IA | — | `IconSparkles`, `IconRobot` |
| Agente en línea | `headphones` | `IconHeadset` |
| Cola, ruteo | — | `IconRoute` |
| Reporte, KPI | `bar-chart-2` | `IconChartBar` |
| Conversación | `message-square` | `IconMessageChatbot` |
| Alerta | `alert-triangle` | `IconAlertTriangle` |
