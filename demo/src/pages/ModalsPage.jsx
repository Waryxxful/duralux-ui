import { useState } from 'react'
import { Modal, Button } from '@duralux/ui'
import { ShowcaseSection } from '../ShowcaseSection'

export function ModalsPage() {
  const [open, setOpen] = useState(false)
  const [openLg, setOpenLg] = useState(false)

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Modal</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Props: <code>open, onClose, title, size (sm|lg|xl), footer, children</code></p>

      <ShowcaseSection
        title="Modal básico"
        preview={
          <>
            <Button variant="primary" onClick={() => setOpen(true)}>Abrir Modal</Button>
            <Modal open={open} onClose={() => setOpen(false)} title="Modal de Ejemplo"
              footer={
                <div className="d-flex gap-2 justify-content-end">
                  <Button variant="light-brand" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={() => setOpen(false)}>Aceptar</Button>
                </div>
              }>
              <p>Contenido del modal. Puede tener formularios, tablas o cualquier JSX.</p>
            </Modal>
          </>
        }
        code={`const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Abrir</Button>
<Modal open={open} onClose={() => setOpen(false)} title="Título"
  footer={<Button onClick={() => setOpen(false)}>Aceptar</Button>}>
  Contenido del modal
</Modal>`}
      />

      <ShowcaseSection
        title="Modal grande (size lg)"
        preview={
          <>
            <Button variant="light-brand" onClick={() => setOpenLg(true)}>Abrir Modal Grande</Button>
            <Modal open={openLg} onClose={() => setOpenLg(false)} title="Modal Grande" size="lg"
              footer={<Button variant="primary" onClick={() => setOpenLg(false)}>Cerrar</Button>}>
              <p>Modal con size="lg". Ideal para formularios complejos o vistas de detalle.</p>
            </Modal>
          </>
        }
        code={`<Modal open={open} onClose={() => setOpen(false)} title="Modal" size="lg">
  Contenido
</Modal>`}
      />
    </div>
  )
}
