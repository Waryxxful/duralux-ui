import { Children, Fragment, cloneElement, forwardRef, isValidElement } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isFunction } from '../../utils/typeGuards'
import type { InputGroupControlProps, InputGroupProps } from '../../public/types'

type ControlElement = React.ReactElement<InputGroupControlProps>
type RenderControl = (controlProps: InputGroupControlProps) => React.ReactNode
type InputGroupComponent = React.ForwardRefExoticComponent<InputGroupProps & React.RefAttributes<HTMLDivElement>> & {
  duraluxFormControl?: (props: InputGroupProps) => boolean
}

function hasContent(value: React.ReactNode): boolean {
  return value !== undefined && value !== null && value !== false
}

function isRenderControl(children: InputGroupProps['children']): children is RenderControl {
  return isFunction<InputGroupProps['children'], RenderControl>(children)
}

function singleControl(children: React.ReactNode): ControlElement | null {
  const items = Children.toArray(children)
  if (items.length !== 1) return null
  const [child] = items
  return isValidElement<InputGroupControlProps>(child) && child.type !== Fragment ? child : null
}

function canForwardFieldSemantics(children: InputGroupProps['children']): boolean {
  if (isRenderControl(children)) return true
  return singleControl(children) !== null
}

function mergeDescriptions(...values: Array<string | undefined>): string | undefined {
  const ids = values.flatMap(value => (value ?? '').trim().split(/\s+/)).filter(Boolean)
  return ids.length ? [...new Set(ids)].join(' ') : undefined
}

/**
 * InputGroup — `.input-group` de Bootstrap con prepend / append y semántica de campo.
 *
 * Con un solo control hijo le pasa id, required, disabled y ARIA (los del hijo ganan).
 * Con varios hijos no adivina a quién describe el label: usa el render-prop.
 * El ref apunta al contenedor `.input-group`.
 */
const InputGroupBase = /* @__PURE__ */ forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup({
  prepend,
  append,
  controlSize,
  className,
  children,
  id,
  required,
  disabled,
  'aria-required': ariaRequired,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}, ref) {
  const controlProps: InputGroupControlProps = {}
  if (id !== undefined) controlProps.id = id
  if (required !== undefined) controlProps.required = required
  if (disabled !== undefined) controlProps.disabled = disabled
  if (ariaRequired !== undefined) controlProps['aria-required'] = ariaRequired
  if (ariaInvalid !== undefined) controlProps['aria-invalid'] = ariaInvalid
  if (ariaDescribedBy !== undefined) controlProps['aria-describedby'] = ariaDescribedBy

  let content: React.ReactNode
  if (isRenderControl(children)) {
    content = children(controlProps)
  } else {
    content = children
    const child = singleControl(children)
    if (child) {
      content = cloneElement(child, {
        ...controlProps,
        ...child.props,
        id: child.props.id ?? controlProps.id,
        required: child.props.required ?? controlProps.required,
        disabled: child.props.disabled ?? controlProps.disabled,
        'aria-required': child.props['aria-required'] ?? controlProps['aria-required'],
        'aria-invalid': child.props['aria-invalid'] ?? controlProps['aria-invalid'],
        'aria-describedby': mergeDescriptions(child.props['aria-describedby'], controlProps['aria-describedby']),
      })
    }
  }

  return (
    <div
      ref={ref}
      className={cx('input-group', controlSize === 'sm' && 'input-group-sm', controlSize === 'lg' && 'input-group-lg', className)}
    >
      {hasContent(prepend) && <span className="input-group-text">{prepend}</span>}
      {content}
      {hasContent(append) && <span className="input-group-text">{append}</span>}
    </div>
  )
})

// FormField pregunta a este marcador si la instancia tiene un único control destino.
// Un grupo con varios controles se asocia de forma explícita.
// Object.assign dentro de una expresión pura: si la app no usa InputGroup, el bundler lo descarta.
export const InputGroup: InputGroupComponent = /* @__PURE__ */ Object.assign(InputGroupBase, {
  duraluxFormControl: ({ children }: InputGroupProps) => canForwardFieldSemantics(children),
})
