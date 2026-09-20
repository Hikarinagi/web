import type { FormInstance } from '@primevue/forms/form'
import type { Ref } from 'vue'
import type { WorkspaceSession } from '~/features/creator/composables/useWorkspaceSession'
import { loadWorkRoster } from '~/features/creator/editor/roster-load'
import { readExternalIds, rosterHintEntries } from '~/features/creator/editor/sync'

export function useWorkRosterLoader(
  session: WorkspaceSession,
  formEl: Ref<FormInstance | undefined>,
  resourceType: string,
) {
  session.setRosterLoader(async () => {
    const states = formEl.value?.states ?? {}
    const values = Object.fromEntries(
      Object.entries(states).map(([key, state]) => [key, (state as { value?: unknown })?.value]),
    )
    const ids = readExternalIds(resourceType, values)
    if (!ids) return
    const roster = await loadWorkRoster(resourceType, ids)
    if (roster) session.addRosterHints(rosterHintEntries(roster))
  })
}
