import type { ReaderController } from '@ritojs/kit'
import type { LightboxItem } from '@hina-ui/vue'
import { onBeforeUnmount, ref, shallowRef, watch, type ShallowRef } from 'vue'

interface UseReaderImagePreviewOptions {
  controller: ShallowRef<ReaderController | null>
  suppressTap?: () => void
}

export function useReaderImagePreview(options: UseReaderImagePreviewOptions) {
  const open = ref(false)
  const items = shallowRef<LightboxItem[]>([])
  let unsubscribe: (() => void) | null = null

  function detach() {
    unsubscribe?.()
    unsubscribe = null
  }

  function attach(controller: ReaderController) {
    detach()
    unsubscribe = controller.on('imageClick', ({ src, alt, blobUrl }) => {
      options.suppressTap?.()
      const displaySrc = blobUrl ?? src
      if (!displaySrc) return

      items.value = [
        { id: `reader-image:${src || displaySrc}`, src: displaySrc, alt: alt || '插图' },
      ]
      open.value = true
    })
  }

  watch(
    () => options.controller.value,
    controller => {
      if (controller) attach(controller)
      else detach()
    },
    { immediate: true },
  )

  onBeforeUnmount(detach)

  return { open, items }
}
