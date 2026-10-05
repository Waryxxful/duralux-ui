import type { AgentPlanStep, AgentStep, AgentTask, DiffFile, StatusTrackerStage, WebResult } from '../../src'

/** Datos de ejemplo de un asistente de contact center (agente y contenido 2.8). Sin datos personales reales. */

export const RAZONAMIENTO = [
  'Busco las colas con nivel de servicio bajo la meta de 80 % en la última hora.',
  'Cobranza está en 71 % con 18 llamadas en espera y 2 agentes disponibles.',
  'Comparo con el mismo día de la semana pasada: el volumen subió 24 %.',
  'Hay 4 agentes de Retención con baja ocupación que pueden apoyar.',
]

export const PASOS: AgentStep[] = [
  { id: 'p1', tool: 'read_queue_metrics', title: 'Leer métricas de colas de la última hora', status: 'done', seconds: 1.2, args: { periodo: 'ultima_hora', colas: ['cobranza', 'retencion', 'ventas'] }, result: '3 colas · Cobranza bajo la meta (71 %)' },
  {
    id: 'p2', tool: 'read_agent_presence', title: 'Revisar presencia y ocupación de agentes', status: 'done', seconds: 0.8,
    parallel: [
      { id: 'p2a', tool: 'read_agent_presence', title: 'Cobranza', status: 'done', seconds: 0.4 },
      { id: 'p2b', tool: 'read_agent_presence', title: 'Retención', status: 'done', seconds: 0.5 },
    ],
  },
  { id: 'p3', tool: 'preview_queue_reassignment', title: 'Simular reasignación de 4 agentes a Cobranza', status: 'running', args: { origen: 'retencion', destino: 'cobranza', agentes: 4 } },
  { id: 'p4', tool: 'read_campaign_performance', title: 'Estimar efecto en la campaña de octubre', status: 'queued' },
]

export const TAREAS: AgentTask[] = [
  { id: 't1', title: 'Clasificar llamadas de la mañana por motivo', metric: '480/480', status: 'done', notes: 'El motivo más frecuente fue «consulta de saldo» (32 %).' },
  { id: 't2', title: 'Detectar llamadas con riesgo de fuga', metric: '212/480', status: 'running', notes: 'Se marcan las que mencionan portabilidad o baja del servicio.' },
  { id: 't3', title: 'Preparar resumen para el supervisor', status: 'queued' },
  { id: 't4', title: 'Cruzar con encuestas de satisfacción', status: 'failed', notes: 'La fuente de encuestas no respondió. Reintenta en unos minutos.' },
]

export const PLAN: AgentPlanStep[] = [
  { id: 'a', text: 'Mover 4 agentes de Retención a Cobranza durante 2 horas', tool: 'preview_queue_reassignment' },
  { id: 'b', text: 'Activar el mensaje de espera con tiempo estimado en Cobranza', tool: 'preview_ivr_message' },
  { id: 'c', text: 'Avisar al supervisor de turno con el resumen del cambio', tool: 'preview_notification' },
]

export const ETAPAS: StatusTrackerStage[] = [
  { key: 'cola', label: 'En cola' },
  { key: 'transcribir', label: 'Transcribiendo' },
  { key: 'indexar', label: 'Indexando' },
  { key: 'listo', label: 'Listo' },
]

export const RESULTADOS: WebResult[] = [
  { title: 'Protocolo de atención de reclamos 2026', domain: 'kb.interna', snippet: 'Plazos de respuesta por tipo de reclamo y escalamiento al área legal.', reading: true },
  { title: 'Guía de portabilidad numérica', domain: 'subtel.gob.cl', href: 'https://www.subtel.gob.cl', snippet: 'Requisitos y plazos para cambiar de compañía conservando el número.' },
  { title: 'Script de retención: oferta de permanencia', domain: 'kb.interna', snippet: 'Argumentos aprobados y beneficios disponibles por segmento.' },
  { title: 'Preguntas frecuentes de facturación', domain: 'kb.interna', snippet: 'Cobros duplicados, notas de crédito y fechas de corte.' },
  { title: 'Ley del consumidor: derechos en servicios', domain: 'sernac.cl', href: 'https://www.sernac.cl', snippet: 'Derechos del cliente ante cobros no reconocidos.' },
]

export const ARCHIVOS: DiffFile[] = [
  {
    name: 'pauta-calidad/saludo.md',
    before: 'Saluda con nombre y empresa.\nPregunta el motivo del llamado.\nConfirma el RUT del cliente.',
    after: 'Saluda con nombre y empresa.\nConfirma la identidad del cliente antes de dar información.\nPregunta el motivo del llamado.',
  },
  {
    name: 'plantillas/cierre-reclamo.txt',
    before: 'Su reclamo fue ingresado.\nLe responderemos en 10 días hábiles.',
    after: 'Tu reclamo quedó ingresado con el número #48213.\nTe responderemos en un máximo de 5 días hábiles.',
  },
]

export const CODIGO = `{
  "regla": "escalar_reclamo",
  "condicion": {
    "tipo": "cobro_no_reconocido",
    "monto_minimo": 50000,
    "dias_sin_respuesta": 3
  },
  "accion": "asignar_a_supervisor",
  "notificar": ["supervisor_turno"],
  "prioridad": "alta",
  "vigencia": "2026-10-01/2026-12-31",
  "canal": ["voz", "whatsapp", "correo"],
  "requiere_aprobacion": true,
  "registro": "auditoria"
}`

export const SERIE_NS = [78, 81, 79, 84, 82, 85, 83, 86]
