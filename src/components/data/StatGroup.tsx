import { forwardRef, useId } from 'react'
import { cx } from '../../utils/cx'
import { log } from '../../utils/log'
import { isArray, isString } from '../../utils/typeGuards'
import type { StatGroupItem, StatGroupProps } from '../../public/types'
import { formatDelta, hasIndicatorContent, headingTag, resolveTone, warnMissingContext } from '../ui/internal/indicator'
import { IndicatorContext, IndicatorDeltaChip, IndicatorGlyph, IndicatorValue } from '../ui/internal/IndicatorParts'

function statKey(item: StatGroupItem, seen: Map<string, number>): string {
  const base = item.id !== undefined ? `id:${String(item.id)}` : isString(item.label) ? `label:${item.label}` : 'stat'
  const count = (seen.get(base) ?? 0) + 1
  seen.set(base, count)
  return `${base}~${count}`
}

function StatCell({ item, loading }: { item: StatGroupItem; loading: boolean }) {
  const tone = resolveTone('StatGroup', item.tone, undefined, 'neutral')
  const delta = formatDelta('StatGroup', item.delta)
  warnMissingContext('StatGroup', item.label, Boolean(delta) || hasIndicatorContent(item.context))
  return (
    <div className="gcu-stat-group__cell">
      <dt className="gcu-stat-group__label">
        {item.icon && (
          <span className={cx('gcu-stat__icon', `gcu-stat__icon--${tone}`, 'gcu-stat-group__icon')}>
            <IndicatorGlyph icon={item.icon} />
          </span>
        )}
        <span>{item.label}</span>
      </dt>
      <dd className="gcu-stat-group__figures">
        <IndicatorValue value={item.value} unit={item.unit} loading={loading} />
        {delta && !loading && <IndicatorDeltaChip delta={delta} label={item.delta?.label} />}
        <IndicatorContext value={item.value} loading={loading} context={item.context} />
      </dd>
    </div>
  )
}

/**
 * StatGroup — 2 a 4 métricas relacionadas en una sola card: reemplaza la fila de StatsCard iguales.
 *
 * - Cada métrica lleva etiqueta, cifra es-CL tabular, variación con signo y flecha, y contexto.
 * - Responde a su contenedor: una columna en angosto, dos desde 28rem y todas desde 42rem,
 *   con separadores entre celdas.
 * - title: título de la card (h3 por defecto); sin título, da nombre con `aria-label`.
 * - loading: skeleton por cifra y `aria-busy`.
 * Estilos: src/styles/components/stat-group.css e indicator.css.
 */
export const StatGroup = /* @__PURE__ */ forwardRef<HTMLElement, StatGroupProps>(function StatGroup({
  items,
  title,
  headingLevel = 3,
  loading = false,
  className,
  ...rest
}, ref) {
  const titleId = `gcu-stat-group-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const list = isArray(items) ? items : []
  if (list.length < 2 || list.length > 4) {
    log.warn(`StatGroup: agrupa de 2 a 4 métricas (recibidas: ${list.length}). Para una sola cifra usa KpiCard.`)
  }
  const seen = new Map<string, number>()
  const Heading = headingTag(headingLevel, 'h3')
  const hasTitle = hasIndicatorContent(title)

  return (
    <section
      {...rest}
      ref={ref}
      aria-labelledby={hasTitle ? titleId : rest['aria-labelledby']}
      className={cx('card', 'gcu-stat-group', 'gcu-container', className)}
      aria-busy={loading || rest['aria-busy'] || undefined}
    >
      {hasTitle && (
        <div className="card-header gcu-stat-group__header">
          <Heading id={titleId} className="card-title gcu-stat-group__title">{title}</Heading>
        </div>
      )}
      <dl className={cx('gcu-stat-group__grid', `gcu-stat-group__grid--${Math.min(4, Math.max(2, list.length))}`)}>
        {list.map((item) => <StatCell key={statKey(item, seen)} item={item} loading={loading} />)}
      </dl>
    </section>
  )
})
