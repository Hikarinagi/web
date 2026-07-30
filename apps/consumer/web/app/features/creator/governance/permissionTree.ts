import type { TreeNode } from 'primevue/treenode'
import type { BackendPermissionCatalogEntry } from '~/features/creator/governance'

export interface PermissionTreeNode extends TreeNode {
  key: string
  label: string
  data: { key: string }
  children?: PermissionTreeNode[]
}

export function buildPermissionTree(
  entries: readonly BackendPermissionCatalogEntry[],
): PermissionTreeNode[] {
  const wikiEntries = entries.filter(e => e.key === 'wiki' || e.key.startsWith('wiki.'))
  const byKey = new Map<string, PermissionTreeNode>()
  for (const entry of wikiEntries) {
    byKey.set(entry.key, {
      key: entry.key,
      label: leafLabel(entry),
      data: { key: entry.key },
    })
  }
  const roots: PermissionTreeNode[] = []
  for (const entry of wikiEntries) {
    const dot = entry.key.lastIndexOf('.')
    if (dot < 0) {
      roots.push(byKey.get(entry.key)!)
      continue
    }
    const parentKey = entry.key.slice(0, dot)
    const parent = byKey.get(parentKey)
    if (parent) {
      ;(parent.children ??= []).push(byKey.get(entry.key)!)
    } else {
      roots.push(byKey.get(entry.key)!)
    }
  }
  return roots.find(r => r.key === 'wiki')?.children ?? roots
}

export function selectionRecordFromKeys(
  keys: readonly string[] | null | undefined,
  tree: readonly PermissionTreeNode[],
): Record<string, { checked: boolean; partialChecked: boolean }> {
  const selectedSet = new Set(Array.isArray(keys) ? keys : [])
  const record: Record<string, { checked: boolean; partialChecked: boolean }> = {}
  for (const node of walk(tree)) {
    if (!node.children || node.children.length === 0) {
      if (selectedSet.has(node.key)) record[node.key] = { checked: true, partialChecked: false }
    }
  }
  applyParentState(tree, record)
  return record
}

export function keysFromSelectionRecord(
  record: Record<string, { checked: boolean; partialChecked: boolean }>,
  tree: readonly PermissionTreeNode[],
): string[] {
  const out: string[] = []
  for (const node of walk(tree)) {
    if (!node.children || node.children.length === 0) {
      const state = record[node.key]
      if (state?.checked) out.push(node.key)
    }
  }
  return out.sort()
}

function leafLabel(entry: BackendPermissionCatalogEntry): string {
  const dot = entry.label.lastIndexOf(' · ')
  return dot < 0 ? entry.label : entry.label.slice(dot + 3)
}

function* walk(nodes: readonly PermissionTreeNode[]): Generator<PermissionTreeNode> {
  for (const node of nodes) {
    yield node
    if (node.children) yield* walk(node.children)
  }
}

function applyParentState(
  nodes: readonly PermissionTreeNode[],
  record: Record<string, { checked: boolean; partialChecked: boolean }>,
): { checked: number; total: number } {
  let checked = 0
  let total = 0
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const child = applyParentState(node.children, record)
      total += child.total
      checked += child.checked
      if (child.total > 0) {
        if (child.checked === child.total) {
          record[node.key] = { checked: true, partialChecked: false }
        } else if (child.checked > 0) {
          record[node.key] = { checked: false, partialChecked: true }
        }
      }
    } else {
      total += 1
      if (record[node.key]?.checked) checked += 1
    }
  }
  return { checked, total }
}
