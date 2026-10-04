import { Image, Splitter as AntdSplitter, Tour as AntdTour } from 'antd'
import type { GetProps, ImageProps, SplitterProps, TourProps, TourStepProps } from 'antd'
import { Children, cloneElement, isValidElement } from 'react'
import type * as React from 'react'
import { renderIconSlot } from '../utils/iconSlot'
import { log } from '../utils/log'
import { SPLITTER_PANEL_MIN } from './defaults'

// ── Splitter ────────────────────────────────────────────────────────────────

export type { SplitterProps, TourProps, TourStepProps }
export type SplitterPanelProps = GetProps<typeof AntdSplitter.Panel>
type SplitterRootProps = GetProps<typeof AntdSplitter>

/**
 * Splitter de antd con `min` = 160 px en cada `Splitter.Panel` que no lo declare.
 * antd lee las props de cada hijo, por eso el default se aplica aquí y no en el panel.
 */
export function Splitter({ children, ...props }: SplitterRootProps) {
  const panels = Children.map(children, child => {
    if (!isValidElement<SplitterPanelProps>(child)) return child
    if (child.type !== AntdSplitter.Panel) log.warn('Splitter: los hijos deben ser `Splitter.Panel`.')
    return child.props.min === undefined ? cloneElement(child, { min: SPLITTER_PANEL_MIN }) : child
  })
  return <AntdSplitter {...props}>{panels}</AntdSplitter>
}

Splitter.Panel = AntdSplitter.Panel

// ── Tour ────────────────────────────────────────────────────────────────────

/** Botones del tour en español aunque un ConfigProvider anidado cambie el locale. */
function withSpanishButtons(steps: TourStepProps[]): TourStepProps[] {
  const last = steps.length - 1
  return steps.map((step, index) => ({
    ...step,
    prevButtonProps: { ...step.prevButtonProps, children: step.prevButtonProps?.children ?? 'Anterior' },
    nextButtonProps: { ...step.nextButtonProps, children: step.nextButtonProps?.children ?? (index === last ? 'Finalizar' : 'Siguiente') },
  }))
}

/** Tour guiado con botones «Anterior», «Siguiente» y «Finalizar». */
export function Tour({ steps = [], ...props }: TourProps) {
  if (props.open && steps.length === 0) log.warn('Tour: se abrió sin pasos (`steps` vacío).')
  return <AntdTour steps={withSpanishButtons(steps)} {...props} />
}

// ── ImagePreview ────────────────────────────────────────────────────────────

export type ImagePreviewProps = ImageProps

const ACTION_LABELS = new Map([
  ['prev', 'Imagen anterior'],
  ['next', 'Imagen siguiente'],
  ['flipY', 'Voltear verticalmente'],
  ['flipX', 'Voltear horizontalmente'],
  ['rotateLeft', 'Girar a la izquierda'],
  ['rotateRight', 'Girar a la derecha'],
  ['zoomOut', 'Alejar'],
  ['zoomIn', 'Acercar'],
])

/** rc-image rotula los botones del visor con su tipo en inglés (`zoomIn`…); aquí van en español. */
function translateActions(node: React.ReactElement<{ children?: React.ReactNode }>) {
  const buttons = Children.map(node.props.children, button => {
    if (!isValidElement<{ 'aria-label'?: string; title?: string }>(button) || button.key === null) return button
    const label = ACTION_LABELS.get(String(button.key))
    return label ? cloneElement(button, { 'aria-label': label, title: label }) : button
  })
  return cloneElement(node, undefined, buttons)
}

const DEFAULT_COVER = <span className="d-inline-flex align-items-center gap-1">{renderIconSlot('eye', { size: 'sm' })}Ver</span>

/** Image con visor (zoom, giro) y textos en español: «Ver» sobre la miniatura y botones rotulados. */
export function ImagePreview({ preview = true, alt, ...props }: ImagePreviewProps) {
  if (!alt) log.warn('ImagePreview: falta `alt`; la imagen queda sin nombre accesible.')
  if (preview === false) return <Image alt={alt} preview={false} {...props} />
  const custom = preview === true ? undefined : preview
  return <Image alt={alt} preview={{ cover: DEFAULT_COVER, actionsRender: translateActions, ...custom }} {...props} />
}
