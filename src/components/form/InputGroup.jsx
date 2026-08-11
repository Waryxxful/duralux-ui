import { Children, Fragment, cloneElement, isValidElement } from 'react'

function hasContent(value) {
  return value !== undefined && value !== null && value !== false
}

function canForwardFieldSemantics(children) {
  if (typeof children === 'function') return true
  const items = Children.toArray(children)
  return items.length === 1 && isValidElement(items[0]) && items[0].type !== Fragment
}

/**
 * Bootstrap-compatible input group that forwards field semantics to exactly
 * one control child. With multiple children it deliberately leaves ownership
 * to the caller instead of guessing which element the label describes.
 */
export function InputGroup({
  prepend,
  append,
  className,
  children,
  id,
  required,
  disabled,
  'aria-required': ariaRequired,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}) {
  const controlProps = {
    ...(id !== undefined ? { id } : {}),
    ...(required !== undefined ? { required } : {}),
    ...(disabled !== undefined ? { disabled } : {}),
    ...(ariaRequired !== undefined ? { 'aria-required': ariaRequired } : {}),
    ...(ariaInvalid !== undefined ? { 'aria-invalid': ariaInvalid } : {}),
    ...(ariaDescribedBy !== undefined ? { 'aria-describedby': ariaDescribedBy } : {}),
  }

  let content = children
  if (typeof children === 'function') {
    content = children(controlProps)
  } else {
    const items = Children.toArray(children)
    if (items.length === 1 && isValidElement(items[0]) && items[0].type !== Fragment) {
      const child = items[0]
      const descriptionIds = [
        ...String(child.props['aria-describedby'] ?? '').trim().split(/\s+/),
        ...String(controlProps['aria-describedby'] ?? '').trim().split(/\s+/),
      ].filter(Boolean)
      content = cloneElement(child, {
        ...controlProps,
        ...child.props,
        id: child.props.id ?? controlProps.id,
        required: child.props.required ?? controlProps.required,
        disabled: child.props.disabled ?? controlProps.disabled,
        'aria-required': child.props['aria-required'] ?? controlProps['aria-required'],
        'aria-invalid': child.props['aria-invalid'] ?? controlProps['aria-invalid'],
        'aria-describedby': descriptionIds.length ? [...new Set(descriptionIds)].join(' ') : undefined,
      })
    }
  }

  return (
    <div className={['input-group', className].filter(Boolean).join(' ')}>
      {hasContent(prepend) && <span className="input-group-text">{prepend}</span>}
      {content}
      {hasContent(append) && <span className="input-group-text">{append}</span>}
    </div>
  )
}

// FormField asks this marker whether this particular instance has one target.
// A multi-control group must be associated explicitly by the caller.
InputGroup.duraluxFormControl = ({ children }) => canForwardFieldSemantics(children)
