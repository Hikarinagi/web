export function useQueryPanel(name: string, value = '1') {
  const route = useRoute()
  const nav = usePageNav()
  const active = usePageActive()

  return computed({
    get: () => active.value && route.query[name] === value,
    set: open => {
      if (open) void nav.query({ [name]: value })
      else void nav.close([name])
    },
  })
}
