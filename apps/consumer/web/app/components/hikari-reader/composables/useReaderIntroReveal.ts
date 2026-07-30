import { watch, type Ref } from 'vue'

/**
 * Show the reader UI once when the reader first becomes loaded, then never again
 * for this session. Useful for confirming book metadata / progress before fading
 * back into immersive reading.
 */
export function useReaderIntroReveal(isLoaded: Ref<boolean>, showIntro: () => void) {
  let shown = false
  watch(
    isLoaded,
    loaded => {
      if (loaded && !shown) {
        shown = true
        showIntro()
      }
    },
    { immediate: true },
  )
}
