import { useState } from 'react'
import {
  ChatBubble,
  ChatDaySeparator,
  ChatInputBar,
  ChatSidebar,
  ChatTypingIndicator,
  ChatWindow,
  groupChatMessages,
} from '../../../src'
import type { ChatMessage } from '../../../src'
import { CONTACTOS, CONVERSACION, NOW, YO, message } from './chatData'

/** Pinta una conversación con separadores de día y agrupación por autor. */
export function Mensajes({
  messages = CONVERSACION,
  typing,
  onRetry,
}: {
  messages?: ChatMessage[]
  typing?: string
  onRetry?: (message: ChatMessage) => void
}) {
  return (
    <>
      {groupChatMessages(messages, { now: NOW }).map((entry) => (
        entry.type === 'day'
          ? <ChatDaySeparator key={entry.key} date={entry.date} now={NOW} />
          : <ChatBubble key={entry.key} message={entry.message} grouped={entry.grouped} onRetry={onRetry} />
      ))}
      {typing ? <ChatTypingIndicator name={typing} /> : null}
    </>
  )
}

/** Chat completo en `.gcu-chat`: dos columnas, una sola bajo 42rem (container query). */
export function ChatCompleto({ height = 560, initialId = 'valentina' }: { height?: number; initialId?: string | null }) {
  const [activeId, setActiveId] = useState<string | number | null>(initialId)
  const [messages, setMessages] = useState(CONVERSACION)
  const active = CONTACTOS.find((contact) => contact.id === activeId) ?? null

  return (
    <div className={`gcu-chat card mb-0${active ? ' gcu-chat--thread-open' : ''}`} style={{ height }}>
      <ChatSidebar
        contacts={CONTACTOS}
        selectedId={activeId ?? undefined}
        onSelect={(contact) => setActiveId(contact.id ?? null)}
        onEdit={() => undefined}
        labels={{ sidebar: 'Conversaciones', edit: 'Nueva conversación' }}
      />
      <ChatWindow
        contact={active ? { ...active, role: 'Cliente · Fibra 600' } : null}
        legacyChildren={false}
        onBack={() => setActiveId(null)}
        onPhone={() => undefined}
        onMenu={() => undefined}
        messages={<Mensajes messages={messages} typing="Valentina" />}
        composer={(
          <ChatInputBar
            multiline
            maxLength={500}
            onAttach={() => undefined}
            onSend={(text) => setMessages((previous) => [
              ...previous,
              message(previous.length + 1, NOW, text, { sender: YO, mine: true, status: 'sending' }),
            ])}
          />
        )}
      />
    </div>
  )
}
