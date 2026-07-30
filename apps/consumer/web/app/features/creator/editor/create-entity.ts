import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
import type { BackendEntitySummary } from '~/features/creator/editor'

export type CreatableResourceType = 'TAG' | 'PERSON' | 'PRODUCER' | 'CHARACTER'

interface CreateEntityInput {
  resource_type: CreatableResourceType
  label: string
  name: string
  external?: { bangumi_id?: string; vndb_id?: string }
  country?: string
}

export async function createProvisionalEntity(
  input: CreateEntityInput,
): Promise<BackendEntitySummary | null> {
  const changeset: Record<string, unknown>[] = [
    { kind: 'scalar', field: 'name', from: null, to: input.name },
  ]
  if (input.external?.bangumi_id) {
    changeset.push({
      kind: 'scalar',
      field: 'bangumi_id',
      from: null,
      to: input.external.bangumi_id,
    })
  }
  if (input.external?.vndb_id) {
    changeset.push({ kind: 'scalar', field: 'vndb_id', from: null, to: input.external.vndb_id })
  }
  if (input.country) {
    changeset.push({ kind: 'scalar', field: 'country', from: null, to: input.country })
  }
  const result = (await hikariRequest('/api/v3/change-requests', {
    method: 'POST',
    body: {
      resource_type: input.resource_type,
      summary: `新建${input.label}:${input.name}`,
      changeset,
    },
  })) as BackendChangeRequestDetail
  if (result.resource_id == null) return null
  return {
    id: result.resource_id,
    name: result.resource?.title ?? input.name,
    cover: result.resource?.cover ?? null,
    status: result.status === 'MERGED' ? 'PUBLISHED' : 'PENDING',
  }
}

export async function importProvisionalEntity(input: {
  type: 'person' | 'character' | 'producer'
  external: { bangumi_id?: string; vndb_id?: string }
}): Promise<BackendEntitySummary | null> {
  const { bangumi_id, vndb_id } = input.external
  if (!bangumi_id && !vndb_id) return null
  const key = `${input.type}|${bangumi_id ?? ''}|${vndb_id ?? ''}`
  let inflight = importInflight.get(key)
  if (!inflight) {
    inflight = hikariRequest('/api/v3/entity-import', {
      method: 'POST',
      body: { type: input.type, bangumi_id, vndb_id },
    })
      .then(result => ({
        id: result.id,
        name: result.name,
        cover: result.cover,
        status: result.status === 'PUBLISHED' ? ('PUBLISHED' as const) : ('PENDING' as const),
      }))
      .finally(() => importInflight.delete(key))
    importInflight.set(key, inflight)
  }
  return inflight
}

const importInflight = new Map<string, Promise<BackendEntitySummary>>()
