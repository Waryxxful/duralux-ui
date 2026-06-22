import { ChatBubble, ChatTypingIndicator, ChatInputBar, ChatWindow, ChatSidebar } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

const MSG_OTHER = { id: 1, text: 'Hola, ¿cómo va el proyecto? ¿Ya terminaron el módulo de pagos?', time: '10:05 AM', sender: { name: 'Ana M.', avatar: '/assets/images/avatar/2.png' }, mine: false }
const MSG_MINE = { id: 2, text: 'Sí, casi listo. Estamos en QA ahora, debería estar listo mañana.', time: '10:06 AM', sender: { name: 'Yo', avatar: '/assets/images/avatar/1.png' }, mine: true }
const MSG_OTHER_2 = { id: 3, text: 'Perfecto, el cliente está esperando.', time: '10:07 AM', sender: { name: 'Ana M.', avatar: '/assets/images/avatar/2.png' }, mine: false }

const CONTACTS = [
  { id: 1, name: 'Ana Martínez', avatar: '/assets/images/avatar/2.png', preview: 'Hola, ¿cómo va el proyecto?', time: '10:05', online: true, unread: 2 },
  { id: 2, name: 'Carlos Ruiz', avatar: '/assets/images/avatar/3.png', preview: 'Revisa el documento...', time: '09:30', online: false, unread: 0 },
  { id: 3, name: 'María García', avatar: '/assets/images/avatar/4.png', preview: 'Reunión mañana a las 10', time: 'Ayer', online: true, unread: 1 },
]

export function ChatComponentsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Chat Components</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>ChatBubble · ChatTypingIndicator · ChatInputBar · ChatWindow · ChatSidebar</p>

      <ShowcaseSection
        title="ChatBubble + ChatTypingIndicator"
        preview={
          <div style={{ maxWidth: 520, background: '#f8fafc', borderRadius: 12, padding: 16 }}>
            <ChatBubble message={MSG_OTHER} />
            <ChatBubble message={MSG_MINE} />
            <ChatBubble message={MSG_OTHER_2} />
            <ChatTypingIndicator name="Ana M." />
          </div>
        }
        code={`<ChatBubble message={{
  id: 1,
  text: 'Hola, ¿cómo va el proyecto?',
  time: '10:05 AM',
  sender: { name: 'Ana', avatar: '/assets/images/avatar/2.png' },
  mine: false,
}} />

// Propio (alineado a la derecha)
<ChatBubble message={{ ...msg, mine: true }} />

// Indicador de escritura
<ChatTypingIndicator name="Ana M." />`}
      />

      <ShowcaseSection
        title="ChatInputBar"
        preview={<ChatInputBar onSend={(msg) => alert(`Enviado: "${msg}"`)} placeholder="Escribe un mensaje..." />}
        code={`<ChatInputBar
  onSend={(text) => sendMessage(text)}
  placeholder="Escribe un mensaje..."
/>`}
      />

      <ShowcaseSection
        title="ChatSidebar (lista de contactos)"
        preview={
          <div style={{ maxWidth: 280, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <ChatSidebar
              contacts={CONTACTS}
              selectedId={1}
              onSelect={(id) => console.log('Selected:', id)}
              onSearch={(q) => console.log('Search:', q)}
            />
          </div>
        }
        code={`<ChatSidebar
  contacts={[
    { id: 1, name: 'Ana Martínez', avatar: '...', preview: 'Hola!', time: '10:05', online: true, unread: 2 },
    { id: 2, name: 'Carlos Ruiz', avatar: '...', preview: 'Revisa el doc', time: '09:30', online: false, unread: 0 },
  ]}
  selectedId={1}
  onSelect={(id) => setSelected(id)}
  onSearch={(query) => setFilter(query)}
/>`}
      />

      <ShowcaseSection
        title="ChatWindow (ventana completa)"
        description="Wrapper que combina el header del contacto + slot para mensajes."
        preview={
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', maxWidth: 520 }}>
            <ChatWindow contact={{ name: 'Ana Martínez', avatar: '/assets/images/avatar/2.png', online: true, role: 'Diseñadora UI' }}>
              <div style={{ padding: '12px 16px', background: '#f8fafc' }}>
                <ChatBubble message={MSG_OTHER} />
                <ChatBubble message={MSG_MINE} />
              </div>
            </ChatWindow>
          </div>
        }
        code={`<ChatWindow contact={{ name: 'Ana', avatar: '...', online: true, role: 'Diseñadora' }}>
  <ChatBubble message={msg1} />
  <ChatBubble message={msg2} />
  <ChatInputBar onSend={handleSend} />
</ChatWindow>`}
      />
    </div>
  )
}
