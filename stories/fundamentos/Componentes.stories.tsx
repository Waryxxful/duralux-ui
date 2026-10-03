import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconSparkles } from '@tabler/icons-react'
import { Alert, Badge, Button, Card, FormField, IconButton, Input, Select } from '../../src'
import { Page, Section } from './parts'

const meta: Meta = { title: 'Fundamentos/Resumen de componentes base' }
export default meta

/** Vista de verificación del refinamiento 2.1 sobre los componentes existentes. */
export const Resumen: StoryObj = {
  render: () => (
    <Page title="Componentes base" lead="Cómo se ve el refinamiento global (tokens, alturas, radios, foco, elevación) sobre los componentes existentes. El refinamiento por componente llega en el subproyecto 2.">
      <Section title="Acciones" description="Una acción primaria por vista. Botones e inputs comparten altura (36 px) y se alinean en la misma fila.">
        <div className="sb-panel sb-row">
          <Button variant="primary" startIcon="plus">Nueva campaña</Button>
          <Button variant="light-brand" startIcon="download">Exportar</Button>
          <Button variant="light-brand" startIcon={<IconSparkles />}>Resumir con IA</Button>
          <IconButton icon="filter" label="Filtrar" />
          <Button variant="danger" startIcon="trash-2">Eliminar</Button>
          <Button variant="primary" loading>Guardando</Button>
          <Button variant="primary" disabled>Deshabilitado</Button>
        </div>
      </Section>
      <Section title="Formulario en fila">
        <div className="sb-panel">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <FormField label="Campaña" htmlFor="sb-campana"><Input id="sb-campana" placeholder="Buscar campaña" icon="feather-search" /></FormField>
            </div>
            <div className="col-md-3">
              <FormField label="Estado" htmlFor="sb-estado"><Select id="sb-estado" options={['Activa', 'Pausada', 'Finalizada']} /></FormField>
            </div>
            <div className="col-md-3">
              <FormField label="Responsable" htmlFor="sb-resp" error="Selecciona un responsable"><Input id="sb-resp" invalid placeholder="Sin asignar" /></FormField>
            </div>
            <div className="col-md-2 d-flex" style={{ paddingBottom: 26 }}>
              <Button variant="primary" className="w-100">Aplicar</Button>
            </div>
          </div>
        </div>
      </Section>
      <Section title="Superficies y estados">
        <div className="row g-3">
          <div className="col-md-6">
            <Card title="Contactabilidad" subtitle="Últimos 7 días">
              <div style={{ fontSize: 30, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>68,4 %</div>
              <div className="sb-row" style={{ marginTop: 8 }}>
                <Badge variant="success" soft>+3,2 pts</Badge>
                <Badge variant="secondary" soft>Meta 70 %</Badge>
              </div>
            </Card>
          </div>
          <div className="col-md-6 d-grid gap-3">
            <Alert variant="info" soft>La sincronización con InTouch termina en 5 minutos.</Alert>
            <Alert variant="danger" soft>No se pudo cargar el reporte. Reintenta o revisa la conexión.</Alert>
          </div>
        </div>
      </Section>
    </Page>
  ),
}
