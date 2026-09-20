import { useIntersectionObserver } from '@vueuse/core'

export function useActiveSection(ids: MaybeRefOrGetter<string[]>) {
  const active = ref('')
  const targets = ref<HTMLElement[]>([])
  const visible = new Set<string>()

  onMounted(() => {
    targets.value = toValue(ids)
      .map(id => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    active.value = toValue(ids)[0] ?? ''
  })

  useIntersectionObserver(
    targets,
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id)
        else visible.delete(entry.target.id)
      }
      const current = toValue(ids).find(id => visible.has(id))
      if (current) active.value = current
    },
    { rootMargin: '-88px 0px -60% 0px' },
  )

  return active
}
