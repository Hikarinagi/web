import {
  ENTITY_RESOURCE_TYPE,
  type WorkspaceEntityTarget,
} from '~/features/creator/composables/useWorkspaceSession'
import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
import type { BackendEditorRef, BackendEditorSchema } from '~/features/creator/editor'

export interface EntityDrawerData {
  schema: BackendEditorSchema
  snapshot: Record<string, unknown>
  refs: Record<string, BackendEditorRef>
  resource: { title: string; cover: string | null } | null
  openCr: BackendChangeRequestDetail | null
}

export function useEntityDrawer(
  editing: () => { target: WorkspaceEntityTarget; id: number } | null,
) {
  const auth = useAuthStore()
  const loading = ref(false)
  const failed = ref(false)
  const data = ref<EntityDrawerData | null>(null)

  const mineCr = computed(() => {
    const open = data.value?.openCr
    return open && open.author.id === auth.user?.id ? open : null
  })
  const blocked = computed(() => !!data.value?.openCr && !mineCr.value)

  watch(editing, async current => {
    if (!current) return
    data.value = null
    failed.value = false
    loading.value = true
    try {
      const [schema, snapshot, openList] = await Promise.all([
        hikariRequest('/api/v3/contribution/schemas/{resource_type}', {
          path: { resource_type: current.target },
        }),
        hikariRequest('/api/v3/contribution/snapshots/{resource_type}/{id}', {
          path: { resource_type: current.target, id: current.id },
        }),
        hikariRequest('/api/v3/change-requests', {
          query: {
            resource_type: ENTITY_RESOURCE_TYPE[current.target],
            resource_id: current.id,
            status: 'PENDING',
            page: 1,
            page_size: 1,
          },
        }),
      ])
      const openId = openList.items[0]?.id ?? null
      const openCr = openId
        ? await hikariRequest('/api/v3/change-requests/{id}', { path: { id: openId } })
        : null
      if (editing() !== current) return
      data.value = {
        schema,
        snapshot: snapshot.snapshot as Record<string, unknown>,
        refs: (snapshot.refs ?? {}) as Record<string, BackendEditorRef>,
        resource: snapshot.resource,
        openCr,
      }
    } catch {
      if (editing() === current) failed.value = true
    } finally {
      if (editing() === current) loading.value = false
    }
  })

  return { loading, failed, data, mineCr, blocked }
}
