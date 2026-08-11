import { cx } from '../../utils/cx'
import { resolveVariant } from './buttonVariants'

function blockDisabledEvent(event) {
  event.preventDefault()
  event.stopPropagation()
}

/**
 * Button — botón con variantes, tamaños y estado de carga.
 *
 * Props:
 *   variant   — solid semantic | "light-brand" | soft "light-{semantic}" (SCSS .btn-light-*)
 *   outline   — DEPRECADO e ignorado: la plantilla Duralux no usa variantes outline; usá variant="light-brand"
 *   size      — "sm" | "md" | "lg"
 *   loading   — muestra spinner y deshabilita
 *   icon      — feather class string shown before label (legacy; prefer startIcon)
 *   startIcon — bare feather name → leading icon
 *   endIcon   — bare feather name → trailing icon
 *   as        — element type (default "button")
 */

export function Button({
  variant = 'primary',
  outline = false,
  size = undefined,
  loading = false,
  icon = null,
  startIcon = null,
  endIcon = null,
  disabled = false,
  onClick = undefined,
  href = undefined,
  as: Tag = href ? 'a' : 'button',
  className = '',
  children,
  type = 'button',
  onKeyDown = undefined,
  onKeyUp = undefined,
  'aria-disabled': ariaDisabled = undefined,
  'aria-busy': ariaBusy = undefined,
  tabIndex = undefined,
  ...props
}) {
  // outline deprecado: la plantilla no usa variantes outline
  void outline
  const tone = resolveVariant(variant)
  const isDisabled = disabled || loading
  const isNativeTag = typeof Tag === 'string'
  const isNativeButton = Tag === 'button'
  const isNativeAnchor = Tag === 'a'
  const isDisabledNonButton = !isNativeButton && isDisabled
  const handleClick = isDisabledNonButton ? blockDisabledEvent : onClick
  const handleKeyDown = isDisabledNonButton ? blockDisabledEvent : onKeyDown
  const handleKeyUp = isDisabledNonButton ? blockDisabledEvent : onKeyUp

  const elementProps = {
    ...props,
    className: cx('btn', `btn-${tone}`, size && `btn-${size}`, className),
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
  }

  if (isNativeButton) {
    elementProps.disabled = isDisabled
    elementProps.type = type
    if (ariaDisabled !== undefined) elementProps['aria-disabled'] = ariaDisabled
    if (tabIndex !== undefined) elementProps.tabIndex = tabIndex
  } else {
    if (isDisabledNonButton) {
      elementProps['aria-disabled'] = true
      elementProps.tabIndex = -1
    } else {
      if (ariaDisabled !== undefined) elementProps['aria-disabled'] = ariaDisabled
      if (tabIndex !== undefined) elementProps.tabIndex = tabIndex
    }
    if ((isNativeAnchor && !isDisabled || !isNativeTag) && href !== undefined) {
      elementProps.href = href
    }
    if (!isNativeTag) {
      elementProps.disabled = isDisabled
      elementProps.type = type
    }
  }

  if (loading || ariaBusy !== undefined) {
    elementProps['aria-busy'] = loading ? true : ariaBusy
  }

  return (
    <Tag {...elementProps}>
      {loading
        ? <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        : (startIcon
            ? <i className={`feather-${startIcon} me-2`} aria-hidden />
            : icon && <i className={`${icon} me-2`} aria-hidden="true"></i>
          )
      }
      {children}
      {!loading && endIcon && <i className={`feather-${endIcon} ms-2`} aria-hidden />}
    </Tag>
  )
}

/**
 * LinkButton — Button renderizado como ancla (<a>).
 *
 * Props: mismas que Button + href requerido.
 */
export function LinkButton({ href, ...props }) {
  return <Button as="a" href={href} {...props} />
}

/**
 * IconButton — Button solo con icono, sin texto.
 *
 * Props:
 *   icon    — bare feather name (e.g. "edit")
 *   label   — REQUIRED; used as aria-label and title
 *   variant (default "light-brand", canónico del template), size, ...rest (outline deprecado e ignorado)
 */
export function IconButton({ icon, label, variant, size, outline, className = '', type = 'button', ...rest }) {
  void outline
  const { 'aria-label': _restAriaLabel, title: _restTitle, ...forwardedProps } = rest
  const tone = resolveVariant(variant || 'light-brand')
  return (
    <button
      {...forwardedProps}
      type={type}
      className={cx('btn', 'btn-icon', `btn-${tone}`, size && `btn-${size}`, className)}
      aria-label={label}
      title={label}
    >
      <i className={`feather-${icon}`} aria-hidden />
    </button>
  )
}
