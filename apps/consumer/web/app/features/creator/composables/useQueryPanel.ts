export function useQueryPanel(name: string, value = '1') {
  const route = useRoute()
  const router = useRouter()
  const nav = useTabNav()
  const active = usePageActive()

  return computed({
    get: () => active.value && route.query[name] === value,
    set: open => {
      const { [name]: _current, ...query } = route.query
      if (open) void router.push({ query: { ...query, [name]: value } })
      else void nav.dismiss({ path: route.path, query, hash: route.hash })
    },
  })
}
