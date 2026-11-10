import { readSearchQuery, searchRoute } from '~/features/search/results'

export default defineNuxtRouteMiddleware(to => {
  const raw = Array.isArray(to.query.search) ? to.query.search[0] : to.query.search
  const search = typeof raw === 'string' ? raw.trim() : ''
  if (!search) return
  const type = to.path.startsWith('/light-novels')
    ? 'light_novel'
    : to.path.startsWith('/mangas')
      ? 'manga'
      : 'galgame'
  return navigateTo(searchRoute(readSearchQuery({ q: search, types: type })), {
    redirectCode: 301,
  })
})
