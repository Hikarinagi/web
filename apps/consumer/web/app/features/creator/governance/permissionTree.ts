import type { TreeNode, TreeValue } from '@hina-ui/vue'
import type { BackendPermissionCatalogEntry } from '~/features/creator/governance'

export function buildPermissionTree(entries: readonly BackendPermissionCatalogEntry[]): TreeNode[] {
  const wikiEntries = entries.filter(e => e.key === 'wiki' || e.key.startsWith('wiki.'))
  const byKey = new Map<string, TreeNode>()
  for (const entry of wikiEntries) {
    byKey.set(entry.key, { value: entry.key, label: leafLabel(entry) })
  }
  const roots: TreeNode[] = []
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
  return roots.find(r => r.value === 'wiki')?.children ?? roots
}

export function permissionLeafKeys(tree: readonly TreeNode[]): Set<string> {
  const out = new Set<string>()
  for (const node of walk(tree)) {
    if (!node.children?.length) out.add(String(node.value))
  }
  return out
}

export function expandedForKeys(tree: readonly TreeNode[], keys: readonly string[]): TreeValue[] {
  const selected = new Set(keys)
  const out: TreeValue[] = []
  collectAncestors(tree, selected, [], out)
  return out
}

function collectAncestors(
  nodes: readonly TreeNode[],
  selected: ReadonlySet<string>,
  ancestors: TreeValue[],
  into: TreeValue[],
) {
  for (const node of nodes) {
    if (node.children?.length) {
      collectAncestors(node.children, selected, [...ancestors, node.value], into)
    } else if (selected.has(String(node.value))) {
      for (const key of ancestors) {
        if (!into.includes(key)) into.push(key)
      }
    }
  }
}

function leafLabel(entry: BackendPermissionCatalogEntry): string {
  const dot = entry.label.lastIndexOf(' · ')
  return dot < 0 ? entry.label : entry.label.slice(dot + 3)
}

function* walk(nodes: readonly TreeNode[]): Generator<TreeNode> {
  for (const node of nodes) {
    yield node
    if (node.children) yield* walk(node.children)
  }
}
