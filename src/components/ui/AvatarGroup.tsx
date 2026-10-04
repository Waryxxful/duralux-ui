import { forwardRef } from 'react'
import type * as React from 'react'
import { Avatar } from './Avatar'
import { cx } from '../../utils/cx'
import { isArray, isFunction, isNonEmptyString } from '../../utils/typeGuards'
import type { AvatarGroupItem, AvatarGroupProps, AvatarProps } from '../../public/types'

function safeToken(value: unknown, fallback: string): string {
  let token = ''
  try {
    token = String(value ?? '').normalize('NFKD')
  } catch {
    token = ''
  }
  token = token
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return token || fallback
}

function normalizedMax(max: unknown, fallback = 5): number {
  const numeric = Number(max)
  if (!Number.isFinite(numeric)) return fallback
  return Math.max(0, Math.floor(numeric))
}

function hasHref(href: unknown): href is string {
  return isNonEmptyString(href) && href !== '#'
}

function itemLabel(item: AvatarGroupItem | null | undefined): string | undefined {
  if (item?.name === null || item?.name === undefined) return undefined
  const label = String(item.name).trim()
  return label || undefined
}

interface AvatarItemProps {
  item: AvatarGroupItem
  index: number
  renderItem?: AvatarGroupProps['renderItem']
  size: AvatarProps['size']
}

function AvatarItem({ item, index, renderItem, size }: AvatarItemProps) {
  const name = itemLabel(item)
  const onClick = isFunction(item?.onClick) ? item.onClick : undefined
  const href = hasHref(item?.href) ? item.href : undefined
  const customRenderer = isFunction(item?.renderItem)
    ? item.renderItem
    : isFunction(renderItem) ? renderItem : undefined
  const content = customRenderer
    ? customRenderer(item, index)
    : (
      <Avatar
        src={item?.src}
        name={item?.name === undefined || item?.name === null ? '' : String(item.name)}
        alt=""
        size={size}
        aria-hidden="true"
      />
    )
  const commonProps = {
    title: name,
    'aria-label': name,
    'data-avatar-group-item': 'true',
  }

  if (href) {
    return <a {...commonProps} href={href} onClick={onClick}>{content}</a>
  }
  if (onClick) {
    return <button {...commonProps} type="button" onClick={onClick}>{content}</button>
  }
  return <span {...commonProps} role={name ? 'img' : undefined}>{content}</span>
}

/**
 * AvatarGroup — pila de avatares sobre el contrato `.img-group` del tema, independiente del router.
 * Identidades faltantes o repetidas reciben claves DOM deterministas. El contador «+N» usa cifras
 * tabulares y es un botón solo si hay `onOverflowClick`.
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup({
  items = [],
  max = 5,
  size = 'md',
  className = '',
  renderItem,
  onOverflowClick,
  overflowLabel = undefined,
  overflowClassName = '',
}, ref) {
  const list: ReadonlyArray<AvatarGroupItem> = isArray(items) ? items : []
  const limit = normalizedMax(max)
  const visibleItems = list.slice(0, limit)
  const overflowCount = Math.max(0, list.length - visibleItems.length)
  const seen = new Map<string, number>()
  const getKey = (item: AvatarGroupItem, index: number) => {
    const identity = item?.id !== undefined && item?.id !== null && String(item.id).trim() !== ''
      ? item.id
      : `missing-${index}`
    const base = safeToken(identity, `item-${index}`)
    const occurrence = seen.get(base) ?? 0
    seen.set(base, occurrence + 1)
    return `avatar-group-${base}-${occurrence}`
  }
  const label = overflowLabel ?? `${overflowCount} ${overflowCount === 1 ? 'persona' : 'personas'} más`
  const overflowClasses = cx('avatar-text', `avatar-${size}`, 'gcu-avatar', 'gcu-avatar--overflow', overflowClassName)
  let overflow: React.ReactNode = null
  if (overflowCount > 0) {
    overflow = isFunction(onOverflowClick)
      ? (
        <button type="button" className={overflowClasses} aria-label={label} title={label} onClick={onOverflowClick}>
          +{overflowCount}
        </button>
      )
      : (
        <span className={overflowClasses} role="img" aria-label={label} title={label}>
          +{overflowCount}
        </span>
      )
  }

  return (
    <div ref={ref} className={cx('img-group', 'gcu-avatar-group', className)}>
      {visibleItems.map((item, index) => (
        <AvatarItem key={getKey(item, index)} item={item} index={index} renderItem={renderItem} size={size} />
      ))}
      {overflow}
    </div>
  )
})
