import {
  ENTITY_RESOURCE_TYPE,
  type WorkspaceEntityTarget,
  type WorkspaceSession,
} from '~/features/creator/composables/useWorkspaceSession'
import type { BackendEditorSchema } from '~/features/creator/editor'
import { needsReviewFor, type Changeset } from '~/features/creator/editor/changeset'
import { EDITOR_PRESENTATIONS } from '~/features/creator/editor/presentation'
import type { EditorRelationRow } from '~/features/creator/editor/relation'
import {
  MEDIA_FIELD,
  buildFillEmptyOps,
  collectBackfillMembers,
  type SyncRoster,
} from '~/features/creator/editor/sync'

export interface BackfillField {
  field: string
  label: string
  checked: boolean
  op?: Record<string, unknown>
  coverUrl?: string
}

export interface BackfillItem {
  target: WorkspaceEntityTarget
  id: number
  name: string
  cover: string | null
  pairName: string | null
  externals: { bangumi_id?: string; vndb_id?: string }
  status: 'loading' | 'ready' | 'nothing' | 'blocked' | 'error' | 'staged'
  fields: BackfillField[]
}

const schemaCache = new Map<string, Promise<BackendEditorSchema>>()
function schemaFor(target: WorkspaceEntityTarget): Promise<BackendEditorSchema> {
  let cached = schemaCache.get(target)
  if (!cached) {
    cached = hikariRequest('/api/v3/contribution/schemas/{resource_type}', {
      path: { resource_type: target },
    }).catch(error => {
      schemaCache.delete(target)
      throw error
    })
    schemaCache.set(target, cached)
  }
  return cached
}

export function useEntityBackfill(params: {
  roster: () => SyncRoster | null
  relations: () => Record<string, EditorRelationRow[]>
  session: WorkspaceSession
}) {
  const auth = useAuthStore()
  const { can } = useCreatorPermissions()
  const items = ref<BackfillItem[]>([])
  const discovering = ref(false)

  const keyOf = (target: WorkspaceEntityTarget, id: number) => `${target}:${id}`
  function toItem(member: ReturnType<typeof collectBackfillMembers>[number]): BackfillItem {
    return {
      target: member.target,
      id: member.id,
      name: member.name,
      cover: member.cover,
      pairName: member.sourceNames.find(name => name !== member.name) ?? null,
      externals: member.externals,
      status: 'loading',
      fields: [],
    }
  }

  const started = ref(false)
  let round = 0
  function start() {
    if (started.value) return
    started.value = true
    items.value = collectBackfillMembers(params.roster(), params.relations()).map(toItem)
    if (items.value.length) void discover()
  }

  watch(
    () => params.roster(),
    roster => {
      if (!started.value) return
      items.value = collectBackfillMembers(roster, params.relations()).map(toItem)
      if (items.value.length) void discover()
    },
  )

  watch(
    () => params.relations(),
    () => {
      if (!started.value) return
      const wanted = collectBackfillMembers(params.roster(), params.relations())
      const wantedKeys = new Set(wanted.map(member => keyOf(member.target, member.id)))
      const kept = items.value.filter(item => wantedKeys.has(keyOf(item.target, item.id)))
      const haveKeys = new Set(kept.map(item => keyOf(item.target, item.id)))
      const added = wanted
        .filter(member => !haveKeys.has(keyOf(member.target, member.id)))
        .map(toItem)
      if (added.length || kept.length !== items.value.length) {
        items.value = [...kept, ...added]
        if (added.length) void discover()
      }
    },
    { deep: true },
  )

  watch(
    () => params.session.members.value,
    () => {
      if (!started.value) return
      for (const item of items.value) {
        if (item.status === 'staged' && !params.session.memberFor(item.target, item.id)) {
          item.status = 'loading'
          void inspect(item)
        }
      }
    },
  )

  async function inspect(item: BackfillItem) {
    try {
      const [schema, snapshot, openList] = await Promise.all([
        schemaFor(item.target),
        hikariRequest('/api/v3/contribution/snapshots/{resource_type}/{id}', {
          path: { resource_type: item.target, id: item.id },
        }),
        hikariRequest('/api/v3/change-requests', {
          query: {
            resource_type: ENTITY_RESOURCE_TYPE[item.target],
            resource_id: item.id,
            status: 'PENDING',
            page: 1,
            page_size: 1,
          },
        }),
      ])
      const openCr = openList.items[0] ?? null
      if (openCr && openCr.author.id !== auth.user?.id) {
        item.status = 'blocked'
        return
      }
      const values = snapshot.snapshot as Record<string, unknown>
      const draft = await hikariRequest('/api/v3/external-source/entity-draft', {
        query: { type: item.target, ...item.externals },
      })
      const labels = EDITOR_PRESENTATIONS[item.target]?.fields ?? {}
      const staged = (params.session.memberFor(item.target, item.id)?.changeset ??
        []) as unknown as Record<string, unknown>[]
      const fields: BackfillField[] = buildFillEmptyOps(
        draft.draft,
        draft.field_sources,
        values,
        schema.fields,
      )
        .filter(op => !staged.some(sop => sop.kind === 'scalar' && sop.field === op.field))
        .map(op => ({
          field: op.field as string,
          label: labels[op.field as string]?.label ?? (op.field as string),
          checked: true,
          op,
        }))
      const mediaField = MEDIA_FIELD[item.target]
      if (
        mediaField &&
        draft.cover &&
        values[mediaField] == null &&
        !staged.some(sop => sop.field === mediaField)
      ) {
        fields.push({
          field: mediaField,
          label: labels[mediaField]?.label ?? '图片',
          checked: true,
          coverUrl: draft.cover,
        })
      }
      item.fields = fields
      item.status = fields.length ? 'ready' : 'nothing'
    } catch {
      item.status = 'error'
    }
  }

  async function discover() {
    const mine = ++round
    discovering.value = true
    try {
      const queue = items.value.filter(item => item.status === 'loading')
      const worker = async () => {
        for (;;) {
          const item = queue.shift()
          if (!item || mine !== round) return
          await inspect(item)
        }
      }
      await Promise.all(Array.from({ length: 3 }, () => worker()))
    } finally {
      if (mine === round) discovering.value = false
    }
  }

  async function apply(item: BackfillItem): Promise<boolean> {
    const picked = item.fields.filter(field => field.checked)
    if (!picked.length || item.status !== 'ready') return true
    try {
      const ops: Record<string, unknown>[] = []
      const stuck: BackfillField[] = []
      for (const field of picked) {
        if (field.coverUrl) {
          const media = await hikariRequest('/api/v3/external-source/cover-media', {
            method: 'POST',
            body: { url: field.coverUrl },
          }).catch(() => null)
          if (media) {
            ops.push({
              kind: 'scalar',
              field: field.field,
              value_type: 'media',
              from: null,
              to: { id: media.id, src: media.src },
            })
          } else {
            stuck.push(field)
          }
          continue
        }
        if (field.op) ops.push(field.op)
      }
      if (ops.length) {
        const existing = params.session.memberFor(item.target, item.id)
        const merged = [...((existing?.changeset ?? []) as unknown as Record<string, unknown>[])]
        for (const op of ops) {
          const index = merged.findIndex(e => e.kind === op.kind && e.field === op.field)
          if (index >= 0) merged[index] = op
          else merged.push(op)
        }
        const schema = await schemaFor(item.target)
        params.session.stage({
          target: item.target,
          id: item.id,
          name: existing?.name || item.name,
          cover: existing?.cover ?? null,
          changeset: merged as never,
          needsReview: needsReviewFor(merged as unknown as Changeset, schema.fields, can),
          openChangeRequestId: existing?.openChangeRequestId ?? null,
        })
      }
      if (stuck.length) {
        item.fields = stuck
        return false
      }
      item.status = 'staged'
      return true
    } catch {
      item.status = 'error'
      return false
    }
  }

  return { items, discovering, started, start, apply }
}
