import { stageTone } from './tone'

export function usePageTone(
  hash: MaybeRefOrGetter<string | null | undefined>,
  options: { paper?: boolean; enabled?: boolean } = {},
) {
  const enabled = options.enabled !== false
  useHead({
    htmlAttrs: {
      'data-page-tone': enabled ? (options.paper ? 'paper' : 'stage') : undefined,
      style: computed(() =>
        enabled
          ? Object.entries(stageTone(toValue(hash)))
              .map(([key, value]) => `${key}:${value}`)
              .join(';')
          : undefined,
      ),
    },
  })
}
