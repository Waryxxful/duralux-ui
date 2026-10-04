import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfigProvider, DatePicker as AntdDatePicker, Select as AntdSelect } from 'antd'
import dayjs from 'dayjs'
import { Cascader, DateRangeFilter, DatePicker, DuraluxAntdProvider, FileDrop, TreeSelect } from '../../src/antd'
import { Button, Card, FormField, Input } from '../../src'
import { Modal } from '../../src/components/ui/Modal'

type ThemeName = 'light' | 'dark' | 'navy'
const themeOf = (value: string): ThemeName => (value === 'dark' || value === 'navy' ? value : 'light')

const meta: Meta = {
  title: 'Componentes/antd',
  parameters: {
    docs: { description: { component: 'Componentes de antd para lo que es caro construir a mano (calendarios, árboles, carga de archivos). Se importan desde `@duralux/ui/antd` y van dentro de `DuraluxAntdProvider`, que aplica tokens, alturas, tipografía, tema y locale español.' } },
  },
}
export default meta
type Story = StoryObj

const fixed = dayjs('2026-10-04')

export const PorDefectoVsDuralux: Story = {
  name: 'antd por defecto vs. Duralux',
  // El lado izquierdo es antd sin tema, a propósito: muestra lo que NO se usa (grises de 1,8:1).
  parameters: { a11y: { test: 'off' } },
  render: (_args, { globals }) => (
    <div className="row g-4" style={{ minHeight: 460 }}>
      <div className="col-md-6">
        <p className="sb-section__description">antd sin tema (no usar)</p>
        <ConfigProvider>
          <div className="d-flex gap-2">
            <AntdSelect style={{ width: 160 }} defaultValue="activa" options={[{ value: 'activa', label: 'Activa' }]} />
            <AntdDatePicker defaultValue={fixed} open getPopupContainer={el => el.parentElement ?? document.body} />
          </div>
        </ConfigProvider>
      </div>
      <div className="col-md-6">
        <p className="sb-section__description">Con DuraluxAntdProvider</p>
        <DuraluxAntdProvider theme={themeOf(String(globals.theme ?? 'light'))}>
          <div className="d-flex gap-2 align-items-start">
            <Button variant="light-brand">Exportar</Button>
            <DatePicker defaultValue={fixed} open getPopupContainer={el => el.parentElement ?? document.body} />
          </div>
        </DuraluxAntdProvider>
      </div>
    </div>
  ),
}

export const BarraDeFiltros: Story = {
  name: 'Barra de filtros con período',
  render: (_args, { globals }) => (
    <DuraluxAntdProvider theme={themeOf(String(globals.theme ?? 'light'))}>
      <Card title="Llamadas" subtitle="Filtra por período, campaña y área">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div style={{ width: 240 }}><Input placeholder="Buscar agente o campaña" icon="feather-search" aria-label="Buscar agente o campaña" /></div>
          <DateRangeFilter style={{ width: 260 }} />
          <TreeSelect style={{ width: 220 }} treeData={[{ title: 'Ventas', value: 'ventas', children: [{ title: 'Fibra', value: 'fibra' }, { title: 'Móvil', value: 'movil' }] }, { title: 'Cobranza', value: 'cobranza' }]} />
          <Cascader style={{ width: 200 }} options={[{ label: 'Chile', value: 'cl', children: [{ label: 'Santiago', value: 'scl' }] }]} />
          <Button>Aplicar</Button>
        </div>
      </Card>
    </DuraluxAntdProvider>
  ),
}

export const CargaDeArchivos: Story = {
  name: 'Carga de archivos (FileDrop)',
  render: (_args, { globals }) => (
    <DuraluxAntdProvider theme={themeOf(String(globals.theme ?? 'light'))}>
      <div style={{ maxWidth: 560 }}>
        <FileDrop hint="Audios MP3 o WAV, hasta 50 MB cada uno." multiple />
      </div>
    </DuraluxAntdProvider>
  ),
}

export const DentroDeUnModal: Story = {
  name: 'DatePicker dentro de un Modal (z-index)',
  render: (_args, { globals }) => (
    <DuraluxAntdProvider theme={themeOf(String(globals.theme ?? 'light'))}>
      <Modal open title="Programar revisión" onClose={() => {}} footer={<Button>Programar</Button>}>
        <FormField label="Fecha de revisión" htmlFor="sb-fecha">
          <DatePicker id="sb-fecha" defaultValue={fixed} open style={{ width: '100%' }} />
        </FormField>
      </Modal>
    </DuraluxAntdProvider>
  ),
}
