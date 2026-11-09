import { galgameCast, seriesCast, type Appearance, type CastMember } from './appearances'

function requestCast(work: Appearance) {
  const path = { id: work.id }
  if (work.kind === 'galgame')
    return hikariRequest('/api/v3/galgames/{id}/characters', { path }).then(galgameCast)
  if (work.kind === 'light-novel')
    return hikariRequest('/api/v3/light-novels/{id}/characters', { path }).then(seriesCast)
  return hikariRequest('/api/v3/mangas/{id}/characters', { path }).then(seriesCast)
}

export function useCast(seed: CastMember[], work: Ref<Appearance | null>) {
  const known = new Map<string, CastMember[]>()
  if (work.value) known.set(work.value.key, seed)
  const cast = shallowRef(seed)

  watch(work, async next => {
    if (!next) return
    const cached = known.get(next.key)
    if (cached) {
      cast.value = cached
      return
    }
    const members = await requestCast(next).catch(() => null)
    if (!members) return
    known.set(next.key, members)
    if (work.value?.key === next.key) cast.value = members
  })

  return cast
}
