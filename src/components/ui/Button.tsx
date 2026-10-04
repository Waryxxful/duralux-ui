import { forwardRef } from 'react'
import type * as React from 'react'
import { cx } from '../../utils/cx'
import { isString } from '../../utils/typeGuards'
import { renderIconSlot } from '../../utils/iconSlot'
import { deprecate } from '../../utils/log'
import type { ButtonProps, IconButtonProps, LinkButtonProps } from '../../public/types'
import { resolveVariant } from './buttonVariants'

function blockDisabledEvent(event: React.SyntheticEvent) {
  event.preventDefault()
  event.stopPropagation()
}

/** Props que Button entrega al elemento renderizado (button nativo, ancla u otro `as`). */
interface ButtonElementProps extends React.HTMLAttributes<HTMLElement> {
  ref: React.Ref<HTMLElement>
  disabled?: boolean
  type?: string
  href?: string
}

interface ButtonContentProps {
  loading: boolean
  startIcon: ButtonProps['startIcon']
  icon: ButtonProps['icon']
  endIcon: ButtonProps['endIcon']
  children: React.ReactNode
}

/** Contenido común: el spinner ocupa el lugar del ícono inicial y el texto se conserva. */
function ButtonContent({ loading, startIcon, icon, endIcon, children }: ButtonContentProps) {
  const leading = loading
    ? <span className="spinner-border spinner-border-sm me-2 gcu-button__icon--start" aria-hidden="true" />
    : startIcon
      ? renderIconSlot(startIcon, { className: 'me-2 gcu-button__icon--start' })
      : icon && <i className={`${icon} me-2 gcu-button__icon--start`} aria-hidden="true" />
  return (
    <>
      {leading}
      {children}
      {!loading && renderIconSlot(endIcon, { className: 'ms-2 gcu-button__icon--end' })}
    </>
  )
}

/**
 * Button — acción con variantes canónicas Duralux, tamaños sm/md/lg y estado de carga.
 *
 * - variant: sólido semántico | "light-brand" (secundario) | suave "light-{tono}". `outline` está deprecado.
 * - loading: spinner en lugar del ícono inicial; conserva el texto (sin salto de ancho), deshabilita y marca aria-busy.
 * - startIcon / endIcon: nombre Feather o icono Tabler (`<IconX />`).
 * - as / href: se renderiza como ancla u otro elemento; deshabilitado fuera de <button> bloquea eventos.
 */
export const Button = /* @__PURE__ */ forwardRef<HTMLElement, ButtonProps>(function Button({
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
}, ref) {
  if (outline) deprecate('button-outline', 'la prop `outline` de Button se ignora; usa variant="light-brand".')
  const tone = resolveVariant(variant)
  const isDisabled = disabled || loading
  const isNativeTag = isString(Tag)
  const isNativeButton = Tag === 'button'
  const isNativeAnchor = Tag === 'a'
  const isDisabledNonButton = !isNativeButton && isDisabled

  const elementProps: ButtonElementProps = {
    ...props,
    ref,
    className: cx('btn', 'gcu-button', `btn-${tone}`, size && `btn-${size}`, className),
    onClick: isDisabledNonButton ? blockDisabledEvent : onClick,
    onKeyDown: isDisabledNonButton ? blockDisabledEvent : onKeyDown,
    onKeyUp: isDisabledNonButton ? blockDisabledEvent : onKeyUp,
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
    if (((isNativeAnchor && !isDisabled) || !isNativeTag) && href !== undefined) elementProps.href = href
    if (!isNativeTag) {
      elementProps.disabled = isDisabled
      elementProps.type = type
    }
  }

  if (loading || ariaBusy !== undefined) elementProps['aria-busy'] = loading ? true : ariaBusy

  return (
    <Tag {...elementProps}>
      <ButtonContent loading={loading} startIcon={startIcon} icon={icon} endIcon={endIcon}>{children}</ButtonContent>
    </Tag>
  )
})

/** LinkButton — Button renderizado como ancla (<a>). */
export const LinkButton = /* @__PURE__ */ forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton({
  href,
  variant = 'primary',
  outline = false,
  size = undefined,
  loading = false,
  icon = null,
  startIcon = null,
  endIcon = null,
  className = '',
  children,
  onClick,
  ...props
}, ref) {
  if (outline) deprecate('linkbutton-outline', 'la prop `outline` de LinkButton se ignora; usa variant="light-brand".')
  const tone = resolveVariant(variant)
  return (
    <a
      {...props}
      ref={ref}
      href={loading ? undefined : href}
      className={cx('btn', 'gcu-button', `btn-${tone}`, size && `btn-${size}`, className)}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      tabIndex={loading ? -1 : props.tabIndex}
      onClick={loading ? blockDisabledEvent : onClick}
    >
      <ButtonContent loading={loading} startIcon={startIcon} icon={icon} endIcon={endIcon}>{children}</ButtonContent>
    </a>
  )
})

/** IconButton — botón de solo icono; `label` es obligatorio y se usa como aria-label y title. */
export const IconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant, size, outline, className = '', type = 'button', ...rest },
  ref,
) {
  if (outline) deprecate('iconbutton-outline', 'la prop `outline` de IconButton se ignora; usa variant="light-brand".')
  const { 'aria-label': _ariaLabel, title: _title, ...forwardedProps } = rest
  const tone = resolveVariant(variant || 'light-brand')
  return (
    <button
      {...forwardedProps}
      ref={ref}
      type={type}
      className={cx('btn', 'btn-icon', 'gcu-button', `btn-${tone}`, size && `btn-${size}`, className)}
      aria-label={label}
      title={label}
    >
      {renderIconSlot(icon)}
    </button>
  )
})
