import { stageTone } from './tone'

export function usePageTone(
  hash: MaybeRefOrGetter<string | null | undefined>,
  options: { paper?: boolean; enabled?: boolean } = {},
) {
  const enabled = options.enabled !== false
  const kind = options.paper ? 'paper' : 'stage'
  const tone = computed(() => Object.entries(stageTone(toValue(hash))))
  useHead({
    htmlAttrs: {
      'data-page-tone': enabled ? kind : undefined,
      style: computed(() =>
        enabled ? tone.value.map(([key, value]) => `${key}:${value}`).join(';') : undefined,
      ),
    },
  })
  if (!enabled) return

  onMounted(() => {
    const root = document.documentElement
    root.dataset.pageTone = kind
    for (const [key, value] of tone.value) root.style.setProperty(key, value)
  })
  onBeforeUnmount(() => {
    const root = document.documentElement
    delete root.dataset.pageTone
    for (const [key] of tone.value) root.style.removeProperty(key)
  })
}
