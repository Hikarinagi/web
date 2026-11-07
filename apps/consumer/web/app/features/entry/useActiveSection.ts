const SECTION_MARGIN = '-140px 0px -55% 0px'

export function useActiveSection(ids: MaybeRefOrGetter<string[]>) {
  const active = ref(toValue(ids)[0] ?? '')
  const targets = shallowRef<HTMLElement[]>([])
  const seen = new Map<string, number>()

  function collect() {
    targets.value = toValue(ids).flatMap(id => document.getElementById(id) ?? [])
  }

  onMounted(collect)
  watch(() => toValue(ids), collect, { flush: 'post' })

  useIntersectionObserver(
    targets,
    entries => {
      for (const entry of entries)
        seen.set(entry.target.id, entry.isIntersecting ? entry.boundingClientRect.top : Infinity)
      const visible = toValue(ids).find(id => (seen.get(id) ?? Infinity) !== Infinity)
      if (visible) active.value = visible
    },
    { rootMargin: SECTION_MARGIN },
  )

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return { active, go }
}
