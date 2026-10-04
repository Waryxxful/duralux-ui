import { Cascader as AntdCascader, TreeSelect as AntdTreeSelect, Upload } from 'antd'
import type { GetProps, TreeSelectProps, UploadProps } from 'antd'

export type CascaderProps = GetProps<typeof AntdCascader>
import { renderIconSlot } from '../utils/iconSlot'
import { isString } from '../utils/typeGuards'

export type { TreeSelectProps }

/** TreeSelect con búsqueda por título y placeholder en español. */
export function TreeSelect({ placeholder = 'Selecciona una opción', showSearch = true, treeNodeFilterProp = 'title', ...props }: TreeSelectProps) {
  // El buscador interno necesita nombre accesible; sin etiqueta propia, usa el placeholder.
  const label = props['aria-label'] ?? (isString(placeholder) ? placeholder : undefined)
  return <AntdTreeSelect placeholder={placeholder} showSearch={showSearch} treeNodeFilterProp={treeNodeFilterProp} aria-label={label} {...props} />
}

/** Cascader con búsqueda y placeholder en español. */
export function Cascader({ placeholder = 'Selecciona una opción', showSearch = true, ...props }: CascaderProps) {
  const label = props['aria-label'] ?? (isString(placeholder) ? placeholder : undefined)
  return <AntdCascader placeholder={placeholder} showSearch={showSearch} aria-label={label} {...props} />
}

export interface FileDropProps extends UploadProps {
  /** Texto principal; por defecto en español. */
  title?: string
  /** Ayuda bajo el título (formatos, tamaño máximo). */
  hint?: string
}

/**
 * Zona para soltar archivos. Sin `action`, no sube nada por su cuenta: entrega los archivos
 * en `onChange` / `fileList` para que la app decida (evita subidas accidentales).
 */
export function FileDrop({ title = 'Arrastra archivos aquí o haz clic para elegirlos', hint, beforeUpload, action, ...props }: FileDropProps) {
  return (
    <Upload.Dragger action={action} beforeUpload={beforeUpload ?? (action ? undefined : () => false)} {...props}>
      <p className="ant-upload-drag-icon">{renderIconSlot('upload-cloud', { size: 'xl' })}</p>
      <p className="ant-upload-text">{title}</p>
      {hint ? <p className="ant-upload-hint">{hint}</p> : null}
    </Upload.Dragger>
  )
}
