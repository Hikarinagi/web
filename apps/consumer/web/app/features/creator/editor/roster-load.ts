import type { ExternalIds, SyncRoster } from './sync'

export async function loadWorkRoster(
  resourceType: string,
  ids: ExternalIds,
): Promise<SyncRoster | null> {
  if (resourceType === 'galgame') {
    const r = await hikariRequest('/api/v3/external-source/galgame-draft', { query: ids })
    return {
      kind: 'galgame',
      galgame: { producers: r.producers, staff: r.staff, characters: r.characters, tags: r.tags },
    }
  }
  if (resourceType === 'light-novel' && ids.bangumi_id) {
    const r = await hikariRequest('/api/v3/external-source/light-novel-draft', {
      query: { bangumi_id: ids.bangumi_id },
    })
    return {
      kind: 'light-novel',
      ln: {
        author: r.author,
        illustrators: r.illustrators,
        publishers: r.publishers,
        characters: r.characters,
      },
    }
  }
  return null
}
