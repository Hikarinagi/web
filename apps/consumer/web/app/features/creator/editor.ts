import type { ApiData, components } from '@hikarinagi/api-contract/v3'

export type BackendEditorSchema = ApiData<'/api/v3/contribution/schemas/{resource_type}', 'get'>
export type BackendEditorField = BackendEditorSchema['fields'][number]
export type BackendEntitySummary = ApiData<'/api/v3/tags', 'get'>['items'][number]

export type BackendEditorRef = components['schemas']['EntityRefSummaryDto'] | null
export type BackendGalgameEditionRow = components['schemas']['GalgameEditionRowDto']
export type BackendBookVariantRow = components['schemas']['BookVariantRowDto']
export type BackendGalgameExternalLinkRow = components['schemas']['GalgameExternalLinkDto']
