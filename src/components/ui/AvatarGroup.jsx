import { Avatar } from './Avatar'
import { cx } from '../../utils/cx'
import { isArray, isFunction, isNonEmptyString } from '../../utils/typeGuards'

function safeToken(value, fallback) {
  let token = ''
  try {
    token = String(value ?? '').normalize('NFKD')
  } catch {
    token = ''
  }
  token = token
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 48)
  return token || fallback
}

function normalizedMax(max, fallback = 5) {
  const numeric = Number(max)
  if (!Number.isFinite(numeric)) return fallback
  return Math.max(0, Math.floor(numeric))
}

function hasHref(href) {
  return isNonEmptyString(href) && href !== '#'
}

function itemLabel(item) {
  if (item?.name === null || item?.name === undefined) return undefined
  const label = String(item.name).trim()
  return label || undefined
}

function AvatarItem({ item, index, renderItem, size, className }) {
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
        name={item?.name}
        alt=""
        size={size}
        className={className}
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
 * AvatarGroup — a small, router-agnostic avatar stack using the theme's
 * `.img-group` contract. Missing or duplicate identities get deterministic,
 * safe DOM keys so production markup never depends on random values.
 */
export function AvatarGroup({
  items = [],
  max = 5,
  size = 'md',
  className = '',
  renderItem,
  onOverflowClick,
  overflowLabel = undefined,
  overflowClassName = '',
}) {
  const list = isArray(items) ? items : []
  const limit = normalizedMax(max)
  const visibleItems = list.slice(0, limit)
  const overflowCount = Math.max(0, list.length - visibleItems.length)
  const seen = new Map()
  const getKey = (item, index) => {
    const identity = item?.id !== undefined && item?.id !== null && String(item.id).trim() !== ''
      ? item.id
      : `missing-${index}`
    const base = safeToken(identity, `item-${index}`)
    const occurrence = seen.get(base) ?? 0
    seen.set(base, occurrence + 1)
    return `avatar-group-${base}-${occurrence}`
  }
  const label = overflowLabel ?? `${overflowCount} ${overflowCount === 1 ? 'persona' : 'personas'} más`
  const overflow = overflowCount > 0
    ? isFunction(onOverflowClick)
      ? (
        <button
          type="button"
          className={cx('avatar-text avatar-md bg-soft-primary text-primary', overflowClassName)}
          aria-label={label}
          title={label}
          onClick={onOverflowClick}
        >
          +{overflowCount}
        </button>
      )
      : (
        <span
          className={cx('avatar-text avatar-md bg-soft-primary text-primary', overflowClassName)}
          role="img"
          aria-label={label}
          title={label}
        >
          +{overflowCount}
        </span>
      )
    : null

  return (
    <div className={cx('img-group', className)}>
      {visibleItems.map((item, index) => (
        <AvatarItem
          key={getKey(item, index)}
          item={item}
          index={index}
          renderItem={renderItem}
          size={size}
          className=""
        />
      ))}
      {overflow}
    </div>
  )
}
