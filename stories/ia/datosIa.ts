/** Datos de ejemplo de un asistente de contact center (stories del grupo IA · Conversación). */
import type { AiMemoryItem, AiModelOption, AiSource, AiThread } from '../../src'

export const PREGUNTA = '¿Por qué bajó el nivel de servicio de Cobranza ayer?'

export const FUENTES: AiSource[] = [
  { id: 1, title: 'Informe diario de Cobranza', domain: 'Indicadores · 3 oct', excerpt: 'Nivel de servicio 71 % (meta 80 %), 1.284 llamadas entrantes.' },
  { id: 2, title: 'Dotación por intervalo', domain: 'Planificación · 3 oct', excerpt: '4 ejecutivos con ausencia no programada entre 10:00 y 13:00.' },
  { id: 3, title: 'Campaña Cobranza Norte', domain: 'crm.example.cl', href: 'https://crm.example.cl/campanas/cobranza-norte' },
]

export const RESPUESTA = [
  'El nivel de servicio de Cobranza fue 71 % ayer, 9 puntos bajo la meta de 80 % [1].',
  'La caída se concentra entre 10:00 y 13:00: hubo 4 ejecutivos con ausencia no programada en ese tramo [2], y la campaña Cobranza Norte sumó 312 llamadas sobre lo habitual [3].',
  'Si el patrón se repite hoy, conviene reforzar el tramo de la mañana con ejecutivos de Ventas, que tuvo 2 llamadas en espera en el mismo horario.',
].join('\n\n')

export const SUGERENCIAS = [
  '¿Cuál fue el tiempo medio de espera por campaña esta semana?',
  'Muéstrame los 5 ejecutivos con más llamadas abandonadas',
  'Compara el nivel de servicio de hoy con el de ayer',
]

export const SEGUIMIENTOS = [
  '¿Qué ejecutivos faltaron ayer?',
  '¿Cómo estuvo el nivel de servicio el mismo día la semana pasada?',
]

export const MODELOS: AiModelOption[] = [
  { value: 'rapido', label: 'Rápido', description: 'Respuestas breves en pocos segundos. Ideal para consultas puntuales.' },
  { value: 'equilibrado', label: 'Equilibrado', badge: 'Recomendado', description: 'Analiza indicadores y cruza fuentes con buen tiempo de respuesta.' },
  { value: 'profundo', label: 'Profundo', badge: 'Más lento', description: 'Para análisis de varias campañas o periodos largos.' },
]

export const HILOS: AiThread[] = [
  { id: 't1', title: 'Nivel de servicio de Cobranza', group: 'Hoy', pinned: true },
  { id: 't2', title: 'Abandono por intervalo en Ventas', group: 'Hoy' },
  { id: 't3', title: 'Ejecutivos con más pausas', group: 'Ayer' },
  { id: 't4', title: 'Resumen semanal para supervisión', group: 'Ayer' },
  { id: 't5', title: 'Tipificaciones más frecuentes de septiembre', group: 'Últimos 7 días' },
]

export const RECUERDOS: AiMemoryItem[] = [
  { id: 'm1', text: 'Superviso Cobranza Norte' },
  { id: 'm2', text: 'Prefiero cifras por intervalo de 30 min' },
  { id: 'm3', text: 'Meta de nivel de servicio: 80 %' },
]
