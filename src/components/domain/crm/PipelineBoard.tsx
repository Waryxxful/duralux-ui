import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import type * as React from 'react'
import { cx } from '../../../utils/cx'
import { log } from '../../../utils/log'
import { isArray, isFunction } from '../../../utils/typeGuards'
import type { PipelineBoardProps, PipelineDeal } from '../../../public/types'
import { Avatar } from '../../ui/Avatar'
import { DEAL_DRAG_TYPE, canMove, formatClp, moveDirection, neighborStage } from './crmModel'

interface DealCardProps {
  deal: PipelineDeal
  movable: boolean
  idle: boolean
  hintId: string
  currency: (value: number) => string
  register: (id: string, node: HTMLButtonElement | null) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, deal: PipelineDeal) => void
  onOpen?: (deal: PipelineDeal) => void
}

function DealCard({ deal, movable, idle, hintId, currency, register, onKeyDown, onOpen }: DealCardProps) {
  return (
    <button
      ref={(node) => register(deal.id, node)}
      type="button"
      className="gcu-deal"
      draggable={movable}
      aria-describedby={movable ? hintId : undefined}
      aria-keyshortcuts={movable ? 'Alt+ArrowLeft Alt+ArrowRight' : undefined}
      onDragStart={(event) => {
        event.dataTransfer.setData(DEAL_DRAG_TYPE, deal.id)
        event.dataTransfer.setData('text/plain', deal.title)
        event.dataTransfer.effectAllowed = 'move'
      }}
      onKeyDown={(event) => onKeyDown(event, deal)}
      onClick={() => onOpen?.(deal)}
    >
      <span className="gcu-deal__title">{deal.title}</span>
      <span className="gcu-deal__account">{deal.account}</span>
      <span className="gcu-deal__foot">
        <span className="gcu-deal__value gcu-tabular">{currency(deal.value)}</span>
        {idle && <span className="gcu-deal__idle gcu-tabular">{deal.idleDays} d sin actividad</span>}
        <Avatar name={deal.owner} size="sm" aria-label={`Responsable: ${deal.owner}`} />
      </span>
    </button>
  )
}

/**
 * PipelineBoard — oportunidades por etapa con total por columna (cantidad y monto).
 *
 * - Mover: arrastrar y soltar nativo o, con el foco en una tarjeta, Alt + ← / → a la etapa vecina.
 *   El foco sigue a la tarjeta y un aviso `aria-live` dice «… movida a Negociación».
 * - El tablero no cambia los datos: avisa `onMove(id, etapa)` y el consumidor actualiza `deals`.
 *   Sin `onMove` es de solo lectura (no arrastra ni mueve).
 * - Columnas con desplazamiento horizontal dentro del tablero, nunca de la página.
 * Estilos: src/styles/components/pipeline-board.css.
 */
export const PipelineBoard = /* @__PURE__ */ forwardRef<HTMLDivElement, PipelineBoardProps>(function PipelineBoard({
  stages,
  deals,
  onMove,
  onOpen,
  currency = formatClp,
  label = 'Pipeline de oportunidades',
  idleAfterDays = 7,
  className,
  ...rest
}, ref) {
  const stageList = isArray(stages) ? stages : []
  const dealList = isArray(deals) ? deals : []
  const movable = isFunction(onMove)
  const hintId = useId()
  const [over, setOver] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const cards = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocus = useRef<string | null>(null)

  // Tras mover con teclado la tarjeta se vuelve a montar en otra columna: el foco la sigue.
  useEffect(() => {
    const id = pendingFocus.current
    if (!id) return
    const card = cards.current.get(id)
    if (card) {
      card.focus()
      pendingFocus.current = null
    }
  }, [deals])

  const register = (id: string, node: HTMLButtonElement | null) => {
    if (node) cards.current.set(id, node)
    else cards.current.delete(id)
  }

  const move = (dealId: string, toStage: string) => {
    if (!movable || !canMove(dealList, stageList, dealId, toStage)) return false
    const deal = dealList.find((item) => item.id === dealId)
    const stage = stageList.find((item) => item.key === toStage)
    log.debug('PipelineBoard: mover oportunidad', dealId, deal?.stage, '→', toStage)
    onMove?.(dealId, toStage)
    setAnnouncement(`«${deal?.title ?? dealId}» movida a ${stage?.label ?? toStage}.`)
    return true
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, deal: PipelineDeal) => {
    const direction = moveDirection(event.key, event.altKey)
    if (!movable || !direction) return
    event.preventDefault()
    const target = neighborStage(stageList, deal.stage, direction)
    if (!target) {
      setAnnouncement(direction === 'next' ? 'Ya está en la última etapa.' : 'Ya está en la primera etapa.')
      return
    }
    pendingFocus.current = deal.id
    move(deal.id, target.key)
  }

  return (
    <div {...rest} ref={ref} className={cx('gcu-pipeline', className)}>
      {movable && (
        <p id={hintId} className="visually-hidden">Usa Alt y las flechas izquierda o derecha para mover la oportunidad de etapa.</p>
      )}
      <div className="gcu-pipeline__columns gcu-scroll" role="list" aria-label={label}>
        {stageList.map((stage) => {
          const list = dealList.filter((deal) => deal.stage === stage.key)
          const total = list.reduce((sum, deal) => sum + deal.value, 0)
          const headingId = `${hintId}-${stage.key}`
          return (
            <section
              key={stage.key}
              role="listitem"
              aria-labelledby={headingId}
              className={cx('gcu-pipeline__col', over === stage.key && 'gcu-pipeline__col--over')}
              onDragOver={(event) => {
                if (!movable || !event.dataTransfer.types.includes(DEAL_DRAG_TYPE)) return
                event.preventDefault()
                if (over !== stage.key) setOver(stage.key)
              }}
              // Pasar sobre una tarjeta hija también dispara dragleave: se limpia solo al salir de la columna.
              onDragLeave={(event) => {
                const next = event.relatedTarget
                if (!(next instanceof Node) || !event.currentTarget.contains(next)) setOver(null)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setOver(null)
                const id = event.dataTransfer.getData(DEAL_DRAG_TYPE)
                if (id) move(id, stage.key)
              }}
            >
              <header className="gcu-pipeline__head">
                <h3 id={headingId} className="gcu-pipeline__title">{stage.label}</h3>
                <span className="gcu-pipeline__total gcu-tabular">
                  {list.length} · {currency(total)}
                </span>
              </header>
              <div className="gcu-pipeline__cards">
                {list.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    movable={movable}
                    idle={(deal.idleDays ?? 0) >= idleAfterDays}
                    hintId={hintId}
                    currency={currency}
                    register={register}
                    onKeyDown={handleKeyDown}
                    onOpen={onOpen}
                  />
                ))}
                {list.length === 0 && (
                  <p className="gcu-pipeline__empty">{movable ? 'Sin oportunidades. Arrastra una aquí.' : 'Sin oportunidades en esta etapa.'}</p>
                )}
              </div>
            </section>
          )
        })}
      </div>
      <p className="visually-hidden" aria-live="polite" role="status">{announcement}</p>
    </div>
  )
})
