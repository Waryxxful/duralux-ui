import { isValidElement } from 'react'
import type * as React from 'react'
import { readProperty, safeString, warnOnce } from '../tableModel'
import { isFiniteNumber, isFunction, isNonEmptyString, isObject, isString } from '../../../utils/typeGuards'
import type { DataTableAction } from '../../../public/types'
import type { WarningsRef } from './dataTableModel'

/** Acción de fila validada: siempre con callback y con un nombre accesible. */
export interface NormalizedRowAction<T> {
  index: number
  onClick: (row: T) => void
  icon: string
  variant: 'icon' | 'button'
  buttonVariant: string
  accessibleLabel: string
  visibleLabel: React.ReactNode
}

function normalizeActionLabel(value: React.ReactNode, fallback: string) {
  if (isString(value) || isFiniteNumber(value)) {
    const label = safeString(value).trim()
    if (label) return { accessibleLabel: label, visibleLabel: label }
  }
  if (isValidElement(value)) return { accessibleLabel: fallback, visibleLabel: value }
  return { accessibleLabel: fallback, visibleLabel: fallback }
}

/** Valida una acción pública; las inválidas se omiten con un aviso (una vez por acción). */
export function normalizeAction<T extends object>(
  action: DataTableAction<T> | null | undefined,
  index: number,
  warningsRef: WarningsRef,
): NormalizedRowAction<T> | null {
  if (action === null || (!isObject(action) && !isFunction(action))) {
    warnOnce(warningsRef, `action-invalid-${index}`, `DataTable: la acción ${index + 1} no es válida y se omitirá.`)
    return null
  }

  const onClick = readProperty(action, 'onClick')
  if (!isFunction<typeof onClick, (row: T) => void>(onClick)) {
    warnOnce(
      warningsRef,
      `action-callback-${index}`,
      `DataTable: la acción ${index + 1} no tiene un callback onClick y se omitirá.`,
    )
    return null
  }

  const { accessibleLabel, visibleLabel } = normalizeActionLabel(readProperty(action, 'label'), `Acción ${index + 1}`)
  const iconValue = readProperty(action, 'icon')
  const icon = isNonEmptyString(iconValue) ? iconValue.trim() : ''
  const requestedVariant = readProperty(action, 'variant') === 'button' ? 'button' : 'icon'
  const buttonVariantValue = readProperty(action, 'buttonVariant')
  const buttonVariant = isString(buttonVariantValue) && /^[A-Za-z0-9_-]+$/.test(buttonVariantValue.trim())
    ? buttonVariantValue.trim()
    : 'light-brand'

  return {
    index,
    onClick,
    icon,
    variant: requestedVariant === 'icon' && !icon ? 'button' : requestedVariant,
    buttonVariant,
    accessibleLabel,
    visibleLabel,
  }
}

interface RowActionButtonProps<T> {
  action: NormalizedRowAction<T>
  row: T
}

/** Botón de acción de fila: solo ícono (con nombre accesible y title) o botón con texto. */
export function RowActionButton<T>({ action, row }: RowActionButtonProps<T>) {
  if (action.variant === 'button') {
    return (
      <button
        type="button"
        className={`btn btn-sm btn-${action.buttonVariant}`}
        aria-label={action.accessibleLabel}
        onClick={() => action.onClick(row)}
      >
        {action.icon ? <i className={`${action.icon} me-1`} aria-hidden="true" /> : null}
        {action.visibleLabel}
      </button>
    )
  }

  return (
    <button
      type="button"
      className="btn btn-icon btn-light-brand btn-sm"
      title={action.accessibleLabel}
      aria-label={action.accessibleLabel}
      onClick={() => action.onClick(row)}
    >
      <i className={action.icon} aria-hidden="true" />
    </button>
  )
}
