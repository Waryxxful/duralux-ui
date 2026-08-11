import { cx } from '../../utils/cx'

const DEFAULT_LINKS = [
  { id: 'help', label: 'Ayuda' },
  { id: 'terms', label: 'Términos' },
  { id: 'privacy', label: 'Privacidad' },
]

function hasHref(href) {
  return typeof href === 'string' && href.trim() !== '' && href !== '#'
}

function entryKey(entry, index) {
  const identity = entry?.id ?? entry?.key ?? entry?.href ?? entry?.label ?? `entry-${index}`
  return `footer-entry-${String(identity).replace(/[^a-zA-Z0-9_-]+/g, '-')}-${index}`
}

function FooterEntry({ entry }) {
  const label = entry?.label ?? entry?.children
  const className = 'fs-11 fw-semibold text-uppercase gcu-link-button'
  if (hasHref(entry?.href)) {
    return <a className={className} href={entry.href} onClick={typeof entry.onClick === 'function' ? entry.onClick : undefined}>{label}</a>
  }
  if (typeof entry?.onClick === 'function') {
    return <button type="button" className={className} onClick={entry.onClick}>{label}</button>
  }
  return <span className={className}>{label}</span>
}

function renderEntries(entries) {
  if (!Array.isArray(entries)) return entries
  return entries.map((entry, index) => (
    <FooterEntry key={entryKey(entry, index)} entry={entry} />
  ))
}

/**
 * Footer — public extraction of the AppLayout footer markup.
 * AppLayout remains the integration owner for now; this component preserves
 * its DOM while allowing the left content and right entries to be configured.
 */
export function Footer({
  copyright = `Copyright © ${new Date().getFullYear()}`,
  content = undefined,
  links = DEFAULT_LINKS,
  actions = undefined,
  className = '',
}) {
  const leftContent = content === undefined ? copyright : content
  const rightContent = actions === undefined ? renderEntries(links) : actions

  return (
    <footer className={cx('footer', className)}>
      <p className="fs-11 text-muted fw-medium text-uppercase mb-0">{leftContent}</p>
      <div className="d-flex align-items-center gap-4">{rightContent}</div>
    </footer>
  )
}
