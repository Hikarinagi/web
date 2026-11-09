import type { WorkTag, WorkTagResource } from '~/features/entry/tags'

type MinePath = '/api/v3/galgames/{id}/tags/mine'
type VotePath = '/api/v3/galgames/{id}/tags/{tag_id}/vote'
type ProposePath = '/api/v3/galgames/{id}/tags'

export function useWorkTags(
  resource: WorkTagResource,
  id: number,
  initial: { likes: number; tag: { id: number; name: string; spoiler: boolean } }[],
) {
  const auth = useAuthStore()
  const all = ref<WorkTag[]>(
    initial.map(({ likes, tag }) => ({
      id: tag.id,
      name: tag.name,
      spoiler: tag.spoiler,
      likes: Math.max(likes, 1),
      mine: 0,
      proposed: false,
    })),
  )
  const ranked = computed(() =>
    all.value
      .filter(tag => tag.proposed || tag.likes >= 1)
      .map((tag, at) => ({ tag, at }))
      .sort((a, b) => b.tag.likes - a.tag.likes || a.at - b.at)
      .map(item => item.tag),
  )
  const shown = computed(() => ranked.value.filter(tag => !tag.spoiler))
  const spoilers = computed(() => ranked.value.filter(tag => tag.spoiler))

  async function load() {
    const votes = await hikariRequest<MinePath, 'get'>(
      `/api/v3/${resource}/{id}/tags/mine` as MinePath,
      { method: 'get', path: { id } },
    )
    for (const { tag, value } of votes) {
      const found = all.value.find(item => item.id === tag.id)
      if (found) {
        found.mine = value
        continue
      }
      all.value.push({
        id: tag.id,
        name: tag.name,
        spoiler: tag.spoiler,
        likes: Math.max(value, 0),
        mine: value,
        proposed: tag.pool_state === 'CANDIDATE',
      })
    }
  }

  async function vote(tag: WorkTag, value: 1 | -1) {
    const previous = tag.mine
    const next = previous === value ? 0 : value
    tag.mine = next
    tag.likes += next - previous
    try {
      await hikariRequest<VotePath, 'put'>(
        `/api/v3/${resource}/{id}/tags/{tag_id}/vote` as VotePath,
        {
          method: 'put',
          path: { id, tag_id: tag.id },
          body: { value: next },
        },
      )
    } catch {
      tag.mine = previous
      tag.likes -= next - previous
      return
    }
    if (tag.proposed && next !== 1) all.value = all.value.filter(item => item.id !== tag.id)
  }

  function voteOn(item: { id: number; name: string }) {
    const found = all.value.find(tag => tag.id === item.id)
    if (found) return found.mine === 1 ? undefined : vote(found, 1)
    const added: WorkTag = { ...item, likes: 0, mine: 0, proposed: false, spoiler: false }
    all.value.push(added)
    return vote(all.value[all.value.length - 1]!, 1)
  }

  async function propose(name: string) {
    await hikariRequest<ProposePath, 'post'>(`/api/v3/${resource}/{id}/tags` as ProposePath, {
      method: 'post',
      path: { id },
      body: { name },
    })
    await load()
  }

  onMounted(() => {
    if (auth.isAuthenticated) void load()
  })

  return { all, shown, spoilers, vote, voteOn, propose }
}

export type WorkTagsControl = ReturnType<typeof useWorkTags>
