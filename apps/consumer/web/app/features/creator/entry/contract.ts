import type { ComputedRef, InjectionKey } from 'vue'
import type { ApiData, components } from '@hikarinagi/api-contract/v3'

export type BackendEditableEntry = ApiData<'/api/v3/wiki/entries/{id}', 'get'>
export type BackendStatement = BackendEditableEntry['statements'][number]
export type BackendStatementCitation = BackendStatement['citations'][number]
export type BackendPropertyDefinition = components['schemas']['PropertyDefinitionDto']
export type BackendEntryProperty = BackendStatement['property']
export type BackendEditOperation = components['schemas']['EditOperationDto']
export type BackendEditCheck = ApiData<'/api/v3/wiki/edits/checks', 'post'>
export type BackendSource = ApiData<'/api/v3/wiki/sources', 'post'>
export type BackendEntrySearchItem = ApiData<'/api/v3/wiki/entries', 'get'>[number]

export const ENTRY_TYPE_NAMES: InjectionKey<ComputedRef<Record<string, string>>> =
  Symbol('entry-type-names')
export type BackendTodo = ApiData<'/api/v3/wiki/todos', 'get'>['items'][number]
export type BackendEntryType = BackendEntrySearchItem['type']
export type BackendMergePreview = ApiData<'/api/v3/wiki/entries/{id}/merge-preview', 'get'>
export type BackendEntryReferenceGroup = ApiData<
  '/api/v3/wiki/entries/{id}/references',
  'get'
>[number]
export type BackendHistoryRow = ApiData<'/api/v3/galgames/{id}/history', 'get'>['items'][number]
export type BackendEntryDraft = ApiData<'/api/v3/wiki/entries/drafts', 'post'>
export type BackendEntryLookup = ApiData<'/api/v3/wiki/entries/lookups', 'post'>
export type BackendEntryDefinition = ApiData<'/api/v3/wiki/definitions', 'get'>[number]
export const ENTRY_VERSIONS: InjectionKey<ComputedRef<{ id: number; label: string }[]>> =
  Symbol('entry-versions')
