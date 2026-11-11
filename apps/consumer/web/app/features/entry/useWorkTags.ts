import type { WorkTag, WorkTagResource } from '~/features/entry/tags'

type MinePath = '/api/v3/galgames/{id}/tags/mine'
type VotePath = '/api/v3/galgames/{id}/tags/{tag_id}/vote'
type ProposalsPath = '/api/v3/galgames/{id}/tags/proposals'
type CheckPath = '/api/v3/galgames/{id}/tags/proposals/check'
type ProposalPath = '/api/v3/galgames/{id}/tags/proposals/{proposal_id}'

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
    const [votes, proposals] = await Promise.all([
      hikariRequest<MinePath, 'get'>(`/api/v3/${resource}/{id}/tags/mine` as MinePath, {
        method: 'get',
        path: { id },
      }),
      hikariRequest<ProposalsPath, 'get'>(
        `/api/v3/${resource}/{id}/tags/proposals` as ProposalsPath,
        { method: 'get', path: { id } },
      ),
    ])
    const tags = all.value.filter(tag => !tag.proposed)
    for (const { tag, value } of votes) {
      const found = tags.find(item => item.id === tag.id)
      if (found) {
        found.mine = value
        continue
      }
      tags.push({
        id: tag.id,
        name: tag.name,
        spoiler: tag.spoiler,
        likes: Math.max(value, 0),
        mine: value,
        proposed: false,
      })
    }
    all.value = [
      ...tags,
      ...proposals.map(proposal => ({
        id: proposal.id,
        name: proposal.name,
        spoiler: false,
        likes: 1,
        mine: 1,
        proposed: true,
      })),
    ]
  }

  async function withdraw(tag: WorkTag) {
    await hikariRequest<ProposalPath, 'delete'>(
      `/api/v3/${resource}/{id}/tags/proposals/{proposal_id}` as ProposalPath,
      { method: 'delete', path: { id, proposal_id: tag.id } },
    )
    all.value = all.value.filter(item => item !== tag)
  }

  async function vote(tag: WorkTag, value: 1 | -1) {
    if (tag.proposed) return value === 1 ? withdraw(tag) : undefined
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
    }
  }

  function voteOn(item: { id: number; name: string }) {
    const found = all.value.find(tag => !tag.proposed && tag.id === item.id)
    if (found) return found.mine === 1 ? undefined : vote(found, 1)
    const added: WorkTag = { ...item, likes: 0, mine: 0, proposed: false, spoiler: false }
    all.value.push(added)
    return vote(all.value[all.value.length - 1]!, 1)
  }

  async function propose(name: string) {
    await hikariRequest<ProposalsPath, 'post'>(
      `/api/v3/${resource}/{id}/tags/proposals` as ProposalsPath,
      { method: 'post', path: { id }, body: { name } },
    )
    await load()
  }

  function check(name: string) {
    return hikariRequest<CheckPath, 'get'>(
      `/api/v3/${resource}/{id}/tags/proposals/check` as CheckPath,
      { method: 'get', path: { id }, query: { name } },
    )
  }

  onMounted(() => {
    if (auth.isAuthenticated) void load()
  })

  return { all, shown, spoilers, vote, voteOn, propose, check }
}

export type WorkTagsControl = ReturnType<typeof useWorkTags>
