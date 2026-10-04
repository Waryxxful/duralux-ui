import { forwardRef } from 'react'
import type * as React from 'react'
import { Table } from './Table'
import { deprecate } from '../../utils/log'
import type { ResponsiveTableProps } from '../../public/types'

/**
 * @deprecated Usa `Table`: ya es dueña del contenedor con scroll horizontal. Este alias se
 * conserva para que los consumidores existentes no aniden un segundo `.table-responsive`.
 */
const ResponsiveTableBase = /* @__PURE__ */ forwardRef<HTMLTableElement, ResponsiveTableProps<unknown>>(function ResponsiveTable(props, ref) {
  deprecate('responsive-table', '`ResponsiveTable` es un alias de `Table`, que ya incluye el contenedor con scroll; usa `Table`.')
  return <Table {...props} ref={ref} />
})

type ResponsiveTableComponent = (<T = unknown>(
  props: ResponsiveTableProps<T> & React.RefAttributes<HTMLTableElement>,
) => React.ReactElement | null) & { displayName?: string }

export const ResponsiveTable =
  // SAFETY: forwardRef borra el genérico T; el alias reenvía las props sin leerlas.
  ResponsiveTableBase as ResponsiveTableComponent
