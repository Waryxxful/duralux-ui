# 2.7–2.8 — Dominios de negocio e IA (sub-spec + plan)

Deriva del spec maestro §9 (subproyecto 5). Se porta el comportamiento de `intouch-ui` (`src/components/{quality,operations,crm,ai}`), reescrito sobre tokens `--gcu-*` y la receta. Reglas de contenido y de IA: `docs/REGLAS-DE-DISENO.md` y spec de intouch «Inteligencia artificial» (citas, aprobación, esperas, fallas, aviso fijo).

## 2.7.0 — Dominios

| Dominio | Componentes |
|---|---|
| Calidad | `CriterionRow` (criterio con cumple/no cumple/no aplica y evidencia), `Transcript` (turnos agente/cliente con marcas de tiempo y resaltado), `AudioPlayer` (reproducir, saltar, velocidad, teclado; alternativa sin onda), `CallRow`, `CallList` |
| Operación | `TargetBar` (meta con verde/advertencia/peligro y `higherIsWorse`, `role="meter"`), `QueueCard`, `AgentStatusBoard` (presencia con forma + texto), `Heatmap` (tabla accesible con escala y leyenda) |
| CRM | `ContactCard`, `PipelineBoard` (columnas con total; mover con teclado además de arrastrar), `Funnel` |

## 2.8.0 — IA (27 bloques en tres grupos)

| Grupo | Componentes |
|---|---|
| Conversación | `AiMessage`, `MessageActions`, `AiEmptyState`, `PromptComposer`, `ThinkingIndicator`, `AiLoader`, `Citation`, `SourceList`, `StreamingAnswer`, `AiErrorState`, `QuotaBanner`, `ModelSelector`, `UsageMeter`, `VoiceInput`, `AiHistory`, `MemoryChips`, `SuggestionBanner` |
| Agente | `ReasoningTrace`, `AgentSteps`, `ToolChip`, `ApprovalCard`, `TaskRows`, `AgentPlan`, `StatusTracker`, `WebResults` |
| Contenido | `InlineEdit`, `DiffView`, `CodeBlock`, `InsightCard` |

Reglas obligatorias de IA:
- Toda acción con efecto pasa por `ApprovalCard` (o `AgentPlan` si son varios pasos): el componente nunca ejecuta por sí mismo, emite la intención.
- Las respuestas con datos llevan citas `[n]` y `SourceList`; sin fuente, el texto lo dice.
- `ThinkingIndicator` < 3 s, `AiLoader` con tiempo transcurrido para esperas largas; `AiErrorState` conserva la pregunta.
- Aviso fijo bajo el compositor: «El asistente puede equivocarse. Revisa las fuentes antes de tomar decisiones.»
- `StreamingAnswer` anuncia con `aria-live="polite"` por bloques, no por token.
- Nada de datos personales hacia logging.

Cada bloque: TSX, CSS propio, tests de comportamiento, story en tres temas. Página de patrón **Asistente** (historial + hilo + compositor).
