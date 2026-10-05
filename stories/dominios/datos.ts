import type {
  AgentPresenceState,
  AudioMark,
  CallSummary,
  FunnelStep,
  PipelineDeal,
  PipelineStage,
  QualityCriterion,
  TranscriptTurn,
} from '../../src'

/** Datos realistas de contact center para las stories de dominios (sin datos personales reales). */

export const CRITERIOS: QualityCriterion[] = [
  { id: 'saludo', name: 'Saludo y presentación', result: 'cumple', justification: 'Se presenta con nombre y empresa en los primeros 10 segundos.', quote: 'Buenos días, le habla Camila de Atención Clientes.', turn: 0, points: 10, maxPoints: 10, evidence: 92 },
  { id: 'validacion', name: 'Validación de identidad', result: 'no_cumple', justification: 'Pide el RUT pero no confirma la dirección registrada.', quote: '¿Me confirma su RUT, por favor?', turn: 2, points: 4, maxPoints: 15, evidence: 78 },
  { id: 'oferta', name: 'Ofrece alternativa de retención', result: 'no_aplica', justification: 'El cliente no solicita la baja del servicio.', evidence: 64 },
  { id: 'cierre', name: 'Resume acuerdos al cierre', result: 'cumple', justification: 'Repite la fecha de la visita técnica.', quote: 'Entonces el técnico lo visita el jueves entre 9 y 13 horas.', turn: 7, points: 8, maxPoints: 10, evidence: 35 },
  { id: 'promesa', name: 'No promete lo que no puede cumplir', result: 'no_cumple', grave: true, justification: 'Asegura un descuento que la campaña no contempla.', quote: 'No se preocupe, le dejo el 50 % de descuento por seis meses.', turn: 5, evidence: 88 },
]

export const TURNOS: TranscriptTurn[] = [
  { speaker: 'agent', at: 0, text: 'Buenos días, le habla Camila de Atención Clientes. ¿En qué le puedo ayudar?' },
  { speaker: 'client', at: 6, text: 'Hola, llevo tres días sin internet y nadie me da una solución.' },
  { speaker: 'agent', at: 14, text: 'Lamento la situación. ¿Me confirma su RUT, por favor?' },
  { speaker: 'client', at: 21, text: 'Es el 12.345.678-5.' },
  { speaker: 'agent', at: 35, text: 'Gracias. Veo una falla masiva en su sector que ya está en reparación.' },
  { speaker: 'agent', at: 52, text: 'No se preocupe, le dejo el 50 % de descuento por seis meses.' },
  { speaker: 'client', at: 61, text: 'Bueno, pero necesito que alguien venga a revisar el módem.' },
  { speaker: 'agent', at: 74, text: 'Entonces el técnico lo visita el jueves entre 9 y 13 horas.' },
]

export const MARCAS: AudioMark[] = [
  { at: 52, label: 'Promesa sin respaldo' },
  { at: 14, label: 'Validación incompleta' },
]

export const LLAMADAS: CallSummary[] = [
  { id: 48213, agent: 'Camila Rojas', source: 'Soporte hogar', focus: 'Reclamo', date: '04-10-2026 10:42', score: null, critical: true, waitDays: 2, summary: 'Promete un descuento no autorizado para cerrar el reclamo por falla masiva.' },
  { id: 48207, agent: 'Matías González', source: 'Ventas móvil', focus: 'Venta', date: '04-10-2026 10:15', score: 46, summary: 'No valida identidad antes de ofrecer el cambio de plan.' },
  { id: 48199, agent: 'Valentina Muñoz', source: 'Retención', focus: 'Retención', date: '04-10-2026 09:58', score: 88, summary: 'Retiene al cliente con la oferta vigente y resume acuerdos.' },
  { id: 48190, agent: 'Diego Fuentes', source: 'Soporte hogar', focus: 'Técnico', date: '04-10-2026 09:31', score: 71, waitDays: 1, summary: 'Agenda visita técnica; el cierre es correcto pero extenso.' },
]

export const AGENTES: AgentPresenceState[] = [
  { id: 'a1', name: 'Camila Rojas', presence: 'en_llamada', since: 742, queue: 'Soporte hogar' },
  { id: 'a2', name: 'Matías González', presence: 'disponible', since: 35, queue: 'Ventas móvil' },
  { id: 'a3', name: 'Valentina Muñoz', presence: 'en_pausa', since: 1020, detail: 'Pausa: capacitación' },
  { id: 'a4', name: 'Diego Fuentes', presence: 'post_llamada', since: 48, queue: 'Soporte hogar' },
  { id: 'a5', name: 'Fernanda Soto', presence: 'en_llamada', since: 212, queue: 'Retención' },
  { id: 'a6', name: 'Joaquín Pérez', presence: 'desconectado', since: 3600, detail: 'Turno de tarde' },
  { id: 'a7', name: 'Antonia Díaz', presence: 'disponible', since: 8, queue: 'Retención' },
]

export const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const FRANJAS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
export const VOLUMEN: number[][] = [
  [120, 184, 236, 210, 162, 198, 245, 228, 140],
  [112, 176, 228, 205, 150, 190, 238, 216, 133],
  [108, 170, 219, 199, 148, 185, 231, 210, 129],
  [126, 190, 252, 224, 171, 207, 262, 240, 151],
  [131, 198, 268, 236, 180, 214, 274, 251, 166],
  [64, 98, 121, 110, 86, 0, 0, 0, 0],
]

export const ETAPAS: PipelineStage[] = [
  { key: 'prospecto', label: 'Prospecto' },
  { key: 'calificado', label: 'Calificado' },
  { key: 'propuesta', label: 'Propuesta' },
  { key: 'negociacion', label: 'Negociación' },
  { key: 'ganado', label: 'Ganado' },
]

export const OPORTUNIDADES: PipelineDeal[] = [
  { id: 'd1', title: 'Renovación 120 licencias', account: 'Retail Andino', value: 18400000, owner: 'Valentina Muñoz', stage: 'negociacion', idleDays: 2 },
  { id: 'd2', title: 'Mesa de ayuda 24/7', account: 'Clínica Los Robles', value: 32500000, owner: 'Diego Fuentes', stage: 'propuesta', idleDays: 9 },
  { id: 'd3', title: 'Campaña de cobranza', account: 'Financiera Austral', value: 9600000, owner: 'Camila Rojas', stage: 'calificado' },
  { id: 'd4', title: 'Piloto WhatsApp', account: 'Seguros del Pacífico', value: 4200000, owner: 'Matías González', stage: 'prospecto', idleDays: 12 },
  { id: 'd5', title: 'Encuestas post venta', account: 'Automotora Central', value: 6800000, owner: 'Fernanda Soto', stage: 'prospecto' },
  { id: 'd6', title: 'Outsourcing retención', account: 'Telco Norte', value: 54000000, owner: 'Valentina Muñoz', stage: 'ganado' },
]

export const EMBUDO: FunnelStep[] = [
  { label: 'Leads', value: 4820 },
  { label: 'Contactados', value: 2990 },
  { label: 'Calificados', value: 1240 },
  { label: 'Propuesta', value: 486 },
  { label: 'Ganados', value: 172 },
]
