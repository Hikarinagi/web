import type { ReaderController } from '@ritojs/kit'
import { onBeforeUnmount, watch, type ShallowRef } from 'vue'
import { useHikariImagePreview } from '~/components/ui/hikari-image/composables/usePreview'

interface UseReaderImagePreviewOptions {
  controller: ShallowRef<ReaderController | null>
  suppressTap?: () => void
}

export function useReaderImagePreview(options: UseReaderImagePreviewOptions) {
  const preview = useHikariImagePreview()
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

      preview.open(
        [
          {
            id: `reader-image:${src || displaySrc}`,
            displaySrc,
            originalSrc: displaySrc,
            alt,
            processing: false,
          },
        ],
        0,
      )
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
}
