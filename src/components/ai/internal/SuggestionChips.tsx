import { cx } from '../../../utils/cx'

interface SuggestionChipsProps {
  items: ReadonlyArray<string>
  onPick?: (item: string) => void
  label: string
  className?: string
}

/** Preguntas sugeridas o de seguimiento: botones reales en una lista con nombre. */
export function SuggestionChips({ items, onPick, label, className }: SuggestionChipsProps) {
  if (items.length === 0) return null
  return (
    <ul className={cx('gcu-ai-suggestions', className)} aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <button type="button" className="gcu-ai-suggestion" onClick={() => onPick?.(item)}>
            {item}
          </button>
        </li>
      ))}
    </ul>
  )
}
