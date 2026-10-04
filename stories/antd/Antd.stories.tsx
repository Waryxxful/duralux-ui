import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConfigProvider, DatePicker as AntdDatePicker, Select as AntdSelect } from 'antd'
import dayjs from 'dayjs'
import type * as React from 'react'
import { useRef, useState } from 'react'
import {
  AutoComplete, Calendar, Cascader, CheckTree, ColorPicker, DateRangeFilter, DatePicker, DuraluxAntdProvider, FileDrop, ImagePreview,
  Mentions, NumberInput, RangeSlider, Splitter, TimePicker, TimeRangePicker, Tour, Transfer, TreeSelect,
} from '../../src/antd'
import { Button, Card, FormField, Input } from '../../src'
import { designTokens } from '../../src/generated/tokens'
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

// ── 2.5.1: componentes ampliados ────────────────────────────────────────────

const withTheme = (globals: { theme?: unknown }, node: React.ReactNode) => (
  <DuraluxAntdProvider theme={themeOf(String(globals.theme ?? 'light'))}>{node}</DuraluxAntdProvider>
)

export const RangoDePuntaje: Story = {
  name: 'RangeSlider',
  render: (_args, { globals }) => withTheme(globals, (
    <Card title="Llamadas" subtitle="Filtra por puntaje de calidad">
      <div style={{ maxWidth: 360 }}>
        <FormField label="Puntaje (mín. y máx.)">
          <RangeSlider handleLabels={['Puntaje mínimo', 'Puntaje máximo']} defaultValue={[40, 85]} marks={{ 0: '0', 50: '50', 100: '100' }} />
        </FormField>
      </div>
    </Card>
  )),
}

const MODULOS = ['Llamadas', 'Agentes', 'Tendencias', 'Campañas', 'Reportes', 'Usuarios'].map(title => ({ key: title.toLowerCase(), title }))

function TransferDemo() {
  const [targetKeys, setTargetKeys] = useState<React.Key[]>(['llamadas', 'agentes'])
  return <Transfer dataSource={MODULOS} targetKeys={targetKeys} onChange={setTargetKeys} />
}

export const TransferDePermisos: Story = {
  name: 'Transfer',
  render: (_args, { globals }) => withTheme(globals, <TransferDemo />),
}

const PERMISOS = [
  { title: 'Call Reviews', key: 'cr', children: [{ title: 'Ver llamadas', key: 'cr.ver' }, { title: 'Evaluar llamadas', key: 'cr.evaluar' }, { title: 'Exportar', key: 'cr.exportar' }] },
  { title: 'Administración', key: 'adm', children: [{ title: 'Usuarios', key: 'adm.usuarios' }, { title: 'Módulos', key: 'adm.modulos' }] },
]

export const ArbolDePermisos: Story = {
  name: 'CheckTree',
  render: (_args, { globals }) => withTheme(globals, (
    <div style={{ maxWidth: 360 }}>
      <CheckTree searchable searchPlaceholder="Buscar permiso" treeData={PERMISOS} defaultExpandedKeys={['cr']} defaultCheckedKeys={['cr.ver']} />
    </div>
  )),
}

export const PanelesRedimensionables: Story = {
  name: 'Splitter',
  render: (_args, { globals }) => withTheme(globals, (
    <Card title="Bandeja">
      <Splitter style={{ height: 260 }}>
        <Splitter.Panel defaultSize="35%"><div className="p-3">Lista de conversaciones</div></Splitter.Panel>
        <Splitter.Panel><div className="p-3">Detalle de la conversación seleccionada</div></Splitter.Panel>
      </Splitter>
    </Card>
  )),
}

export const Horas: Story = {
  name: 'TimePicker y TimeRangePicker',
  render: (_args, { globals }) => withTheme(globals, (
    <div className="d-flex flex-wrap gap-3 align-items-start" style={{ minHeight: 320 }}>
      <FormField label="Hora de inicio" htmlFor="sb-hora"><TimePicker id="sb-hora" open getPopupContainer={el => el.parentElement ?? document.body} /></FormField>
      <FormField label="Ventana de atención" htmlFor="sb-ventana"><TimeRangePicker id="sb-ventana" /></FormField>
    </div>
  )),
}

export const CalendarioDeActividad: Story = {
  name: 'Calendar (semana desde el lunes)',
  render: (_args, { globals }) => withTheme(globals, (
    <Card title="Actividad por día">
      <Calendar fullscreen={false} defaultValue={fixed} />
    </Card>
  )),
}

function TourDemo() {
  const filtros = useRef<HTMLDivElement>(null)
  const exportar = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(true)
  return (
    <Card title="Llamadas">
      <div className="d-flex gap-2 align-items-center">
        <div ref={filtros}><DateRangeFilter /></div>
        <Button ref={exportar} variant="light-brand">Exportar</Button>
        <Button onClick={() => setOpen(true)}>Ver recorrido</Button>
      </div>
      <Tour
        open={open}
        onClose={() => setOpen(false)}
        steps={[
          { title: 'Filtra por período', description: 'Elige un rango o un atajo como «Últimos 7 días».', target: () => filtros.current },
          { title: 'Exporta el resultado', description: 'Descarga las llamadas filtradas en Excel.', target: () => exportar.current },
        ]}
      />
    </Card>
  )
}

export const RecorridoGuiado: Story = {
  name: 'Tour',
  render: (_args, { globals }) => withTheme(globals, <TourDemo />),
}

const AGENTES = ['Ana Pérez', 'Andrés Soto', 'Beatriz Lagos', 'Carlos Muñoz'].map(value => ({ value }))

export const BusquedaConSugerencias: Story = {
  name: 'AutoComplete',
  render: (_args, { globals }) => withTheme(globals, (
    <div style={{ maxWidth: 320, minHeight: 240 }}>
      <AutoComplete style={{ width: '100%' }} options={AGENTES} defaultValue="A" open getPopupContainer={el => el.parentElement ?? document.body}
        filterOption={(input, option) => String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())} />
    </div>
  )),
}

export const MencionesEnNotas: Story = {
  name: 'Mentions',
  render: (_args, { globals }) => withTheme(globals, (
    <div style={{ maxWidth: 420 }}>
      <FormField label="Nota interna">
        <Mentions rows={3} placeholder="Escribe una nota; usa @ para mencionar" options={AGENTES.map(({ value }) => ({ value, label: value }))} />
      </FormField>
    </div>
  )),
}

export const MontosYPorcentajes: Story = {
  name: 'NumberInput (es-CL)',
  render: (_args, { globals }) => withTheme(globals, (
    <div className="d-flex flex-wrap gap-3">
      <FormField label="Monto" htmlFor="sb-monto"><NumberInput id="sb-monto" defaultValue={1250000} prefix="$" style={{ width: 200 }} /></FormField>
      <FormField label="Comisión" htmlFor="sb-comision"><NumberInput id="sb-comision" defaultValue={12.5} min={0} max={100} step={0.5} suffix="%" style={{ width: 140 }} /></FormField>
    </div>
  )),
}

export const ColorDeMarca: Story = {
  name: 'ColorPicker',
  render: (_args, { globals }) => withTheme(globals, (
    <div style={{ minHeight: 420 }}>
      <FormField label="Color de la etiqueta">
        <ColorPicker defaultValue={designTokens.palette.primary['500']} showText open getPopupContainer={el => el.parentElement ?? document.body} />
      </FormField>
    </div>
  )),
}

const muestra = (fill: string, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="${fill}"/><text x="160" y="105" font-family="Inter, sans-serif" font-size="18" fill="white" text-anchor="middle">${label}</text></svg>`)}`

export const VisorDeImagenes: Story = {
  name: 'ImagePreview',
  render: (_args, { globals }) => withTheme(globals, (
    <div className="d-flex gap-3">
      <ImagePreview width={160} src={muestra(designTokens.palette.primary['500'], 'Captura 1')} alt="Captura de la llamada 1" />
      <ImagePreview width={160} src={muestra(designTokens.palette.teal['500'], 'Captura 2')} alt="Captura de la llamada 2" />
    </div>
  )),
}

export const PopupsDentroDeUnModal: Story = {
  name: 'Popups dentro de un Modal (z-index)',
  render: (_args, { globals }) => withTheme(globals, (
    <Modal open title="Configurar campaña" onClose={() => {}} footer={<Button>Guardar</Button>}>
      <div className="d-flex flex-column gap-3">
        <FormField label="Hora de inicio" htmlFor="sb-m-hora"><TimePicker id="sb-m-hora" open style={{ width: '100%' }} /></FormField>
        <FormField label="Ventana de atención" htmlFor="sb-m-ventana"><TimeRangePicker id="sb-m-ventana" style={{ width: '100%' }} /></FormField>
        <FormField label="Supervisor"><AutoComplete options={AGENTES} style={{ width: '100%' }} /></FormField>
        <FormField label="Nota"><Mentions rows={2} placeholder="Usa @ para mencionar" options={AGENTES.map(({ value }) => ({ value, label: value }))} /></FormField>
        <FormField label="Color"><ColorPicker defaultValue={designTokens.palette.teal['500']} showText /></FormField>
      </div>
    </Modal>
  )),
}
