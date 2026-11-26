import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { ComputedRef, InjectionKey } from 'vue'
import type { ReferenceGroup } from '../references'

export interface EntryPage {
  history: ComputedRef<ApiData<'/api/v3/wiki/changes', 'get'>['items']>
  references: ComputedRef<ReferenceGroup[]>
  watched: ComputedRef<boolean>
  refresh: () => void
}

export const ENTRY_PAGE: InjectionKey<EntryPage> = Symbol('wiki-entry-page')
