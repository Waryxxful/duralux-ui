import { Input, Transfer as AntdTransfer, Tree } from 'antd'
import type { TransferProps as AntdTransferProps, TreeDataNode, TreeProps } from 'antd'
import type * as React from 'react'
import { useMemo, useState } from 'react'
import { log } from '../utils/log'
import { isString } from '../utils/typeGuards'

// ── Transfer ────────────────────────────────────────────────────────────────

export interface TransferItem {
  key: string
  title: string
  description?: string
  disabled?: boolean
}

export type TransferProps<T extends TransferItem = TransferItem> = AntdTransferProps<T>

const TRANSFER_LOCALE = {
  searchPlaceholder: 'Buscar…',
  itemUnit: 'elemento',
  itemsUnit: 'elementos',
  notFoundContent: 'Sin resultados',
}

/** Transfer con búsqueda, títulos «Disponibles» / «Seleccionados» y textos en español. */
export function Transfer<T extends TransferItem = TransferItem>({
  showSearch = true,
  titles = ['Disponibles', 'Seleccionados'],
  render = (item: T) => item.title,
  locale,
  ...props
}: TransferProps<T>) {
  return <AntdTransfer<T> showSearch={showSearch} titles={titles} render={render} locale={{ ...TRANSFER_LOCALE, ...locale }} {...props} />
}

// ── CheckTree ───────────────────────────────────────────────────────────────

export interface CheckTreeProps extends Omit<TreeProps, 'checkable'> {
  /** Muestra un buscador que resalta coincidencias y expande sus ramas. */
  searchable?: boolean
  searchPlaceholder?: string
}

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Claves de los ancestros de cada nodo cuyo título (texto) contiene la búsqueda. */
function ancestorsOfMatches(nodes: readonly TreeDataNode[], query: string, parents: React.Key[] = [], into = new Set<React.Key>()) {
  for (const node of nodes) {
    if (isString(node.title) && normalize(node.title).includes(query)) parents.forEach(key => into.add(key))
    if (node.children?.length) ancestorsOfMatches(node.children, query, [...parents, node.key], into)
  }
  return into
}

/** Árbol con casillas (permisos jerárquicos). Búsqueda opcional con `searchable`. */
export function CheckTree({ searchable = false, searchPlaceholder = 'Buscar…', treeData, expandedKeys, onExpand, defaultExpandedKeys, ...props }: CheckTreeProps) {
  const [query, setQuery] = useState('')
  const [ownExpanded, setOwnExpanded] = useState<React.Key[]>(defaultExpandedKeys ?? [])
  const needle = normalize(query.trim())
  const hasMatch = useMemo(() => !needle || hasDirectMatch(treeData ?? [], needle), [treeData, needle])

  if (searchable && !treeData) log.warn('CheckTree: `searchable` solo filtra con `treeData`; con hijos JSX no busca.')

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    setQuery(next)
    const nextNeedle = normalize(next.trim())
    if (nextNeedle) setOwnExpanded([...ancestorsOfMatches(treeData ?? [], nextNeedle)])
  }

  const tree = (
    <Tree
      {...props}
      checkable
      treeData={treeData}
      expandedKeys={expandedKeys ?? ownExpanded}
      autoExpandParent={needle ? true : props.autoExpandParent}
      onExpand={(keys, info) => {
        setOwnExpanded(keys)
        onExpand?.(keys, info)
      }}
      filterTreeNode={needle ? node => isString(node.title) && normalize(node.title).includes(needle) : props.filterTreeNode}
    />
  )
  if (!searchable) return tree
  return (
    <div>
      <Input.Search allowClear placeholder={searchPlaceholder} aria-label={searchPlaceholder} value={query} onChange={handleSearch} style={{ marginBottom: 'var(--gcu-space-2)' }} />
      {hasMatch ? null : <p className="text-muted fs-12 mb-2" role="status">Sin coincidencias</p>}
      {tree}
    </div>
  )
}

function hasDirectMatch(nodes: readonly TreeDataNode[], needle: string): boolean {
  return nodes.some(node => (isString(node.title) && normalize(node.title).includes(needle)) || hasDirectMatch(node.children ?? [], needle))
}
