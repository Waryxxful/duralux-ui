# Principios de @duralux/ui

`@duralux/ui` es el design system de In-Touch: una sola librería de componentes React, tokens y reglas para todas las apps del ecosistema GranCRM (shell, satélites, operación, CRM, analítica, calidad e IA). Conserva el ADN visual de la plantilla Duralux y lo refina desde tokens.

## Los ocho principios

1. **Tokens como única fuente de verdad.** Color, tipografía, espaciado, radios, elevación, movimiento y capas salen de `tokens/tokens.json`. Ningún componente usa hex, px mágicos ni `!important`. El gate `audit-contract` impide que crezca la deuda (presupuesto por archivo).
2. **Compatibilidad hacia atrás.** Lo que cambia se depreca en 2.x con `deprecate()` (aviso único en consola, solo en desarrollo) y se elimina en 3.0. El contrato shell ↔ satélite (`src/contract.ts`) no cambia en 2.x.
3. **API consistente.** `variant`, `tone` y `size` significan lo mismo en todos los componentes. Todos aceptan `className` y reenvían `ref` cuando hay un elemento nativo.
4. **Accesible por defecto.** WCAG 2.2 AA: contraste verificado en build, `:focus-visible` siempre visible, operación completa con teclado y patrones ARIA APG.
5. **Densidad operativa.** Pensado para pantallas de trabajo con mucha información: controles de 36 px, tablas compactas, números tabulares. No es una librería de landings.
6. **Español internacional.** Todo texto visible usa tuteo neutro («Selecciona», «Puedes»). Nunca voseo («Seleccioná», «Podés»).
7. **Observabilidad.** Los componentes con comportamiento registran errores, fallbacks y deprecaciones con `log` (prefijo `[duralux]`). En producción solo se emiten los errores.
8. **Detalles premium obligatorios.** Feedback de presión, foco nítido, carga con skeleton, entrada y salida animadas con respeto a `prefers-reduced-motion`, estados vacíos útiles y números tabulares. Ver `REGLAS-DE-DISENO.md`.

## Qué es y qué no es

| Es | No es |
|---|---|
| La única capa de UI compartida del ecosistema | Un kit genérico para cualquier producto |
| Componentes con estados completos y documentados en Storybook | Una colección de snippets para copiar |
| Tokens y reglas que también leen los agentes de IA | Una guía opcional |

## Dónde mirar

- `docs/REGLAS-DE-DISENO.md`: cómo se diseña una pantalla con el sistema.
- `docs/TOKENS.md`: niveles de tokens y cómo agregar uno.
- `docs/ICONOGRAFIA.md`: Feather y Tabler.
- `AGENTS.md`: reglas cortas para agentes de IA.
- Storybook (`npm run storybook`): Fundamentos y componentes en los tres temas.
- `docs/auditoria/DEFECTOS.md`: defectos conocidos y su estado.
