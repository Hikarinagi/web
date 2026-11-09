import type { EditRedirectPageData } from '~~/server/api/pages/create/edit/[type]/[id].get'

export default defineNuxtRouteMiddleware(async to => {
  const seq = useNavigationSeq()
  const ticket = seq.value
  const request = useRequestFetch()
  const { target } = await request<EditRedirectPageData>(
    `/api/pages/create/edit/${String(to.params.type)}/${Number(to.params.id)}`,
  )
  if (seq.value !== ticket) return abortNavigation()
  return navigateTo({ path: target, query: to.query })
})
