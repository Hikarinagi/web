import type { InjectionKey } from 'vue'
import type { BackendEditorSchema } from '~/features/creator/editor'
import type { Changeset } from '~/features/creator/editor/changeset'
import type { RosterHintEntry } from '~/features/creator/editor/sync'
import { getFieldErrors } from '~/utils/api/error'

export type WorkspaceEntityTarget = 'person' | 'producer' | 'character'

export interface WorkspaceMember {
  target: WorkspaceEntityTarget
  id: number
  name: string
  cover: string | null
  changeset: Changeset
  needsReview: boolean
  openChangeRequestId: number | null
}

export const ENTITY_RESOURCE_TYPE: Record<
  WorkspaceEntityTarget,
  'PERSON' | 'PRODUCER' | 'CHARACTER'
> = {
  person: 'PERSON',
  producer: 'PRODUCER',
  character: 'CHARACTER',
}

export function useWorkspaceSession(params: {
  enabled: boolean
  work: {
    resourceType: BackendEditorSchema['resource_type']
    resourceId: number | null
    openChangeRequestId: number | null
  }
}) {
  const enabled = params.enabled
  const workAdopted = params.work.openChangeRequestId != null
  const members = ref(new Map<string, WorkspaceMember>())
  const editing = ref<{ target: WorkspaceEntityTarget; id: number } | null>(null)
  const dialogOpen = ref(false)
  const workChangeset = ref<Changeset>([])
  const workNeedsReview = ref(false)
  const submitting = ref(false)
  const itemErrors = ref<Record<string, string>>({})
  const rosterHints = ref(new Map<string, { bangumi_id?: string; vndb_id?: string }>())
  const rosterLoader = ref<(() => Promise<void>) | null>(null)
  let rosterLoad: Promise<void> | null = null

  function setRosterLoader(loader: () => Promise<void>) {
    rosterLoader.value = loader
  }

  function ensureRosterHints(): Promise<void> {
    const loader = rosterLoader.value
    if (!loader) return Promise.resolve()
    rosterLoad ??= loader().catch(() => {
      rosterLoad = null
    })
    return rosterLoad
  }

  const confirm = useConfirm()
  onBeforeRouteLeave(() => {
    if (members.value.size === 0 || submitting.value) return true
    return new Promise<boolean>(resolve => {
      confirm.require({
        group: 'app-shell',
        header: '离开编辑器',
        message: `还有 ${members.value.size} 个条目的暂存修改未提交，离开将全部丢弃。`,
        acceptLabel: '离开并丢弃',
        rejectLabel: '留在此页',
        closeOnEscape: false,
        accept: () => resolve(true),
        reject: () => resolve(false),
      })
    })
  })

  const memberList = computed(() => [...members.value.values()])

  function keyOf(target: WorkspaceEntityTarget, id: number) {
    return `${target}:${id}`
  }

  function memberFor(target: string, id: number): WorkspaceMember | null {
    return members.value.get(keyOf(target as WorkspaceEntityTarget, id)) ?? null
  }

  function stage(member: WorkspaceMember) {
    const next = new Map(members.value)
    if (member.changeset.length === 0) next.delete(keyOf(member.target, member.id))
    else next.set(keyOf(member.target, member.id), member)
    members.value = next
  }

  function discard(target: WorkspaceEntityTarget, id: number) {
    const next = new Map(members.value)
    next.delete(keyOf(target, id))
    members.value = next
  }

  function open(target: WorkspaceEntityTarget, id: number) {
    editing.value = { target, id }
  }

  function addRosterHints(entries: RosterHintEntry[]) {
    const next = new Map(rosterHints.value)
    for (const entry of entries) {
      if (entry.id == null || (!entry.external.bangumi_id && !entry.external.vndb_id)) continue
      next.set(keyOf(entry.target, entry.id), entry.external)
    }
    rosterHints.value = next
  }

  function close() {
    editing.value = null
  }

  function review(changeset: Changeset, needsReview: boolean): boolean {
    if (!enabled || members.value.size === 0) return false
    workChangeset.value = changeset
    workNeedsReview.value = needsReview
    itemErrors.value = {}
    dialogOpen.value = true
    return true
  }

  async function submit(summary: string) {
    if (submitting.value) return
    submitting.value = true
    const sectionKeys: string[] = []
    try {
      const items: {
        resource_type: BackendEditorSchema['resource_type']
        resource_id: number
        change_request_id?: number
        changeset: Record<string, unknown>[]
      }[] = []
      if (workChangeset.value.length > 0 && params.work.resourceId != null) {
        items.push({
          resource_type: params.work.resourceType,
          resource_id: params.work.resourceId,
          changeset: workChangeset.value as unknown as Record<string, unknown>[],
          ...(params.work.openChangeRequestId != null
            ? { change_request_id: params.work.openChangeRequestId }
            : {}),
        })
        sectionKeys.push('work')
      }
      for (const member of members.value.values()) {
        items.push({
          resource_type: ENTITY_RESOURCE_TYPE[member.target],
          resource_id: member.id,
          changeset: member.changeset as unknown as Record<string, unknown>[],
          ...(member.openChangeRequestId != null
            ? { change_request_id: member.openChangeRequestId }
            : {}),
        })
        sectionKeys.push(keyOf(member.target, member.id))
      }
      const result = await hikariRequest('/api/v3/change-requests/batches', {
        method: 'POST',
        body: { summary: summary.trim(), items },
      })
      const primary =
        result.items.find(
          item =>
            item.resource_type === params.work.resourceType &&
            item.resource_id === params.work.resourceId,
        ) ?? result.items[0]
      members.value = new Map()
      workChangeset.value = []
      await navigateTo(`/create/contributions/${primary?.id}`)
    } catch (error) {
      const mapped: Record<string, string> = {}
      for (const [field, message] of Object.entries(getFieldErrors(error))) {
        const match = /^items\.(\d+)$/.exec(field)
        const key = match ? sectionKeys[Number(match[1])] : undefined
        if (key) mapped[key] = message
      }
      itemErrors.value = mapped
      throw error
    } finally {
      submitting.value = false
    }
  }

  return {
    enabled,
    workAdopted,
    members,
    memberList,
    editing,
    dialogOpen,
    workChangeset,
    workNeedsReview,
    submitting,
    itemErrors,
    rosterHints,
    setRosterLoader,
    ensureRosterHints,
    memberFor,
    stage,
    discard,
    open,
    close,
    addRosterHints,
    review,
    submit,
  }
}

export type WorkspaceSession = ReturnType<typeof useWorkspaceSession>

export const WORKSPACE_SESSION_KEY: InjectionKey<WorkspaceSession> = Symbol(
  'hikari-workspace-session',
)
