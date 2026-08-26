/**
 * One-shot "how do I drive this reader" overlay state, remembered per device.
 * Each reader passes its own storage key so dismissing one does not silence
 * the other.
 */
export function useReaderEducation(storageKey: string) {
  const seen = useLocalStorage(storageKey, false)
  const mounted = useMounted()
  // `seen` reads as `false` during SSR, so gate on mount to keep the server
  // markup free of an overlay the client may immediately drop.
  const visible = computed(() => mounted.value && !seen.value)

  function dismiss() {
    seen.value = true
  }

  function replay() {
    seen.value = false
  }

  return { visible, dismiss, replay }
}
