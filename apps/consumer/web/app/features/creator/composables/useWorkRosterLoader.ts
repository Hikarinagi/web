import type { WorkspaceSession } from '~/features/creator/composables/useWorkspaceSession'
import { loadWorkRoster } from '~/features/creator/editor/roster-load'
import { readExternalIds, rosterHintEntries } from '~/features/creator/editor/sync'

export function useWorkRosterLoader(
  session: WorkspaceSession,
  values: Record<string, unknown>,
  resourceType: string,
) {
  session.setRosterLoader(async () => {
    const ids = readExternalIds(resourceType, values)
    if (!ids) return
    const roster = await loadWorkRoster(resourceType, ids)
    if (roster) session.addRosterHints(rosterHintEntries(roster))
  })
}
