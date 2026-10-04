import type { ChatContact, ChatMessage } from '../../../src'

/** Instante fijo: «Hoy» y «Ayer» no cambian entre capturas. */
export const NOW = new Date(2026, 9, 4, 12, 0)

const at = (day: number, hour: number, minute: number) => new Date(2026, 9, day, hour, minute)
const hhmm = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

export function message(id: number, date: Date, text: string, extra: Partial<ChatMessage> = {}): ChatMessage {
  return { id, date, time: hhmm(date), text, ...extra }
}

const VALENTINA = { id: 'valentina', name: 'Valentina Rojas' }
export const YO = { id: 'yo', name: 'Tú' }

/** Conversación real de soporte: tres días, agrupación por autor, sistema y estados de entrega. */
export const CONVERSACION: ChatMessage[] = [
  message(1, new Date(2026, 8, 23, 9, 12), 'Hola, ayer me llegó un cobro duplicado del plan Fibra 600.', { sender: VALENTINA }),
  message(2, new Date(2026, 8, 23, 9, 13), 'Adjunto la boleta #48213 para que la revisen.', { sender: VALENTINA }),
  message(3, new Date(2026, 8, 23, 9, 20), 'Gracias, Valentina. Ya abrí el caso y lo derivé a facturación.', { sender: YO, mine: true, status: 'read' }),
  message(4, at(3, 17, 40), 'Caso #48213 asignado a Facturación', { system: true }),
  message(5, at(3, 17, 42), '¿Hay novedades? Necesito el comprobante para mi empresa.', { sender: VALENTINA }),
  message(6, at(4, 10, 5), 'Sí: el cobro se anuló y la devolución de $24.990 se verá en tu próxima boleta.', { sender: YO, mine: true, status: 'read' }),
  message(7, at(4, 10, 6), 'Te envío el comprobante por correo en unos minutos.', { sender: YO, mine: true, status: 'delivered' }),
  message(8, at(4, 11, 58), 'Perfecto, muchas gracias por la ayuda.', { sender: VALENTINA }),
]

export const CONTACTOS: ChatContact[] = [
  { id: 'valentina', name: 'Valentina Rojas', preview: 'Perfecto, muchas gracias por la ayuda.', time: '11:58', online: true, unread: 2 },
  { id: 'matias', name: 'Matías Fuentes', preview: '¿Puedo cambiar la fecha de instalación?', time: '11:20', online: true, unread: 0 },
  { id: 'camila', name: 'Camila Soto Undurraga de la Fuente', preview: 'Necesito el detalle de las llamadas de septiembre para auditoría interna', time: 'Ayer', unread: 12 },
  { id: 'jorge', name: 'Jorge Muñoz', preview: 'Listo, ya me llegó el técnico.', time: '02-10', unread: 0 },
  { id: 'soporte', name: 'Equipo de soporte', preview: 'Turno de noche: 3 casos pendientes', time: '01-10', unread: 0 },
]
