import type { EditorTargetPageData } from '~~/server/api/pages/entries/[id]/target.get'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const id = String(to.params.id)
  if (from.fullPath !== to.fullPath && from.name === to.name && String(from.params.id) === id)
    return
  const seq = useNavigationSeq()
  const ticket = seq.value
  const request = useRequestFetch()
  const found = await request<EditorTargetPageData>(`/api/pages/entries/${id}/target`).catch(
    () => null,
  )
  if (seq.value !== ticket) return abortNavigation()
  if (found?.target) return navigateTo({ path: found.target, query: to.query, hash: to.hash })
})
