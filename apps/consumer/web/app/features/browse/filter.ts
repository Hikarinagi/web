import type { ComputedRef, InjectionKey } from 'vue'

export type TagFilterOp = 'include' | 'exclude'
export type TagMatchMode = 'and' | 'or'

export interface TagFilterGroup {
  op: TagFilterOp
  match: TagMatchMode
  tag_ids: number[]
}

export interface BrowseChip {
  key: string
  label: string
  remove: () => void
}

export interface BrowseFilterRecall {
  remember(kind: string, entities: { id: number; name: string }[]): void
  entityLabel(kind: string, id: number): string | undefined
  chips: ComputedRef<BrowseChip[]>
  count: ComputedRef<number>
  clear(): void
}

export const BROWSE_FILTER_RECALL_KEY: InjectionKey<BrowseFilterRecall> =
  Symbol('browse-filter-recall')
